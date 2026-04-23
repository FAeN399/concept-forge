import type { BattleMappingNote, ScenarioConfig } from '../types';
import type { ArchetypeBlock, FormationBlock } from '@/blocks/types';

export function applyPartyBlocksToScenario(
  scenario: ScenarioConfig,
  blocks: {
    formations: FormationBlock[];
    archetypes: ArchetypeBlock[];
  },
  notes: BattleMappingNote[],
  usedIds: Set<string>,
): ScenarioConfig {
  const next = structuredClone(scenario);
  const formation = blocks.formations[0];

  if (formation) {
    usedIds.add(formation.id);
    const maxSlots = Math.max(...formation.payload.rows.map((row) => row.slots.length), 1);
    const rowCount = Math.max(formation.payload.rows.length, 1);
    next.blue.columns = maxSlots;
    next.red.columns = maxSlots;
    next.blue.spacing = rowCount >= 3 ? 2.35 : 2.6;
    next.red.spacing = next.blue.spacing;
    notes.push({
      blockId: formation.id,
      level: 'info',
      message: `Formation "${formation.title}" set both armies to ${maxSlots} columns with ${next.blue.spacing} spacing.`,
    });
  } else {
    notes.push({
      level: 'fallback',
      message: 'No Party Formation block was selected; default columns and spacing were used.',
    });
  }

  const archetype = blocks.archetypes[0];
  if (archetype) {
    usedIds.add(archetype.id);
    notes.push({
      blockId: archetype.id,
      level: 'info',
      message: `Party archetype "${archetype.title}" was used as scenario context; role semantics stay in Concept Forge notes for now.`,
    });
  }

  return next;
}
