import type { DomainManifest } from '@/domains/types';

import { UNIT_PLANNER_DEFAULTS, unitPlannerSections } from './plannerSchema';
import { unitSampleBlocks } from './sampleBlocks';

export const unitManifest: DomainManifest = {
  key: 'unit',
  name: 'Unit Creation Lab',
  description: 'Design individual units before placing them in parties - stats, abilities, roles, counters.',
  icon: 'target',
  installed: true,
  plannerSections: unitPlannerSections,
  acceptedContextTypes: ['notes', 'chat', 'spec', 'mixed'],
  outputBlockTypes: [
    'unit',
    'abilityKit',
    'statProfile',
    'counterMatrix',
    'upgradePath',
    'formationFit',
    'synergyLinks',
    'behaviorScript',
    'riskNote',
  ],
  defaultCanvasLayout: 'grid',
  sampleBlocks: unitSampleBlocks,
  backendRoute: '/v1/forge/unit/generate',
  theme: 'clean-studio',
  inferredFields: [
    'Baseline stats if blank',
    'Counter matrix from role + stats',
    'Upgrade tiers from power budget',
    'Silhouette note from role',
  ],
  plannerDefaults: UNIT_PLANNER_DEFAULTS,
};
