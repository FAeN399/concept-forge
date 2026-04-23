import { z } from 'zod';

import { BlockTypeSchema } from '@/blocks/schema';

export const TeamIdSchema = z.enum(['blue', 'red']);

export const Vec2Schema = z.object({
  x: z.number(),
  z: z.number(),
});

export const UnitArchetypeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  shape: z.enum(['box', 'cylinder', 'sphere']).default('box'),
  radius: z.number().positive(),
  maxHealth: z.number().positive(),
  moveSpeed: z.number().nonnegative(),
  attackDamage: z.number().nonnegative(),
  attackCooldown: z.number().positive(),
  attackRange: z.number().positive(),
  intent: z.string().optional(),
});

export const ArmyConfigSchema = z.object({
  team: TeamIdSchema,
  spawn: Vec2Schema,
  spacing: z.number().positive(),
  columns: z.number().int().positive(),
  units: z.record(z.string().min(1), z.number().int().nonnegative()),
});

export const ArenaConfigSchema = z.object({
  width: z.number().positive(),
  depth: z.number().positive(),
});

export const ScenarioSourceBlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema,
  title: z.string(),
  domain: z.string(),
  status: z.string(),
});

export const BattleMappingNoteSchema = z.object({
  blockId: z.string().optional(),
  level: z.enum(['info', 'fallback', 'unsupported']),
  message: z.string(),
});

export const ScenarioConfigSchema = z.object({
  name: z.string().min(1),
  seed: z.number().int(),
  arena: ArenaConfigSchema,
  archetypes: z.record(z.string().min(1), UnitArchetypeSchema),
  blue: ArmyConfigSchema,
  red: ArmyConfigSchema,
  sourceBlocks: z.array(ScenarioSourceBlockSchema).default([]),
  mappingNotes: z.array(BattleMappingNoteSchema).default([]),
}).superRefine((scenario, context) => {
  const archetypeIds = new Set(Object.keys(scenario.archetypes));
  if (archetypeIds.size === 0) {
    context.addIssue({
      code: 'custom',
      path: ['archetypes'],
      message: 'Scenario must define at least one archetype.',
    });
  }

  (['blue', 'red'] as const).forEach((team) => {
    Object.keys(scenario[team].units).forEach((archetypeId) => {
      if (!archetypeIds.has(archetypeId)) {
        context.addIssue({
          code: 'custom',
          path: [team, 'units', archetypeId],
          message: `Army references unknown archetype "${archetypeId}".`,
        });
      }
    });
  });
});

export const parseScenarioConfig = (input: unknown) => ScenarioConfigSchema.parse(input);
