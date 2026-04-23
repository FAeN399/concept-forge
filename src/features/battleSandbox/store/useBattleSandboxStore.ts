import { create } from 'zustand';

import {
  FIXED_TIME_STEP,
  createBattleRuntime,
  stepBattleRuntime,
} from '../engine/battleEngine';
import { parseScenarioConfig } from '../schema';
import {
  DEFAULT_SCENARIO,
  cloneScenario,
  getArchetypeOrder,
} from '../scenarios/defaultScenario';
import type { ScenarioConfig, TeamId } from '../types';

interface ViewOptions {
  showRanges: boolean;
  showHealthBars: boolean;
  showGrid: boolean;
}

interface BattleSandboxState {
  scenario: ScenarioConfig;
  runtime: ReturnType<typeof createBattleRuntime>;
  playbackSpeed: number;
  selectedUnitId: string | null;
  accumulator: number;
  view: ViewOptions;
  importError: string | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
  stepOneTick: () => void;
  advance: (deltaSeconds: number) => void;
  selectUnit: (id: string | null) => void;
  setPlaybackSpeed: (speed: number) => void;
  loadScenario: (scenario: ScenarioConfig) => void;
  updateScenarioName: (name: string) => void;
  updateSeed: (seed: number) => void;
  randomizeSeed: () => void;
  updateArena: (field: 'width' | 'depth', value: number) => void;
  updateArmyCount: (team: TeamId, archetypeId: string, count: number) => void;
  updateArmySetting: (
    team: TeamId,
    field: 'spacing' | 'columns',
    value: number,
  ) => void;
  updateArmySpawn: (team: TeamId, axis: 'x' | 'z', value: number) => void;
  toggleViewOption: (key: keyof ViewOptions) => void;
  importScenario: (json: string) => void;
}

function rebuildScenario(scenario: ScenarioConfig) {
  const validated = sanitizeScenario(scenario);
  return {
    scenario: validated,
    runtime: createBattleRuntime(validated),
    selectedUnitId: null,
    accumulator: 0,
    importError: null,
  };
}

function patchScenario(
  previous: ScenarioConfig,
  apply: (draft: ScenarioConfig) => void,
): ScenarioConfig {
  const next = cloneScenario(previous);
  apply(next);
  return sanitizeScenario(next);
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function sanitizeScenario(input: ScenarioConfig): ScenarioConfig {
  const parsed = parseScenarioConfig(input);
  const base = cloneScenario(parsed);
  const fallback = cloneScenario(DEFAULT_SCENARIO);

  base.name = base.name.trim().length > 0 ? base.name.trim() : fallback.name;
  base.seed = clampInt(base.seed, 1, 999999);
  base.arena.width = clampNumber(base.arena.width, 16, 120);
  base.arena.depth = clampNumber(base.arena.depth, 16, 120);

  (['blue', 'red'] as const).forEach((team) => {
    const targetArmy = base[team];

    targetArmy.team = team;
    targetArmy.spawn.x = clampNumber(
      toFiniteNumber(targetArmy.spawn.x, fallback[team].spawn.x),
      -base.arena.width / 2 + 2,
      base.arena.width / 2 - 2,
    );
    targetArmy.spawn.z = clampNumber(
      toFiniteNumber(targetArmy.spawn.z, fallback[team].spawn.z),
      -base.arena.depth / 2 + 2,
      base.arena.depth / 2 - 2,
    );
    targetArmy.spacing = clampNumber(targetArmy.spacing, 1.2, 6);
    targetArmy.columns = clampInt(targetArmy.columns, 1, 12);

    Object.keys(base.archetypes).forEach((archetypeId) => {
      targetArmy.units[archetypeId] = clampInt(
        toFiniteNumber(targetArmy.units[archetypeId], 0),
        0,
        100,
      );
    });

    Object.keys(targetArmy.units).forEach((archetypeId) => {
      if (!base.archetypes[archetypeId]) {
        delete targetArmy.units[archetypeId];
      }
    });
  });

  return parseScenarioConfig(base);
}

function parseImportedScenario(json: string): ScenarioConfig {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Scenario JSON is not valid JSON.');
  }

  return sanitizeScenario(parseScenarioConfig(parsed));
}

