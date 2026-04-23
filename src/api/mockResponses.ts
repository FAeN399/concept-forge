import type { Block } from '@/blocks/types';
import { requireDomain } from '@/domains/registry';

export function mockBlocksForDomain(domain: string): Block[] {
  const now = Date.now();
  return requireDomain(domain).sampleBlocks.map((block) => ({
    ...block,
    createdAt: now,
    updatedAt: now,
  }));
}
