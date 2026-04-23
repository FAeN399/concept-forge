import { describe, expect, it } from 'vitest';

import { unitSampleBlocks } from '@/domains/unit/sampleBlocks';
import { partySampleBlocks } from '@/domains/party/sampleBlocks';
import { createBattleRuntime, FIXED_TIME_STEP, stepBattleRuntime } from '../engine/battleEngine';
import { buildScenarioFromConceptForgeBlocks } from '../adapters/fromConceptForgeBlocks';
import { parseScenarioConfig } from '../schema';

function simulateOutcome(seed: number) {
  const blocks = [
    ...unitSampleBlocks.filter((block) => ['ub1', 'ub3', 'ub8'].includes(block.id)),
    ...partySampleBlocks.filter((block) => block.id === 'b3'),
  ];
  const scenario = buildScenarioFromConceptForgeBlocks(blocks, { seed });
  let runtime = createBattleRuntime(scenario);

  for (let index = 0; index < 120; index += 1) {
    runtime = stepBattleRuntime({ ...runtime, phase: 'running' }, scenario, FIXED_TIME_STEP);
  }

  return {
    scenario,
    units: runtime.units.map((unit) => ({
      id: unit.id,
      x: Number(unit.position.x.toFixed(3)),
      z: Number(unit.position.z.toFixed(3)),
      hp: Number(unit.health.toFixed(3)),
    })),
    metrics: runtime.metrics,
  };
}

describe('Concept Forge battle adapter', () => {
  it('creates a validated scenario with dynamic archetypes from Unit blocks', () => {
    const scenario = buildScenarioFromConceptForgeBlocks(
      unitSampleBlocks.filter((block) => ['ub1', 'ub3', 'ub8'].includes(block.id)),
      { seed: 777 },
    );

    expect(parseScenarioConfig(scenario)).toEqual(scenario);
    expect(scenario.archetypes['ward-anchor']?.label).toBe('Ward Anchor');
    expect(scenario.blue.units['ward-anchor']).toBeGreaterThan(0);
    expect(scenario.mappingNotes.some((note) => note.message.includes('StatProfile overrides'))).toBe(true);
  });

  it('records fallback notes when optional mapping blocks are missing', () => {
    const scenario = buildScenarioFromConceptForgeBlocks(
      unitSampleBlocks.filter((block) => block.id === 'ub1'),
      { seed: 42 },
    );

    expect(scenario.mappingNotes.some((note) => note.level === 'fallback')).toBe(true);
  });

  it('uses party formation blocks for spawn organization', () => {
    const scenario = buildScenarioFromConceptForgeBlocks(
      [
        ...unitSampleBlocks.filter((block) => ['ub1', 'ub3'].includes(block.id)),
        ...partySampleBlocks.filter((block) => block.id === 'b3'),
      ],
      { seed: 55 },
    );

    expect(scenario.blue.columns).toBe(3);
    expect(scenario.red.columns).toBe(3);
    expect(scenario.sourceBlocks.some((block) => block.id === 'b3')).toBe(true);
  });

  it('is deterministic for the same source blocks and seed', () => {
    expect(simulateOutcome(909)).toEqual(simulateOutcome(909));
  });
});
