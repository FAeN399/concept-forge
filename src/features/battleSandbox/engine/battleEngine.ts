import {
  TEAM_COLORS,
} from '../scenarios/defaultScenario';
import type {
  ArmyConfig,
  BattleMetrics,
  BattleRuntime,
  ScenarioConfig,
  UnitState,
  Vec2,
} from '../types';
import { jitter, mulberry32 } from './rng';

export const FIXED_TIME_STEP = 1 / 30;
const LOG_LIMIT = 40;
const EPSILON = 0.00001;

interface QueuedAttack {
  actorId: string;
  targetId: string;
  damage: number;
}

export function createBattleRuntime(
  scenario: ScenarioConfig,
  phase: BattleRuntime['phase'] = 'idle',
): BattleRuntime {
  const units = [
    ...spawnArmy(scenario, scenario.blue, scenario.seed ^ 0x11f3ab6),
    ...spawnArmy(scenario, scenario.red, scenario.seed ^ 0x7ac912d),
  ];

  return {
    time: 0,
    phase,
    units,
    metrics: computeMetrics(units, 0),
    log: [
      {
        id: 'reset-0',
        time: 0,
        type: 'reset',
        text: `Loaded scenario "${scenario.name}"`,
      },
    ],
  };
}

export function stepBattleRuntime(
  runtime: BattleRuntime,
  scenario: ScenarioConfig,
  deltaSeconds: number,
): BattleRuntime {
  if (runtime.phase === 'finished') {
    return runtime;
  }

  const units = runtime.units.map(cloneUnit);
  const attacks: QueuedAttack[] = [];
  const blueAlive = units.filter((unit) => unit.alive && unit.team === 'blue');
  const redAlive = units.filter((unit) => unit.alive && unit.team === 'red');

  for (const unit of units) {
    if (!unit.alive) {
      continue;
    }

    unit.cooldownRemaining = Math.max(0, unit.cooldownRemaining - deltaSeconds);

    const enemies = unit.team === 'blue' ? redAlive : blueAlive;
    const target = findNearestEnemy(unit, enemies);
    unit.targetId = target?.id ?? null;

    if (!target) {
      unit.velocity = { x: 0, z: 0 };
      continue;
    }

    const toTarget = {
      x: target.position.x - unit.position.x,
      z: target.position.z - unit.position.z,
    };
    const distance = Math.max(EPSILON, Math.hypot(toTarget.x, toTarget.z));
    const direction = {
      x: toTarget.x / distance,
      z: toTarget.z / distance,
    };

    unit.facing = Math.atan2(direction.x, direction.z);

    const desiredDistance = Math.max(
      0,
      unit.attackRange + target.radius * 0.5 - unit.radius * 0.35,
    );

    if (distance <= desiredDistance + unit.radius * 0.2) {
      unit.velocity = { x: 0, z: 0 };
      if (unit.cooldownRemaining <= 0) {
        attacks.push({
          actorId: unit.id,
          targetId: target.id,
          damage: unit.attackDamage,
        });
        unit.cooldownRemaining = unit.attackCooldown;
      }
      continue;
    }

    const distanceToAdvance = Math.min(
      unit.moveSpeed * deltaSeconds,
      Math.max(0, distance - desiredDistance),
    );

    unit.velocity = {
      x: direction.x * unit.moveSpeed,
      z: direction.z * unit.moveSpeed,
    };

    unit.position.x += direction.x * distanceToAdvance;
    unit.position.z += direction.z * distanceToAdvance;
  }

  resolveOverlap(units);
  clampUnitsToArena(units, scenario.arena.width, scenario.arena.depth);

  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const nextLog = runtime.log.slice();

  for (const attack of attacks) {
    const actor = byId.get(attack.actorId);
    const target = byId.get(attack.targetId);

    if (!actor || !target || !target.alive) {
      continue;
    }

    target.health = Math.max(0, target.health - attack.damage);
    target.damageTaken += attack.damage;
    actor.damageDealt += attack.damage;
    actor.attacksLanded += 1;

    if (target.health <= 0) {
      target.alive = false;
      target.velocity = { x: 0, z: 0 };
      target.targetId = null;
      nextLog.push({
        id: `death-${runtime.time.toFixed(3)}-${target.id}`,
        time: runtime.time + deltaSeconds,
        type: 'death',
        actorId: actor.id,
        targetId: target.id,
        text: `${labelUnit(actor)} defeated ${labelUnit(target)}`,
      });
    }
  }

  const nextTime = runtime.time + deltaSeconds;
  const metrics = computeMetrics(units, nextTime);
  let nextPhase: BattleRuntime['phase'] =
    metrics.winner === null ? runtime.phase : 'finished';

  if (metrics.winner !== null) {
    nextLog.push({
      id: `winner-${nextTime.toFixed(3)}`,
      time: nextTime,
      type: 'winner',
      text:
        metrics.winner === 'draw'
          ? 'Battle ended in a draw'
          : `${metrics.winner.toUpperCase()} won the battle`,
    });
  }

  return {
    time: nextTime,
    phase: nextPhase,
    units,
    metrics,
    log: nextLog.slice(-LOG_LIMIT),
  };
}

