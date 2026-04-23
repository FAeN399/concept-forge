import { parseScenarioConfig } from '../schema';
import type { ScenarioConfig, TeamId } from '../types';

export const TEAM_COLORS: Record<TeamId, string> = {
  blue: '#4f8fba',
  red: '#c75a4a',
};

const defaultScenario = {
  name: 'Default arena',
  seed: 42,
  arena: {
    width: 46,
    depth: 30,
  },
  archetypes: {
    vanguard: {
      id: 'vanguard',
      label: 'Vanguard',
      shape: 'box',
      radius: 0.56,
      maxHealth: 120,
      moveSpeed: 4.8,
      attackDamage: 18,
      attackCooldown: 0.85,
      attackRange: 1.6,
      intent: 'hold',
    },
    ranger: {
      id: 'ranger',
      label: 'Ranger',
      shape: 'cylinder',
      radius: 0.46,
      maxHealth: 78,
      moveSpeed: 4.2,
      attackDamage: 14,
      attackCooldown: 0.65,
      attackRange: 6.4,
      intent: 'harass',
    },
    bruiser: {
      id: 'bruiser',
      label: 'Bruiser',
      shape: 'sphere',
      radius: 0.74,
      maxHealth: 182,
      moveSpeed: 3.2,
      attackDamage: 30,
      attackCooldown: 1.1,
      attackRange: 1.9,
      intent: 'press',
    },
  },
  blue: {
    team: 'blue',
    spawn: { x: -14, z: 0 },
    spacing: 2.4,
    columns: 4,
    units: {
      vanguard: 10,
      ranger: 6,
      bruiser: 2,
    },
  },
  red: {
    team: 'red',
    spawn: { x: 14, z: 0 },
    spacing: 2.4,
    columns: 4,
    units: {
      vanguard: 10,
      ranger: 4,
      bruiser: 3,
    },
  },
  sourceBlocks: [],
  mappingNotes: [
    {
      level: 'info',
      message: 'Starter scenario uses built-in archetypes; Concept Forge scenarios can provide any validated archetype ids.',
    },
  ],
} satisfies ScenarioConfig;

export const DEFAULT_SCENARIO: ScenarioConfig = parseScenarioConfig(defaultScenario);

export function getArchetypeOrder(scenario: ScenarioConfig): string[] {
  return Object.keys(scenario.archetypes).sort((a, b) => {
    const labelA = scenario.archetypes[a]?.label ?? a;
    const labelB = scenario.archetypes[b]?.label ?? b;
    return labelA.localeCompare(labelB);
  });
}

export function cloneScenario(
  scenario: ScenarioConfig = DEFAULT_SCENARIO,
): ScenarioConfig {
  return parseScenarioConfig(structuredClone(scenario));
}
