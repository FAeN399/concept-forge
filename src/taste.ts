export const DESIGN_TASTE = {
  principles: [
    'silhouette equals tactic',
    'semi-autonomous battle behavior - intent verbs drive action',
    'leader fall inheritance matters',
    'clean premium creative software UI',
    'partial information is first-class',
    'custom fields first-class',
  ],
  partySize: { sweet: 5, busyAt: 6, min: 3, max: 8 },
  intentVerbs: ['hold', 'press', 'flank', 'fallback', 'harass'],
  rowGrammar: ['front', 'mid', 'back'],
  backRowRule: 'back row cannot be targeted unless front is gone',
  avoid: [
    'trap-option classes that only work at endgame',
    'single-stat builds',
    'lone-hero power fantasy',
    'build min-maxing traps',
  ],
  inspiration: {
    vibe: 'Ogre Battle',
    classDepth: 'FFT job system',
    mustNotCopy: ['names', 'tarot system', 'exact mechanics', 'UI elements'],
  },
  uiPrinciples: [
    'clean first screen, not marketing',
    'move between structured and freeform freely',
    'polish through composition and spacing, not decoration',
  ],
} as const;
