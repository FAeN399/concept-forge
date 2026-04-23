import type {
  ArchetypeBlock,
  BehaviorScriptBlock,
  Block,
  FormationBlock,
  StatProfileBlock,
  UnitBlock,
} from '@/blocks/types';
import { parseScenarioConfig } from '../schema';
import { DEFAULT_SCENARIO } from '../scenarios/defaultScenario';
import type { BattleMappingNote, ScenarioConfig, ScenarioSourceBlock } from '../types';
import { applyPartyBlocksToScenario } from './fromPartyBlocks';
import { unitBlockToArchetype, unitCountForArchetype } from './fromUnitBlocks';

export type ConceptForgeBattleOptions = {
  seed?: number;
  scenarioName?: string;
  includeDraftUnits?: boolean;
};

function byTitleThenId(a: Block, b: Block): number {
  const title = a.title.localeCompare(b.title);
  return title === 0 ? a.id.localeCompare(b.id) : title;
}

function sourceBlock(block: Block): ScenarioSourceBlock {
  return {
    id: block.id,
    type: block.type,
    title: block.title,
    domain: block.domain,
    status: block.status,
  };
}

function uniqueSources(blocks: Block[], usedIds: Set<string>): ScenarioSourceBlock[] {
  return blocks
    .filter((block) => usedIds.has(block.id))
    .sort(byTitleThenId)
    .map(sourceBlock);
}

function selectUnitBlocks(blocks: Block[], includeDraftUnits: boolean): UnitBlock[] {
  return blocks
    .filter((block): block is UnitBlock => block.type === 'unit')
    .filter((block) => includeDraftUnits || block.status === 'approved')
    .sort(byTitleThenId);
}

export function buildScenarioFromConceptForgeBlocks(
  blocks: Block[],
  options: ConceptForgeBattleOptions = {},
): ScenarioConfig {
  const includeDraftUnits = options.includeDraftUnits ?? true;
  const unitBlocks = selectUnitBlocks(blocks, includeDraftUnits);
  const statProfiles = blocks.filter((block): block is StatProfileBlock => block.type === 'statProfile');
  const behaviors = blocks.filter((block): block is BehaviorScriptBlock => block.type === 'behaviorScript');
  const formations = blocks.filter((block): block is FormationBlock => block.type === 'formation');
  const archetypeBlocks = blocks.filter((block): block is ArchetypeBlock => block.type === 'archetype');
  const notes: BattleMappingNote[] = [];
  const usedIds = new Set<string>();

  if (unitBlocks.length === 0) {
    return parseScenarioConfig({
      ...structuredClone(DEFAULT_SCENARIO),
      name: options.scenarioName ?? 'Concept Forge fallback battle',
      seed: options.seed ?? DEFAULT_SCENARIO.seed,
      mappingNotes: [
        ...DEFAULT_SCENARIO.mappingNotes,
        {
          level: 'fallback',
          message: 'No Unit blocks were selected or approved; loaded the default sandbox scenario.',
        },
      ],
    });
  }

  const unitArchetypePairs = unitBlocks.map((unit) => {
    usedIds.add(unit.id);
    return {
      unit,
      archetype: unitBlockToArchetype(unit, {
        statProfiles,
        behaviors,
        usedIds,
        notes,
      }),
    };
  });

  const archetypes = Object.fromEntries(
    unitArchetypePairs.map(({ archetype }) => [archetype.id, archetype]),
  );

  const blueUnits = Object.fromEntries(
    unitArchetypePairs.map(({ unit, archetype }) => [archetype.id, unitCountForArchetype(unit)]),
  );
  const redUnits = Object.fromEntries(
    Object.entries(blueUnits).map(([id, count]) => [id, Math.max(1, count)]),
  );

  const baseScenario = parseScenarioConfig({
    name: options.scenarioName ?? `Concept Forge battle - ${unitBlocks.map((unit) => unit.title).join(', ')}`,
    seed: options.seed ?? 4242,
    arena: {
      width: 42,
      depth: 28,
    },
    archetypes,
    blue: {
      team: 'blue',
      spawn: { x: -13, z: 0 },
      spacing: 2.4,
      columns: Math.min(4, Math.max(1, unitBlocks.length)),
      units: blueUnits,
    },
    red: {
      team: 'red',
      spawn: { x: 13, z: 0 },
      spacing: 2.4,
      columns: Math.min(4, Math.max(1, unitBlocks.length)),
      units: redUnits,
    },
    sourceBlocks: [],
    mappingNotes: [],
  });

  const withParty = applyPartyBlocksToScenario(
    baseScenario,
    {
      formations,
      archetypes: archetypeBlocks,
    },
    notes,
    usedIds,
  );

  return parseScenarioConfig({
    ...withParty,
    sourceBlocks: uniqueSources(blocks, usedIds),
    mappingNotes: notes,
  });
}
