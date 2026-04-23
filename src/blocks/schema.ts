import { z } from 'zod';

export const BlockTypeSchema = z.enum([
  'archetype',
  'unit',
  'formation',
  'abilityKit',
  'statProfile',
  'upgradePath',
  'formationFit',
  'counterMatrix',
  'synergyLinks',
  'behaviorScript',
  'riskNote',
  'graph',
  'table',
  'flow',
  'tradeoff',
  'note',
]);

export const BlockRelationSchema = z.object({
  to: z.string(),
  kind: z.enum(['references', 'counters', 'derives-from', 'same-archetype', 'referenced-by']),
  note: z.string().optional(),
});

export const BlockBaseSchema = z.object({
  id: z.string(),
  schemaVersion: z.literal(1),
  type: BlockTypeSchema,
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.6),
  status: z.enum(['draft', 'review', 'approved', 'archived']).default('draft'),
  pinned: z.boolean().default(false),
  relations: z.array(BlockRelationSchema).default([]),
  position: z.object({ x: z.number(), y: z.number() }),
  size: z.object({ width: z.number(), height: z.number() }).optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  domain: z.string(),
  payload: z.unknown(),
});

export const ArchetypePayloadSchema = z.object({
  tagline: z.string(),
  roles: z.array(z.object({
    name: z.string(),
    role: z.string(),
    count: z.number().int().positive(),
    color: z.string(),
  })),
  leader: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export const UnitPayloadSchema = z.object({
  role: z.string(),
  job: z.string(),
  silhouette: z.string(),
  approved: z.boolean().optional(),
  sentToParty: z.boolean().optional(),
  risk: z.string(),
  stats: z.object({
    hp: z.number(),
    atk: z.number(),
    def: z.number(),
    mov: z.number(),
    rng: z.number(),
  }),
});

export const FormationPayloadSchema = z.object({
  note: z.string(),
  rows: z.array(z.object({
    label: z.string(),
    slots: z.array(z.string()),
  })),
});

export const AbilityKitPayloadSchema = z.object({
  unitId: z.string(),
  unitName: z.string(),
  resource: z.string(),
  actives: z.array(z.object({
    name: z.string(),
    cost: z.string(),
    cd: z.string(),
    effect: z.string(),
    timing: z.string(),
  })),
  passives: z.array(z.object({
    name: z.string(),
    effect: z.string(),
  })),
  counters: z.array(z.string()),
});

export const StatProfilePayloadSchema = z.object({
  unitName: z.string(),
  stats: z.array(z.object({
    k: z.string(),
    v: z.number(),
    max: z.number(),
    base: z.number(),
    note: z.string(),
  })),
  power: z.number(),
  archetype: z.string(),
});

export const UpgradePathPayloadSchema = z.object({
  unitName: z.string(),
  stages: z.array(z.object({
    tier: z.string(),
    name: z.string(),
    req: z.string(),
    gives: z.array(z.string()),
    party: z.string(),
  })),
  branches: z.array(z.object({
    at: z.string(),
    choice: z.array(z.string()),
  })),
});

export const FormationFitPayloadSchema = z.object({
  unitName: z.string(),
  slots: z.array(z.object({
    row: z.string(),
    pos: z.string(),
    fit: z.number(),
    reason: z.string(),
  })),
  archetypes: z.array(z.object({
    name: z.string(),
    fit: z.string(),
  })),
});

export const CounterMatrixPayloadSchema = z.object({
  unitName: z.string(),
  matrix: z.array(z.object({
    vs: z.string(),
    score: z.number(),
    note: z.string(),
  })),
});

export const SynergyLinksPayloadSchema = z.object({
  unitName: z.string(),
  links: z.array(z.object({
    with: z.string(),
    kind: z.string(),
    why: z.string(),
  })),
});

export const BehaviorScriptPayloadSchema = z.object({
  unitName: z.string(),
  rules: z.array(z.object({
    when: z.string(),
    then: z.string(),
  })),
  intents: z.array(z.string()),
});

export const RiskNotePayloadSchema = z.object({
  unitName: z.string(),
  level: z.string(),
  factors: z.array(z.object({
    label: z.string(),
    weight: z.number(),
    note: z.string(),
  })),
  blockers: z.array(z.string()),
});

export const GraphPayloadSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
    x: z.number(),
    y: z.number(),
    role: z.string(),
  })),
  edges: z.array(z.tuple([z.string(), z.string(), z.string()])),
});

