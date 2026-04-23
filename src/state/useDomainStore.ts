import { create } from 'zustand';

import { listDomains } from '@/domains/registry';
import type { ContextType, PlannerSectionSchema } from '@/domains/types';

export type DomainPlannerValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export type CustomPlannerSection = {
  id: string;
  title: string;
  value: string;
};

type DomainInputState = {
  planner: Record<string, DomainPlannerValue>;
  customSections: CustomPlannerSection[];
  raw: string;
  contextType: ContextType;
  outputStyle: 'practical' | 'exploratory' | 'unusual';
  variation: number;
  complexity: number;
  desiredBlockTypes: string[];
  saveSource: boolean;
};

type DomainStore = {
  domains: Record<string, DomainInputState>;
  setPlannerValue: (domain: string, sectionId: string, value: DomainPlannerValue) => void;
  setRaw: (domain: string, raw: string) => void;
  setContextType: (domain: string, contextType: ContextType) => void;
  setOutputStyle: (domain: string, outputStyle: DomainInputState['outputStyle']) => void;
  setVariation: (domain: string, variation: number) => void;
  setComplexity: (domain: string, complexity: number) => void;
  setDesiredBlockTypes: (domain: string, types: string[]) => void;
  setSaveSource: (domain: string, saveSource: boolean) => void;
  addCustomSection: (domain: string) => void;
  renameCustomSection: (domain: string, id: string, title: string) => void;
  updateCustomSection: (domain: string, id: string, value: string) => void;
  removeCustomSection: (domain: string, id: string) => void;
};

function defaultValueForSection(section: PlannerSectionSchema): DomainPlannerValue {
  if (section.kind === 'chips') {
    return section.defaults ?? [];
  }
  if (section.kind === 'fields') {
    return Object.fromEntries(section.fields.map((field) => [field.id, field.kind === 'chips' ? [] : '']));
  }
  if (section.kind === 'formation') {
    return [
      { label: 'Front', slots: ['Guardian', 'Open slot'] },
      { label: 'Mid', slots: ['Banner', 'Hex Archer'] },
      { label: 'Back', slots: ['Field Medic'] },
    ];
  }
  if (section.kind === 'stats') {
    return { hp: 3, atk: 3, def: 3, mov: 3, rng: 2 };
  }
  if (section.kind === 'abilities') {
    return [];
  }
  return '';
}

function buildInitialDomainState(): Record<string, DomainInputState> {
  return Object.fromEntries(listDomains().map((domain) => {
    const planner = Object.fromEntries(domain.plannerSections.map((section) => [section.id, defaultValueForSection(section)])) as Record<string, DomainPlannerValue>;
    const plannerDefaults = domain.plannerDefaults as Record<string, DomainPlannerValue> | undefined;
    return [domain.key, {
      planner: { ...planner, ...plannerDefaults },
      customSections: [] as CustomPlannerSection[],
      raw: '',
      contextType: domain.acceptedContextTypes[0] ?? 'notes',
      outputStyle: 'practical',
      variation: 3,
      complexity: 3,
      desiredBlockTypes: domain.outputBlockTypes,
      saveSource: false,
    }];
  }));
}

function patchDomain(
  state: DomainStore,
  domain: string,
  patch: Partial<DomainInputState>,
) {
  const current = state.domains[domain];
  if (!current) {
    return state;
  }
  return {
    ...state,
    domains: {
      ...state.domains,
      [domain]: { ...current, ...patch },
    },
  };
}

export const useDomainStore = create<DomainStore>((set) => ({
  domains: buildInitialDomainState(),
  setPlannerValue: (domain, sectionId, value) => set((state) => {
    const current = state.domains[domain];
    if (!current) {
      return state;
    }
    return patchDomain(state, domain, { planner: { ...current.planner, [sectionId]: value } });
  }),
  setRaw: (domain, raw) => set((state) => patchDomain(state, domain, { raw })),
  setContextType: (domain, contextType) => set((state) => patchDomain(state, domain, { contextType })),
  setOutputStyle: (domain, outputStyle) => set((state) => patchDomain(state, domain, { outputStyle })),
  setVariation: (domain, variation) => set((state) => patchDomain(state, domain, { variation })),
  setComplexity: (domain, complexity) => set((state) => patchDomain(state, domain, { complexity })),
  setDesiredBlockTypes: (domain, desiredBlockTypes) => set((state) => patchDomain(state, domain, { desiredBlockTypes })),
  setSaveSource: (domain, saveSource) => set((state) => patchDomain(state, domain, { saveSource })),
  addCustomSection: (domain) => set((state) => {
    const current = state.domains[domain];
    if (!current) {
      return state;
    }
    const nextNumber = current.customSections.length + 1;
    return patchDomain(state, domain, {
      customSections: [
        ...current.customSections,
        { id: `custom_${nextNumber}`, title: `Custom section ${nextNumber}`, value: '' },
      ],
    });
  }),
  renameCustomSection: (domain, id, title) => set((state) => {
    const current = state.domains[domain];
    if (!current) {
      return state;
    }
    return patchDomain(state, domain, {
      customSections: current.customSections.map((section) => section.id === id ? { ...section, title } : section),
    });
  }),
  updateCustomSection: (domain, id, value) => set((state) => {
    const current = state.domains[domain];
    if (!current) {
      return state;
    }
    return patchDomain(state, domain, {
      customSections: current.customSections.map((section) => section.id === id ? { ...section, value } : section),
    });
  }),
  removeCustomSection: (domain, id) => set((state) => {
    const current = state.domains[domain];
    if (!current) {
      return state;
    }
    return patchDomain(state, domain, {
      customSections: current.customSections.filter((section) => section.id !== id),
    });
  }),
}));
