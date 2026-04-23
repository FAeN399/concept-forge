import { describe, expect, it } from 'vitest';
import {
  FIXED_TIME_STEP,
  createBattleRuntime,
  stepBattleRuntime,
} from '../engine/battleEngine';
import { cloneScenario, DEFAULT_SCENARIO } from '../scenarios/defaultScenario';

function simulateSeconds(seconds: number, runtime = createBattleRuntime(DEFAULT_SCENARIO)) {
  const scenario = cloneScenario(DEFAULT_SCENARIO);
  let nextRuntime = runtime;

  const steps = Math.ceil(seconds / FIXED_TIME_STEP);
  for (let index = 0; index < steps; index += 1) {
    nextRuntime = stepBattleRuntime(
      {
        ...nextRuntime,
        phase: 'running',
      },
      scenario,
      FIXED_TIME_STEP,
    );
    if (nextRuntime.phase === 'finished') {
      break;
    }
  }

  return nextRuntime;
}

describe('battle engine', () => {
  it('spawns deterministic layouts for the same scenario seed', () => {
    const scenarioA = cloneScenario(DEFAULT_SCENARIO);
    const scenarioB = cloneScenario(DEFAULT_SCENARIO);

    const runtimeA = createBattleRuntime(scenarioA);
    const runtimeB = createBattleRuntime(scenarioB);

    const positionsA = runtimeA.units.map((unit) => ({
      id: unit.id,
      x: Number(unit.position.x.toFixed(3)),
      z: Number(unit.position.z.toFixed(3)),
    }));
    const positionsB = runtimeB.units.map((unit) => ({
      id: unit.id,
      x: Number(unit.position.x.toFixed(3)),
      z: Number(unit.position.z.toFixed(3)),
    }));

    expect(positionsA).toEqual(positionsB);
  });

  it('finishes a simple duel with a winner or draw', () => {
    const scenario = cloneScenario(DEFAULT_SCENARIO);
    scenario.blue.units = { vanguard: 1, ranger: 0, bruiser: 0 };
    scenario.red.units = { vanguard: 1, ranger: 0, bruiser: 0 };
    scenario.blue.spawn = { x: -2.5, z: 0 };
    scenario.red.spawn = { x: 2.5, z: 0 };
    scenario.blue.columns = 1;
    scenario.red.columns = 1;

    let runtime = createBattleRuntime(scenario);

    for (let index = 0; index < 900; index += 1) {
      runtime = stepBattleRuntime(
        { ...runtime, phase: 'running' },
        scenario,
        FIXED_TIME_STEP,
      );

      if (runtime.phase === 'finished') {
        break;
      }
    }

    expect(runtime.phase).toBe('finished');
    expect(['blue', 'red', 'draw']).toContain(runtime.metrics.winner);
  });

  it('advances combat metrics over time', () => {
    const runtime = simulateSeconds(4);
    expect(runtime.metrics.blue.damageDealt + runtime.metrics.red.damageDealt).toBeGreaterThan(0);
  });

  it('accepts arbitrary archetype ids in scenario data', () => {
    const scenario = cloneScenario(DEFAULT_SCENARIO);
    scenario.archetypes = {
      'ward-anchor': {
        id: 'ward-anchor',
        label: 'Ward Anchor',
        shape: 'box',
        radius: 0.62,
        maxHealth: 140,
        moveSpeed: 3.2,
        attackDamage: 18,
        attackCooldown: 0.95,
        attackRange: 1.6,
        intent: 'hold',
      },
    };
    scenario.blue.units = { 'ward-anchor': 1 };
    scenario.red.units = { 'ward-anchor': 1 };
    scenario.blue.spawn = { x: -2.5, z: 0 };
    scenario.red.spawn = { x: 2.5, z: 0 };
    scenario.blue.columns = 1;
    scenario.red.columns = 1;

    const runtime = createBattleRuntime(scenario);

    expect(runtime.units).toHaveLength(2);
    expect(runtime.units[0]?.archetypeId).toBe('ward-anchor');
    expect(runtime.units[0]?.archetypeLabel).toBe('Ward Anchor');
  });
});
