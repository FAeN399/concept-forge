import { create } from 'zustand';

import { BlocksSchema } from '@/blocks/schema';
import type { Block, UnitBlock } from '@/blocks/types';
import { applyAction, type BlockAction } from '@/canvas/blockActions';
import { listDomains } from '@/domains/registry';

type BlocksStore = {
  blocks: Block[];
  selectedBlockId: string | null;
  comparisonIds: string[];
  getBlocksForDomain: (domain: string) => Block[];
  getSelectedBlock: () => Block | null;
  getApprovedUnits: () => UnitBlock[];
  selectBlock: (id: string | null) => void;
  moveBlock: (id: string, position: { x: number; y: number }) => void;
  setBlocksForDomain: (domain: string, blocks: Block[]) => void;
  dispatchBlockAction: (action: BlockAction) => void;
};

const initialBlocks = BlocksSchema.parse(listDomains().flatMap((domain) => domain.sampleBlocks));

export const useBlocksStore = create<BlocksStore>((set, get) => ({
  blocks: initialBlocks,
  selectedBlockId: null,
  comparisonIds: [],
  getBlocksForDomain: (domain) => get().blocks.filter((block) => block.domain === domain && block.status !== 'archived'),
  getSelectedBlock: () => {
    const selectedBlockId = get().selectedBlockId;
    return get().blocks.find((block) => block.id === selectedBlockId) ?? null;
  },
  getApprovedUnits: () => get().blocks.filter((block): block is UnitBlock => (
    block.domain === 'unit' && block.status === 'approved' && block.type === 'unit'
  )),
  selectBlock: (id) => set({ selectedBlockId: id }),
  moveBlock: (id, position) => set((state) => ({
    blocks: state.blocks.map((block) => block.id === id ? { ...block, position, updatedAt: Date.now() } : block),
  })),
  setBlocksForDomain: (domain, blocks) => set((state) => {
    const validated = BlocksSchema.parse(blocks);
    return {
      blocks: [
        ...state.blocks.filter((block) => block.domain !== domain),
        ...validated,
      ],
      selectedBlockId: null,
      comparisonIds: state.comparisonIds.filter((id) => !state.blocks.some((block) => block.domain === domain && block.id === id)),
    };
  }),
  dispatchBlockAction: (action) => set((state) => {
    const next = applyAction({ blocks: state.blocks, comparisonIds: state.comparisonIds }, action);
    const selectedStillVisible = next.blocks.some((block) => block.id === state.selectedBlockId && block.status !== 'archived');
    return {
      blocks: next.blocks,
      comparisonIds: next.comparisonIds,
      selectedBlockId: selectedStillVisible ? state.selectedBlockId : null,
    };
  }),
}));