function spawnArmy(
  scenario: ScenarioConfig,
  army: ArmyConfig,
  seed: number,
): UnitState[] {
  const rng = mulberry32(seed);
  const archetypeOrder = Object.keys(army.units).filter((archetypeId) => {
    const count = army.units[archetypeId] ?? 0;
    return count > 0 && scenario.archetypes[archetypeId];
  });
  const totalUnits = archetypeOrder.reduce(
    (sum, archetypeId) => sum + (army.units[archetypeId] ?? 0),
    0,
  );
  const totalRows = Math.max(1, Math.ceil(totalUnits / Math.max(1, army.columns)));

  const units: UnitState[] = [];
  let slot = 0;

  for (const archetypeId of archetypeOrder) {
    const count = army.units[archetypeId] ?? 0;
    const archetype = scenario.archetypes[archetypeId];
    if (!archetype) {
      continue;
    }

    for (let index = 0; index < count; index += 1) {
      const column = slot % Math.max(1, army.columns);
      const row = Math.floor(slot / Math.max(1, army.columns));
      const x =
        army.spawn.x +
        (column - (Math.max(1, army.columns) - 1) / 2) * army.spacing +
        jitter(rng, army.spacing * 0.08);
      const z =
        army.spawn.z +
        (row - (totalRows - 1) / 2) * army.spacing +
        jitter(rng, army.spacing * 0.08);

      const position = clampPosition(
        { x, z },
        archetype.radius,
        scenario.arena.width,
        scenario.arena.depth,
      );

      units.push({
        id: `${army.team}-${archetypeId}-${index + 1}`,
        team: army.team,
        archetypeId,
        archetypeLabel: archetype.label,
        shape: archetype.shape,
        color: TEAM_COLORS[army.team],
        radius: archetype.radius,
        position,
        velocity: { x: 0, z: 0 },
        facing: army.team === 'blue' ? Math.PI / 2 : -Math.PI / 2,
        health: archetype.maxHealth,
        maxHealth: archetype.maxHealth,
        attackDamage: archetype.attackDamage,
        attackCooldown: archetype.attackCooldown,
        attackRange: archetype.attackRange,
        moveSpeed: archetype.moveSpeed,
        cooldownRemaining: 0,
        alive: true,
        targetId: null,
        attacksLanded: 0,
        damageDealt: 0,
        damageTaken: 0,
      });

      slot += 1;
    }
  }

  return units;
}

function cloneUnit(unit: UnitState): UnitState {
  return {
    ...unit,
    position: { ...unit.position },
    velocity: { ...unit.velocity },
  };
}

function computeMetrics(
  units: UnitState[],
  elapsedSeconds: number,
): BattleMetrics {
  const blueUnits = units.filter((unit) => unit.team === 'blue');
  const redUnits = units.filter((unit) => unit.team === 'red');

  const blueAlive = blueUnits.filter((unit) => unit.alive).length;
  const redAlive = redUnits.filter((unit) => unit.alive).length;

  let winner: BattleMetrics['winner'] = null;
  if (blueAlive === 0 && redAlive === 0) {
    winner = 'draw';
  } else if (redAlive === 0) {
    winner = 'blue';
  } else if (blueAlive === 0) {
    winner = 'red';
  }

  return {
    blue: {
      alive: blueAlive,
      total: blueUnits.length,
      damageDealt: sum(blueUnits.map((unit) => unit.damageDealt)),
      kills: redUnits.length - redAlive,
    },
    red: {
      alive: redAlive,
      total: redUnits.length,
      damageDealt: sum(redUnits.map((unit) => unit.damageDealt)),
      kills: blueUnits.length - blueAlive,
    },
    elapsedSeconds,
    winner,
  };
}

function findNearestEnemy(unit: UnitState, enemies: UnitState[]): UnitState | null {
  let nearest: UnitState | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

    const distance = distanceBetween(unit.position, enemy.position);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = enemy;
    }
  }

  return nearest;
}

function resolveOverlap(units: UnitState[]): void {
  const livingUnits = units.filter((unit) => unit.alive);

  for (let i = 0; i < livingUnits.length; i += 1) {
    for (let j = i + 1; j < livingUnits.length; j += 1) {
      const a = livingUnits[i];
      const b = livingUnits[j];
      if (!a || !b) {
        continue;
      }
      const dx = b.position.x - a.position.x;
      const dz = b.position.z - a.position.z;
      const distance = Math.max(EPSILON, Math.hypot(dx, dz));
      const minDistance = a.radius + b.radius;

      if (distance >= minDistance) {
        continue;
      }

      const overlap = (minDistance - distance) * 0.5;
      const nx = dx / distance;
      const nz = dz / distance;

      a.position.x -= nx * overlap;
      a.position.z -= nz * overlap;
      b.position.x += nx * overlap;
      b.position.z += nz * overlap;
    }
  }
}

function clampUnitsToArena(
  units: UnitState[],
  arenaWidth: number,
  arenaDepth: number,
): void {
  for (const unit of units) {
    unit.position = clampPosition(unit.position, unit.radius, arenaWidth, arenaDepth);
  }
}

function clampPosition(
  position: Vec2,
  radius: number,
  arenaWidth: number,
  arenaDepth: number,
): Vec2 {
  const halfWidth = arenaWidth / 2 - radius;
  const halfDepth = arenaDepth / 2 - radius;

  return {
    x: clamp(position.x, -halfWidth, halfWidth),
    z: clamp(position.z, -halfDepth, halfDepth),
  };
}

function distanceBetween(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function labelUnit(unit: UnitState): string {
  return `${unit.team.toUpperCase()} ${unit.archetypeLabel} ${unit.id.split('-').pop()}`;
}
