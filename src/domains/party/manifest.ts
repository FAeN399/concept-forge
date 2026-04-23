import type { DomainManifest } from '@/domains/types';

import { partyPlannerSections } from './plannerSchema';
import { partySampleBlocks } from './sampleBlocks';

export const partyManifest: DomainManifest = {
  key: 'party',
  name: 'Party Management Lab',
  description: 'RPG & tactical party systems - squads, formations, synergies, leader effects.',
  icon: 'shield',
  installed: true,
  active: true,
  plannerSections: partyPlannerSections,
  acceptedContextTypes: ['notes', 'chat', 'spec', 'mixed'],
  outputBlockTypes: ['archetype', 'formation', 'graph', 'table', 'flow', 'tradeoff', 'note'],
  defaultCanvasLayout: 'free',
  sampleBlocks: partySampleBlocks,
  backendRoute: '/v1/forge/party/generate',
  theme: 'clean-studio',
  inferredFields: [
    'Formation zones if blank',
    'Role map from class list',
    'Leader archetype from premise tone',
    'Baseline tradeoffs per archetype',
  ],
  unitSuggestionSectionIds: ['classes'],
};
