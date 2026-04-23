import type {
  BattleMappingNote,
  UnitArchetype,
  UnitShape,
} from '../types';
import type {
  BehaviorScriptBlock,
  StatProfileBlock,
  UnitBlock,
} from '@/blocks/types';

const SUPPORTED_INTENTS = new Set(['hold', 'press', 'flank', 'fallback', 'harass']);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug.length > 0 ? slug : 'unit';
}

function shapeForRole(role: string): UnitShape {
  const lower = role.toLowerCase();
  if (lower.includes('anchor') || lower.includes('guardian') || lower.includes('wall')) {
    return 'box';
  }
  if (lower.includes('pressure') || lower.includes('skirm') || lower.includes('ranger')) {
    return 'cylinder';
  }
  return 'sphere';
}

function statProfileScores(blocks: StatProfileBlock[], unitName: string) {
  const profile = blocks.find((block) => block.payload.unitName === unitName);
  if (!profile) {
    return null;
  }

  const entries = new Map(profile.payload.stats.map((entry) => [entry.k.toLowerCase(), entry.v]));
  return {
    hp: entries.get('hp'),
    atk: entries.get('atk'),
    def: entries.get('def'),
    mov: entries.get('mov'),
    rng: entries.get('rng'),
  };
}

function behaviorIntent(blocks: BehaviorScriptBlock[], unitName: string, notes: BattleMappingNote[]): string | undefined {
  const behavior = blocks.find((block) => block.payload.unitName === unitName);
  if (!behavior) {
    return undefined;
  }

  const normalized = behavior.payload.intents.map((intent) => intent.toLowerCase());
  const supported = normalized.find((intent) => SUPPORTED_INTENTS.has(intent));
  const unsupported = normalized.filter((intent) => !SUPPORTED_INTENTS.has(intent));

  if (unsupported.length > 0) {
    notes.push({
      blockId: behavior.id,
      level: 'unsupported',
      message: `Unsupported behavior intents were retained as notes only: ${unsupported.join(', ')}.`,
    });
  }

  return supported;
}

export function unitBlockToArchetype(
  unit: UnitBlock,
  related: {
    statProfiles: StatProfileBlock[];
    behaviors: BehaviorScriptBlock[];
    usedIds: Set<string>;
    notes: BattleMappingNote[];
  },
): UnitArchetype {
  const profileStats = statProfileScores(related.statProfiles, unit.title);
  const stats = {
    hp: profileStats?.hp ?? unit.payload.stats.hp,
    atk: profileStats?.atk ?? unit.payload.stats.atk,
    def: profileStats?.def ?? unit.payload.stats.def,
    mov: profileStats?.mov ?? unit.payload.stats.mov,
    rng: profileStats?.rng ?? unit.payload.stats.rng,
  };

  if (profileStats) {
    const profile = related.statProfiles.find((block) => block.payload.unitName === unit.title);
    if (profile) {
      related.usedIds.add(profile.id);
      related.notes.push({
        blockId: profile.id,
        level: 'info',
        message: `StatProfile overrides were applied for ${unit.title}.`,
      });
    }
  } else {
    related.notes.push({
      blockId: unit.id,
      level: 'fallback',
      message: `No StatProfile block found for ${unit.title}; unit payload stats were used.`,
    });
  }

  const intent = behaviorIntent(related.behaviors, unit.title, related.notes);
  const behavior = related.behaviors.find((block) => block.payload.unitName === unit.title);
  if (behavior) {
    related.usedIds.add(behavior.id);
  }

  return {
    id: slugify(unit.title),
    label: unit.title,
    shape: shapeForRole(unit.payload.role),
    radius: clamp(0.42 + stats.def * 0.045 + stats.hp * 0.025, 0.42, 0.86),
    maxHealth: Math.round(52 + stats.hp * 20 + stats.def * 8),
    moveSpeed: Number(clamp(2.2 + stats.mov * 0.58, 2.2, 6.2).toFixed(2)),
    attackDamage: Math.round(8 + stats.atk * 6),
    attackCooldown: Number(clamp(1.18 - stats.atk * 0.055 + stats.rng * 0.025, 0.55, 1.45).toFixed(2)),
    attackRange: Number(clamp(1.1 + stats.rng * 1.18, 1.2, 8.5).toFixed(2)),
    intent,
  };
}

export function unitCountForArchetype(unit: UnitBlock): number {
  const tags = unit.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => tag.includes('front') || tag.includes('defensive'))) {
    return 2;
  }
  if (tags.some((tag) => tag.includes('support') || tag.includes('utility'))) {
    return 1;
  }
  return 2;
}
