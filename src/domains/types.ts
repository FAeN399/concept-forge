import type { Block, BlockType } from '@/blocks/types';

export type ContextType = 'notes' | 'chat' | 'spec' | 'mixed';
export type CanvasLayoutMode = 'free' | 'grid' | 'compare';

export type FieldSchema =
  | { id: string; label: string; kind: 'text' }
  | { id: string; label: string; kind: 'num' }
  | { id: string; label: string; kind: 'chips' };

export type PlannerSectionSchema =
  | { id: string; title: string; hint?: string; kind: 'text'; defaultOpen?: boolean }
  | { id: string; title: string; hint?: string; kind: 'chips'; defaults?: string[]; defaultOpen?: boolean }
  | { id: string; title: string; hint?: string; kind: 'fields'; fields: FieldSchema[]; defaultOpen?: boolean }
  | { id: string; title: string; hint?: string; kind: 'formation'; defaultOpen?: boolean }
  | { id: string; title: string; hint?: string; kind: 'stats'; defaultOpen?: boolean }
  | { id: string; title: string; hint?: string; kind: 'abilities'; mode: 'active' | 'passive'; defaultOpen?: boolean };

export type DomainManifest = {
  key: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
  active?: boolean;
  plannerSections: PlannerSectionSchema[];
  acceptedContextTypes: ContextType[];
  outputBlockTypes: BlockType[];
  defaultCanvasLayout: CanvasLayoutMode;
  sampleBlocks: Block[];
  backendRoute: string;
  theme?: string;
  inferredFields?: string[];
  unitSuggestionSectionIds?: string[];
  plannerDefaults?: Record<string, unknown>;
};
