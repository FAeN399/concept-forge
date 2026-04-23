import type { Block, BlockType, UnitBlock } from '@/blocks/types';
import { createId } from '@/util/id';

export type BlockAction =
  | { kind: 'pin'; id: string }
  | { kind: 'approve'; id: string }
  | { kind: 'archive'; id: string }
  | { kind: 'duplicate'; id: string }
  | { kind: 'compareAdd'; id: string }
  | { kind: 'sendToDomain'; id: string; targetDomain: string }
  | { kind: 'convert'; id: string; toType: BlockType }
  | { kind: 'remix'; ids: string[] }
  | { kind: 'variant'; id: string };

export type BlocksActionState = {
  blocks: Block[];
  comparisonIds: string[];
};

function updateBlock(blocks: Block[], id: string, update: (block: Block) => Block) {
  return blocks.map((block) => block.id === id ? update(block) : block);
}

function markUnitSent(block: UnitBlock, targetDomain: string): UnitBlock {
  const payload = targetDomain === 'party'
    ? { ...block.payload, approved: true, sentToParty: true }
    : { ...block.payload, approved: true };

  return {
    ...block,
    status: 'approved',
    updatedAt: Date.now(),
    payload,
  };
}

export function applyAction(state: BlocksActionState, action: BlockAction): BlocksActionState {
  switch (action.kind) {
    case 'pin':
      return {
        ...state,
        blocks: updateBlock(state.blocks, action.id, (block) => ({
          ...block,
          pinned: !block.pinned,
          updatedAt: Date.now(),
        })),
      };

    case 'approve':
      return {
        ...state,
        blocks: updateBlock(state.blocks, action.id, (block) => ({
          ...block,
          status: 'approved',
          updatedAt: Date.now(),
        })),
      };

    case 'archive':
      return {
        ...state,
        comparisonIds: state.comparisonIds.filter((id) => id !== action.id),
        blocks: updateBlock(state.blocks, action.id, (block) => ({
          ...block,
          status: 'archived',
          updatedAt: Date.now(),
        })),
      };

    case 'duplicate': {
      const source = state.blocks.find((block) => block.id === action.id);
      if (!source) {
        return state;
      }
      const now = Date.now();
      const duplicate: Block = {
        ...source,
        id: createId(source.type),
        title: `${source.title} copy`,
        status: 'draft',
        pinned: false,
        relations: [{ to: source.id, kind: 'derives-from' }],
        position: { x: source.position.x + 36, y: source.position.y + 36 },
        createdAt: now,
        updatedAt: now,
      };
      return { ...state, blocks: [...state.blocks, duplicate] };
    }

    case 'compareAdd':
      if (state.comparisonIds.includes(action.id)) {
        return state;
      }
      return { ...state, comparisonIds: [...state.comparisonIds, action.id] };

    case 'sendToDomain':
      return {
        ...state,
        blocks: updateBlock(state.blocks, action.id, (block) => {
          if (block.type !== 'unit') {
            return block;
          }
          return markUnitSent(block, action.targetDomain);
        }),
      };

    case 'convert':
    case 'remix':
    case 'variant':
      return state;

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
