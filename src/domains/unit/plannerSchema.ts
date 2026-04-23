import type { PlannerSectionSchema } from '@/domains/types';

export const unitPlannerSections: PlannerSectionSchema[] = [
  { id: 'concept', title: 'Unit concept & fantasy', hint: 'One-line pitch. What does this unit feel like to command?', kind: 'text', defaultOpen: true },
  { id: 'role', title: 'Battlefield role', hint: 'Anchor, Pressure, Sustainer, Disruptor, Utility...', kind: 'chips', defaults: ['Anchor'], defaultOpen: true },
  { id: 'stats', title: 'Stat profile', hint: 'Base numbers. Leave blank for baseline.', kind: 'stats', defaultOpen: true },
  { id: 'movement', title: 'Movement & positioning', hint: 'Speed, terrain rules, zones this unit prefers.', kind: 'text' },
  { id: 'attack', title: 'Attack range & pattern', hint: 'Melee, ranged, AoE shape, falloff...', kind: 'fields', defaultOpen: true, fields: [
    { id: 'range', label: 'Range (tiles)', kind: 'num' },
    { id: 'shape', label: 'Pattern', kind: 'chips' },
    { id: 'falloff', label: 'Damage falloff', kind: 'chips' },
    { id: 'rate', label: 'Attacks per turn', kind: 'num' },
  ] },
  { id: 'targeting', title: 'Targeting behavior', hint: 'How it chooses targets when autonomous.', kind: 'text' },
  { id: 'active', title: 'Active abilities', hint: 'Named actions. Resource, cooldown, effect.', kind: 'abilities', mode: 'active', defaultOpen: true },
  { id: 'passive', title: 'Passive traits', hint: 'Always-on effects, triggers.', kind: 'abilities', mode: 'passive', defaultOpen: true },
  { id: 'loadout', title: 'Equipment & loadout rules', hint: 'Slots, restrictions, signature gear.', kind: 'text' },
  { id: 'upgrade', title: 'Leveling & upgrade path', hint: 'Growth arc and branching choices.', kind: 'text' },
  { id: 'fit', title: 'Formation fit', hint: 'Which rows / zones / archetypes it fits.', kind: 'chips', defaults: ['Front row'], defaultOpen: true },
  { id: 'synergy', title: 'Synergy tags', hint: 'What it amplifies or is amplified by.', kind: 'chips' },
  { id: 'counters', title: 'Counters & weaknesses', hint: 'What beats it, and why.', kind: 'text' },
  { id: 'silhouette', title: 'Readability / silhouette', hint: 'How the player reads it at a glance.', kind: 'text' },
  { id: 'risk', title: 'Implementation risk', hint: 'What could make this hard to ship well?', kind: 'fields', fields: [
    { id: 'level', label: 'Risk level', kind: 'chips' },
    { id: 'notes', label: 'Notes', kind: 'chips' },
  ] },
  { id: 'custom', title: 'Custom mechanics', hint: 'Bespoke rules not covered above.', kind: 'text' },
];

export const UNIT_PLANNER_DEFAULTS = {
  concept: 'A patient wall that dampens damage around it. Punishes impatience, not positioning.',
  role: ['Anchor'],
  stats: { hp: 4, atk: 2, def: 5, mov: 2, rng: 1 },
  movement: 'Slow (2 tiles). Prefers chokepoints. Cannot cross difficult terrain without Plant active.',
  attack: { range: 1, shape: ['Melee', 'Line +1'], falloff: ['None'], rate: 1 },
  targeting: 'Prioritize the highest-threat enemy adjacent to a protected ally.',
  fit: ['Front - Center', 'Anchor in Anvil formations'],
  synergy: ['Banner auras', 'Area heals', 'Ground-denial'],
  counters: 'Displacement, true damage, silence. Flankers exploit pivot cost.',
  silhouette: 'Broad silhouette, tower shield dominates frame. Low helm, heavy plate.',
  risk: { level: ['Medium'], notes: ['Pivot animation cost', 'Aura VFX'] },
} as const;
