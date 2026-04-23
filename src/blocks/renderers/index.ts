import type { ComponentType } from 'react';

import type { Block, BlockType } from '@/blocks/types';

import { AbilityKitBlock } from './AbilityKitBlock';
import { ArchetypeBlock } from './ArchetypeBlock';
import { BehaviorScriptBlock } from './BehaviorScriptBlock';
import { CounterMatrixBlock } from './CounterMatrixBlock';
import { FlowBlock } from './FlowBlock';
import { FormationBlock } from './FormationBlock';
import { FormationFitBlock } from './FormationFitBlock';
import { GraphBlock } from './GraphBlock';
import { NoteBlock } from './NoteBlock';
import { RiskNoteBlock } from './RiskNoteBlock';
import { StatProfileBlock } from './StatProfileBlock';
import { SynergyLinksBlock } from './SynergyLinksBlock';
import { TableBlock } from './TableBlock';
import { TradeoffBlock } from './TradeoffBlock';
import { UnitBlock } from './UnitBlock';
import { UpgradePathBlock } from './UpgradePathBlock';

export const rendererMap: Record<BlockType, ComponentType<{ block: Block }>> = {
  archetype: ArchetypeBlock,
  unit: UnitBlock,
  formation: FormationBlock,
  abilityKit: AbilityKitBlock,
  statProfile: StatProfileBlock,
  upgradePath: UpgradePathBlock,
  formationFit: FormationFitBlock,
  counterMatrix: CounterMatrixBlock,
  synergyLinks: SynergyLinksBlock,
  behaviorScript: BehaviorScriptBlock,
  riskNote: RiskNoteBlock,
  graph: GraphBlock,
  table: TableBlock,
  flow: FlowBlock,
  tradeoff: TradeoffBlock,
  note: NoteBlock,
};

export const blockTypeLabels: Record<BlockType, string> = {
  archetype: 'Archetype',
  unit: 'Unit',
  formation: 'Formation',
  abilityKit: 'Ability Kit',
  statProfile: 'Stat Profile',
  upgradePath: 'Upgrade Path',
  formationFit: 'Formation Fit',
  counterMatrix: 'Counter Matrix',
  synergyLinks: 'Synergy Links',
  behaviorScript: 'Behavior Script',
  riskNote: 'Risk Note',
  graph: 'Graph',
  table: 'Table',
  flow: 'Flow',
  tradeoff: 'Tradeoff',
  note: 'Note',
};

export const blockTypeIcons: Record<BlockType, string> = {
  archetype: 'shield',
  unit: 'unit',
  formation: 'formation',
  abilityKit: 'ability',
  statProfile: 'stat',
  upgradePath: 'upgrade',
  formationFit: 'formation',
  counterMatrix: 'matrix',
  synergyLinks: 'link',
  behaviorScript: 'behavior',
  riskNote: 'risk',
  graph: 'graph',
  table: 'table',
  flow: 'flow',
  tradeoff: 'sliders',
  note: 'note',
};