export const TablePayloadSchema = z.object({
  rows: z.array(z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))),
  cols: z.array(z.object({
    key: z.string(),
    label: z.string(),
  })),
});

export const FlowPayloadSchema = z.object({
  branches: z.array(z.object({
    trigger: z.string(),
    steps: z.array(z.string()),
  })),
});

export const TradeoffPayloadSchema = z.object({
  items: z.array(z.object({
    label: z.string(),
    value: z.number().min(0).max(1),
    k: z.string(),
  })),
  counters: z.array(z.string()),
});

export const NotePayloadSchema = z.object({
  body: z.string(),
});

export const ArchetypeBlockSchema = BlockBaseSchema.extend({
  type: z.literal('archetype'),
  payload: ArchetypePayloadSchema,
});

export const UnitBlockSchema = BlockBaseSchema.extend({
  type: z.literal('unit'),
  payload: UnitPayloadSchema,
});

export const FormationBlockSchema = BlockBaseSchema.extend({
  type: z.literal('formation'),
  payload: FormationPayloadSchema,
});

export const AbilityKitBlockSchema = BlockBaseSchema.extend({
  type: z.literal('abilityKit'),
  payload: AbilityKitPayloadSchema,
});

export const StatProfileBlockSchema = BlockBaseSchema.extend({
  type: z.literal('statProfile'),
  payload: StatProfilePayloadSchema,
});

export const UpgradePathBlockSchema = BlockBaseSchema.extend({
  type: z.literal('upgradePath'),
  payload: UpgradePathPayloadSchema,
});

export const FormationFitBlockSchema = BlockBaseSchema.extend({
  type: z.literal('formationFit'),
  payload: FormationFitPayloadSchema,
});

export const CounterMatrixBlockSchema = BlockBaseSchema.extend({
  type: z.literal('counterMatrix'),
  payload: CounterMatrixPayloadSchema,
});

export const SynergyLinksBlockSchema = BlockBaseSchema.extend({
  type: z.literal('synergyLinks'),
  payload: SynergyLinksPayloadSchema,
});

export const BehaviorScriptBlockSchema = BlockBaseSchema.extend({
  type: z.literal('behaviorScript'),
  payload: BehaviorScriptPayloadSchema,
});

export const RiskNoteBlockSchema = BlockBaseSchema.extend({
  type: z.literal('riskNote'),
  payload: RiskNotePayloadSchema,
});

export const GraphBlockSchema = BlockBaseSchema.extend({
  type: z.literal('graph'),
  payload: GraphPayloadSchema,
});

export const TableBlockSchema = BlockBaseSchema.extend({
  type: z.literal('table'),
  payload: TablePayloadSchema,
});

export const FlowBlockSchema = BlockBaseSchema.extend({
  type: z.literal('flow'),
  payload: FlowPayloadSchema,
});

export const TradeoffBlockSchema = BlockBaseSchema.extend({
  type: z.literal('tradeoff'),
  payload: TradeoffPayloadSchema,
});

export const NoteBlockSchema = BlockBaseSchema.extend({
  type: z.literal('note'),
  payload: NotePayloadSchema,
});

export const BlockSchema = z.discriminatedUnion('type', [
  ArchetypeBlockSchema,
  UnitBlockSchema,
  FormationBlockSchema,
  AbilityKitBlockSchema,
  StatProfileBlockSchema,
  UpgradePathBlockSchema,
  FormationFitBlockSchema,
  CounterMatrixBlockSchema,
  SynergyLinksBlockSchema,
  BehaviorScriptBlockSchema,
  RiskNoteBlockSchema,
  GraphBlockSchema,
  TableBlockSchema,
  FlowBlockSchema,
  TradeoffBlockSchema,
  NoteBlockSchema,
]);

export const BlocksSchema = z.array(BlockSchema);