const initialScenario = cloneScenario(DEFAULT_SCENARIO);

export const useBattleSandboxStore = create<BattleSandboxState>((set) => ({
  scenario: initialScenario,
  runtime: createBattleRuntime(initialScenario),
  playbackSpeed: 1,
  selectedUnitId: null,
  accumulator: 0,
  importError: null,
  view: {
    showRanges: true,
    showHealthBars: true,
    showGrid: true,
  },

  start: () =>
    set((state) => {
      const runtime =
        state.runtime.phase === 'finished'
          ? createBattleRuntime(state.scenario, 'running')
          : { ...state.runtime, phase: 'running' as const };

      return {
        runtime,
        accumulator: 0,
      };
    }),

  pause: () =>
    set((state) => ({
      runtime:
        state.runtime.phase === 'running'
          ? { ...state.runtime, phase: 'paused' }
          : state.runtime,
    })),

  reset: () =>
    set((state) => ({
      ...rebuildScenario(state.scenario),
    })),

  stepOneTick: () =>
    set((state) => {
      if (state.runtime.phase === 'finished') {
        return state;
      }
      const runtime = stepBattleRuntime(
        {
          ...state.runtime,
          phase: 'running',
        },
        state.scenario,
        FIXED_TIME_STEP,
      );

      return {
        runtime:
          runtime.phase === 'finished' ? runtime : { ...runtime, phase: 'paused' },
        accumulator: 0,
      };
    }),

  advance: (deltaSeconds) =>
    set((state) => {
      if (state.runtime.phase !== 'running') {
        return state;
      }

      let accumulator =
        state.accumulator + deltaSeconds * clampNumber(state.playbackSpeed, 0.25, 4);
      let runtime = state.runtime;

      while (accumulator >= FIXED_TIME_STEP) {
        runtime = stepBattleRuntime(runtime, state.scenario, FIXED_TIME_STEP);
        accumulator -= FIXED_TIME_STEP;

        if (runtime.phase === 'finished') {
          accumulator = 0;
          break;
        }
      }

      return {
        runtime,
        accumulator,
      };
    }),

  selectUnit: (id) =>
    set(() => ({
      selectedUnitId: id,
    })),

  setPlaybackSpeed: (speed) =>
    set(() => ({
      playbackSpeed: clampNumber(speed, 0.25, 4),
    })),

  loadScenario: (scenario) =>
    set(() => ({
      ...rebuildScenario(scenario),
    })),

  updateScenarioName: (name) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft.name = name;
        }),
      ),
    })),

  updateSeed: (seed) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft.seed = seed;
        }),
      ),
    })),

  randomizeSeed: () =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft.seed = Math.floor(Math.random() * 999999) + 1;
        }),
      ),
    })),

  updateArena: (field, value) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft.arena[field] = value;
        }),
      ),
    })),

  updateArmyCount: (team, archetypeId, count) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft[team].units[archetypeId] = count;
        }),
      ),
    })),

  updateArmySetting: (team, field, value) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          if (field === 'columns') {
            draft[team].columns = value;
          } else {
            draft[team].spacing = value;
          }
        }),
      ),
    })),

  updateArmySpawn: (team, axis, value) =>
    set((state) => ({
      ...rebuildScenario(
        patchScenario(state.scenario, (draft) => {
          draft[team].spawn[axis] = value;
        }),
      ),
    })),

  toggleViewOption: (key) =>
    set((state) => ({
      view: {
        ...state.view,
        [key]: !state.view[key],
      },
    })),

  importScenario: (json) =>
    set(() => {
      try {
        const nextScenario = parseImportedScenario(json);
        return {
          ...rebuildScenario(nextScenario),
        };
      } catch (caughtError) {
        return {
          importError: caughtError instanceof Error ? caughtError.message : 'Import failed.',
        };
      }
    }),
}));

export function selectArchetypeIds(scenario: ScenarioConfig): string[] {
  return getArchetypeOrder(scenario);
}
