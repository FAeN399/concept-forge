import type { Block } from '@/blocks/types';
import type { CanvasLayoutMode } from '@/domains/types';

export type LaidOutBlock = Block & {
  layoutPosition: { x: number; y: number };
  layoutSize: { width: number; height: number };
};

const DEFAULT_SIZE = { width: 340, height: 280 };
const COMPARE_TYPES = new Set(['archetype', 'table', 'tradeoff', 'unit', 'statProfile', 'counterMatrix']);

function withSize(block: Block, position = block.position, size = block.size ?? DEFAULT_SIZE): LaidOutBlock {
  return {
    ...block,
    layoutPosition: position,
    layoutSize: size,
  };
}

export function freeLayout(blocks: Block[]): LaidOutBlock[] {
  return blocks.map((block) => withSize(block));
}

export function gridLayout(blocks: Block[]): LaidOutBlock[] {
  const cell = { width: 370, height: 350 };
  return blocks.map((block, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return withSize(block, { x: 32 + col * cell.width, y: 32 + row * cell.height }, { width: 340, height: 320 });
  });
}

export function compareLayout(blocks: Block[]): LaidOutBlock[] {
  return blocks
    .filter((block) => COMPARE_TYPES.has(block.type))
    .map((block, index) => withSize(block, { x: 32 + index * 370, y: 32 }, { width: 350, height: 520 }));
}

export function layoutBlocks(blocks: Block[], mode: CanvasLayoutMode): LaidOutBlock[] {
  if (mode === 'grid') {
    return gridLayout(blocks);
  }
  if (mode === 'compare') {
    return compareLayout(blocks);
  }
  return freeLayout(blocks);
}
