import type { z } from 'zod';

import type {
  AbilityKitBlockSchema,
  ArchetypeBlockSchema,
  BehaviorScriptBlockSchema,
  BlockRelationSchema,
  BlockSchema,
  BlockTypeSchema,
  CounterMatrixBlockSchema,
  FlowBlockSchema,
  FormationBlockSchema,
  FormationFitBlockSchema,
  GraphBlockSchema,
  NoteBlockSchema,
  RiskNoteBlockSchema,
  StatProfileBlockSchema,
  SynergyLinksBlockSchema,
  TableBlockSchema,
  TradeoffBlockSchema,
  UnitBlockSchema,
  UpgradePathBlockSchema,
} from './schema';

export type BlockType = z.infer<typeof BlockTypeSchema>;
export type BlockRelation = z.infer<typeof BlockRelationSchema>;
export type Block = z.infer<typeof BlockSchema>;

export type ArchetypeBlock = z.infer<typeof ArchetypeBlockSchema>;
export type UnitBlock = z.infer<typeof UnitBlockSchema>;
export type FormationBlock = z.infer<typeof FormationBlockSchema>;
export type AbilityKitBlock = z.infer<typeof AbilityKitBlockSchema>;
export type StatProfileBlock = z.infer<typeof StatProfileBlockSchema>;
export type GraphBlock = z.infer<typeof GraphBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type FlowBlock = z.infer<typeof FlowBlockSchema>;
export type TradeoffBlock = z.infer<typeof TradeoffBlockSchema>;
export type CounterMatrixBlock = z.infer<typeof CounterMatrixBlockSchema>;
export type UpgradePathBlock = z.infer<typeof UpgradePathBlockSchema>;
export type FormationFitBlock = z.infer<typeof FormationFitBlockSchema>;
export type SynergyLinksBlock = z.infer<typeof SynergyLinksBlockSchema>;
export type BehaviorScriptBlock = z.infer<typeof BehaviorScriptBlockSchema>;
export type RiskNoteBlock = z.infer<typeof RiskNoteBlockSchema>;
export type NoteBlock = z.infer<typeof NoteBlockSchema>;

export type BlockByType<TType extends BlockType> = Extract<Block, { type: TType }>;
