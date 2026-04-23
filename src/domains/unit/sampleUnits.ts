export type SampleUnit = {
  id: string;
  name: string;
  role: string;
  job: string;
  silhouette: string;
  approved: boolean;
  stats: { hp: number; atk: number; def: number; mov: number; rng: number };
  abilities: Array<{ name: string; kind: 'active' | 'passive'; cost?: string; desc: string }>;
  fits: string[];
  counters: string[];
  risk: string;
};

export const sampleUnits: SampleUnit[] = [
  {
    id: 'u1',
    name: 'Ward Anchor',
    role: 'Anchor',
    job: 'Front-line protector',
    silhouette: 'broad tower',
    approved: true,
    stats: { hp: 4, atk: 2, def: 5, mov: 2, rng: 1 },
    abilities: [
      { name: 'Anchor Stance', kind: 'passive', desc: 'Adjacent allies take -1 damage while Anchor holds position.' },
      { name: 'Guard Break', kind: 'active', cost: '2 Poise', desc: 'Taunt adjacent enemies, reduce their attack by 1 for 2 rounds.' },
    ],
    fits: ['Front row', 'Anvil formations'],
    counters: ['High mobility flankers', 'True damage'],
    risk: 'Low',
  },
  {
    id: 'u2',
    name: 'Thread Medic',
    role: 'Sustainer',
    job: 'Squad cohesion',
    silhouette: 'trailing ribbons',
    approved: false,
    stats: { hp: 3, atk: 1, def: 2, mov: 3, rng: 2 },
    abilities: [
      { name: 'Suture', kind: 'active', cost: '1 Focus', desc: 'Heal target ally for 2; if they share a Thread, heal both.' },
      { name: 'Cohesion', kind: 'passive', desc: 'Threaded allies gain +1 Poise.' },
    ],
    fits: ['Mid row', 'Support lines'],
    counters: ['Burst damage', 'Silencing effects'],
    risk: 'Medium',
  },
  {
    id: 'u3',
    name: 'Rift Skirmisher',
    role: 'Pressure',
    job: 'Mark & execute',
    silhouette: 'thin blade, cape',
    approved: false,
    stats: { hp: 2, atk: 4, def: 1, mov: 5, rng: 1 },
    abilities: [
      { name: 'Mark', kind: 'active', cost: '1 Focus', desc: 'Mark an enemy. Allies deal +25% to marked.' },
      { name: 'Slip', kind: 'passive', desc: 'After attacking, move 1 tile.' },
    ],
    fits: ['Flank', 'Chase parties'],
    counters: ['Stealth', 'Wide AoE'],
    risk: 'Medium',
  },
];
