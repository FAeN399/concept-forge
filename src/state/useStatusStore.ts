import { create } from 'zustand';

type ForgeStatus = 'idle' | 'streaming' | 'error';

type StatusState = {
  status: ForgeStatus;
  message: string;
  step: number;
  totalSteps: number;
  error: string | null;
  start: (message?: string) => void;
  progress: (message: string, step?: number) => void;
  finish: (message?: string) => void;
  fail: (error: string) => void;
};

export const useStatusStore = create<StatusState>((set) => ({
  status: 'idle',
  message: 'Mock backend ready',
  step: 0,
  totalSteps: 3,
  error: null,
  start: (message = 'Preparing concept request') => set({ status: 'streaming', message, step: 1, totalSteps: 3, error: null }),
  progress: (message, step) => set((state) => ({ message, step: step ?? Math.min(state.step + 1, state.totalSteps) })),
  finish: (message = 'Concept blocks validated') => set({ status: 'idle', message, step: 0, error: null }),
  fail: (error) => set({ status: 'error', message: 'Generation failed', error, step: 0 }),
}));
