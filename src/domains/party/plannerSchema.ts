import type { PlannerSectionSchema } from '@/domains/types';

export const partyPlannerSections: PlannerSectionSchema[] = [
  { id: 'premise', title: 'Game premise & context', hint: 'Setting, tone, scale of combat, what the player cares about.', kind: 'text', defaultOpen: true },
  { id: 'size', title: 'Party size & constraints', hint: 'e.g. 5-8 unit squads, one commander, one relic.', kind: 'fields', defaultOpen: true, fields: [
    { id: 'min', label: 'Min units', kind: 'num' },
    { id: 'max', label: 'Max units', kind: 'num' },
    { id: 'commander', label: 'Commanders per squad', kind: 'num' },
    { id: 'constraints', label: 'Hard constraints', kind: 'chips' },
  ] },
  { id: 'formation', title: 'Formation layout', hint: 'Rows, zones, positional rules. Blank = let backend propose.', kind: 'formation', defaultOpen: true },
  { id: 'classes', title: 'Available classes', hint: 'Classes you want in v1. Add custom.', kind: 'chips', defaults: ['Guardian', 'Skirmisher', 'Field Medic', 'Hex Archer', 'Banner', 'Binder'], defaultOpen: true },
  { id: 'roles', title: 'Role categories', kind: 'chips', defaults: ['Anchor', 'Disruptor', 'Sustainer', 'Pressure', 'Utility'] },
  { id: 'synergy', title: 'Synergy rules', hint: 'How classes/roles amplify each other.', kind: 'text', defaultOpen: true },
  { id: 'behavior', title: 'Combat behavior', hint: 'How the squad acts semi-autonomously between player commands.', kind: 'text' },
  { id: 'equipment', title: 'Equipment & loadouts', kind: 'text' },
  { id: 'progression', title: 'Leveling & progression', kind: 'text' },
  { id: 'leader', title: 'Leader / captain effects', kind: 'text' },
  { id: 'relationships', title: 'Relationships & affinity', kind: 'text' },
  { id: 'goals', title: 'Design goals', kind: 'chips', defaults: ['Readable at a glance', 'Rewards planning', 'Distinct squad identities'] },
  { id: 'problems', title: "Problems I'm trying to solve", kind: 'text' },
  { id: 'avoid', title: 'Things to avoid', kind: 'chips', defaults: ['Lone-hero power fantasy', 'Build min-maxing traps'] },
];
