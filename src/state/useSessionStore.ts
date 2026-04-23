import { create } from 'zustand';

import { requireDomain } from '@/domains/registry';
import type { CanvasLayoutMode } from '@/domains/types';

export type WorkspaceView = 'planner' | 'raw';
export type WorkspaceMode = 'forge' | 'battle';
export type ThemeId = 'clean-studio' | 'war-room' | 'codex' | 'dev';
export type DensityId = 'comfortable' | 'compact';

type SessionState = {
  activeDomain: string;
  workspaceMode: WorkspaceMode;
  view: WorkspaceView;
  layoutByDomain: Record<string, CanvasLayoutMode>;
  theme: ThemeId;
  density: DensityId;
  setActiveDomain: (domain: string) => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setView: (view: WorkspaceView) => void;
  setLayout: (domain: string, layout: CanvasLayoutMode) => void;
  setTheme: (theme: ThemeId) => void;
  setDensity: (density: DensityId) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  activeDomain: 'party',
  workspaceMode: window.location.pathname === '/sandbox/battle' ? 'battle' : 'forge',
  view: 'planner',
  layoutByDomain: {
    party: 'free',
    unit: 'grid',
  },
  theme: 'clean-studio',
  density: 'comfortable',
  setActiveDomain: (domain) => {
    const manifest = requireDomain(domain);
    set((state) => ({
      activeDomain: domain,
      workspaceMode: 'forge',
      layoutByDomain: {
        ...state.layoutByDomain,
        [domain]: state.layoutByDomain[domain] ?? manifest.defaultCanvasLayout,
      },
    }));
    window.history.pushState(null, '', '/');
  },
  setWorkspaceMode: (mode) => {
    set({ workspaceMode: mode });
    window.history.pushState(null, '', mode === 'battle' ? '/sandbox/battle' : '/');
  },
  setView: (view) => set({ view }),
  setLayout: (domain, layout) => set((state) => ({
    layoutByDomain: { ...state.layoutByDomain, [domain]: layout },
  })),
  setTheme: (theme) => set({ theme }),
  setDensity: (density) => set({ density }),
}));

export const THEMES: ReadonlyArray<{ id: ThemeId; label: string; short: string }> = [
  { id: 'clean-studio', label: 'Clean Studio', short: 'Studio' },
  { id: 'war-room', label: 'War Room', short: 'War' },
  { id: 'codex', label: 'RPG Codex', short: 'Codex' },
  { id: 'dev', label: 'Dev Tool', short: 'Dev' },
];
