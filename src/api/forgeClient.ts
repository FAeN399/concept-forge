import { z } from 'zod';

import { BlockSchema, BlocksSchema, BlockTypeSchema } from '@/blocks/schema';

import { mockBlocksForDomain } from './mockResponses';

export const MOCK_MODE = true;

const SavedSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['raw', 'planner', 'mixed']),
  payload: z.unknown(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ForgeRequestSchema = z.object({
  domain: z.string(),
  mode: z.enum(['planner', 'raw', 'mixed']),
  planner: z.record(z.string(), z.unknown()),
  raw: z.string().nullable(),
  pins: z.array(BlockSchema),
  existingBlocks: z.array(BlockSchema),
  savedSources: z.array(SavedSourceSchema),
  crossDomainRefs: z.array(BlockSchema),
  preferences: z.object({
    variation: z.number().min(1).max(5),
    complexity: z.enum(['low', 'medium', 'high']),
    outputStyle: z.enum(['practical', 'exploratory', 'unusual']),
    desiredBlockTypes: z.array(BlockTypeSchema),
  }),
});

export const ForgeResponseSchema = z.object({
  blocks: BlocksSchema,
  warnings: z.array(BlockSchema),
  suggestedNextFields: z.array(z.string()),
  requestId: z.string(),
});

export type ForgeRequest = z.infer<typeof ForgeRequestSchema>;
export type ForgeResponse = z.infer<typeof ForgeResponseSchema>;

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export const forgeClient = {
  async generate(envelope: ForgeRequest): Promise<ForgeResponse> {
    const request = ForgeRequestSchema.parse(envelope);
    if (!MOCK_MODE) {
      throw new Error('Real backend mode is deferred until M4.');
    }
    await delay(1500);
    return ForgeResponseSchema.parse({
      blocks: mockBlocksForDomain(request.domain),
      warnings: [],
      suggestedNextFields: ['Clarify counterplay', 'Pin a comparison candidate'],
      requestId: `mock_${Date.now()}`,
    });
  },
};
