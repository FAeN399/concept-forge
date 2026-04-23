import type { z } from 'zod';

import type {
  ArmyConfigSchema,
  BattleMappingNoteSchema,
  ScenarioConfigSchema,
  ScenarioSourceBlockSchema,
  UnitArchetypeSchema,
  Vec2Schema,
} from './schema';

export type TeamId = 'blue' | 'red';
export type BattlePhase = 'idle' | 'running' | 'paused' | 'finished';
export type ArchetypeId = string;
export type UnitShape = 'box' | 'cylinder' | 'sphere';

export type Vec2 = z.infer<typeof Vec2Schema>;
export type UnitArchetype = z.infer<typeof UnitArchetypeSchema>;
export type ArmyConfig = z.infer<typeof ArmyConfigSchema>;
export type ScenarioSourceBlock = z.infer<typeof ScenarioSourceBlockSchema>;
export type BattleMappingNote = z.infer<typeof BattleMappingNoteSchema>;
export type ScenarioConfig = z.infer<typeof ScenarioConfigSchema>;

export interface UnitState {
  id: string;
  team: TeamId;
  archetypeId: ArchetypeId;
  archetypeLabel: string;
  shape: UnitShape;
  color: string;
  radius: number;
  position: Vec2;
  velocity: Vec2;
  facing: number;
  health: number;
  maxHealth: number;
  attackDamage: number;
  attackCooldown: number;
  attackRange: number;
  moveSpeed: number;
  cooldownRemaining: number;
  alive: boolean;
  targetId: string | null;
  attacksLanded: number;
  damageDealt: number;
  damageTaken: number;
}

export interface TeamMetrics {
  alive: number;
  total: number;
  damageDealt: number;
  kills: number;
}

export interface BattleMetrics {
  blue: TeamMetrics;
  red: TeamMetrics;
  elapsedSeconds: number;
  winner: TeamId | 'draw' | null;
}

export interface BattleLogEntry {
  id: string;
  time: number;
  type: 'spawn' | 'death' | 'winner' | 'reset';
  actorId?: string;
  targetId?: string;
  text: string;
}

export interface BattleRuntime {
  time: number;
  phase: BattlePhase;
  units: UnitState[];
  metrics: BattleMetrics;
  log: BattleLogEntry[];
}
