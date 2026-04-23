import { useEffect, useMemo, useState } from 'react';

import type { UnitBlock } from '@/blocks/types';
import { Icon } from '@/chrome/Icon';
import { requireDomain } from '@/domains/registry';
import { useBlocksStore } from '@/state/useBlocksStore';
import { useDomainStore, type DomainPlannerValue } from '@/state/useDomainStore';
import { useSessionStore } from '@/state/useSessionStore';

import { Completeness } from './Completeness';
import type { ChipSuggestion } from './fields/ChipInput';
import { TextField } from './fields/TextField';
import styles from './Planner.module.css';
import { PlannerSection } from './PlannerSection';

function filled(value: DomainPlannerValue | undefined): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object' && value !== null) return Object.values(value).some((item) => filled(item as DomainPlannerValue));
  return false;
}

function unitSuggestions(units: UnitBlock[]): ChipSuggestion[] {
  return units.map((unit) => ({ label: unit.title, badge: 'Unit' }));
}

export function Planner() {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const manifest = requireDomain(activeDomain);
  const domainInput = useDomainStore((state) => state.domains[activeDomain]);
  const setPlannerValue = useDomainStore((state) => state.setPlannerValue);
  const addCustomSection = useDomainStore((state) => state.addCustomSection);
  const renameCustomSection = useDomainStore((state) => state.renameCustomSection);
  const updateCustomSection = useDomainStore((state) => state.updateCustomSection);
  const removeCustomSection = useDomainStore((state) => state.removeCustomSection);
  const allBlocks = useBlocksStore((state) => state.blocks);
  const approvedUnits = useMemo(() => allBlocks.filter((block): block is UnitBlock => (
    block.domain === 'unit' && block.status === 'approved' && block.type === 'unit'
  )), [allBlocks]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenSections(Object.fromEntries(manifest.plannerSections.map((section) => [section.id, section.defaultOpen === true])));
  }, [manifest]);

  const totals = useMemo(() => {
    const baseValues = manifest.plannerSections.map((section) => domainInput?.planner[section.id]);
    const customValues = domainInput?.customSections.map((section) => section.value) ?? [];
    const values = [...baseValues, ...customValues];
    return { filled: values.filter((value) => filled(value as DomainPlannerValue)).length, total: values.length };
  }, [domainInput, manifest.plannerSections]);

  if (!domainInput) {
    return null;
  }

  const warnings = totals.filled < 4 ? ['Very light context'] : [];

  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <div className={styles.title}>Planner</div>
        <Completeness filled={totals.filled} total={totals.total} />
        {warnings.map((warning) => <div className={styles.warn} key={warning}>{warning}</div>)}
        {manifest.inferredFields && (
          <div className={styles.row}>
            <span className="label">Backend will infer</span>
            <div className={styles.inferred}>
              {manifest.inferredFields.map((item) => <span className="chip" key={item}>{item}</span>)}
            </div>
          </div>
        )}
      </header>
      <div className={styles.body}>
        {manifest.plannerSections.map((section) => {
          const suggestions = manifest.unitSuggestionSectionIds?.includes(section.id) ? unitSuggestions(approvedUnits) : undefined;
          return (
            <PlannerSection
              key={section.id}
              onChange={(value) => setPlannerValue(activeDomain, section.id, value)}
              onToggle={() => setOpenSections((state) => ({ ...state, [section.id]: !state[section.id] }))}
              open={openSections[section.id] ?? false}
              section={section}
              suggestions={suggestions}
              value={domainInput.planner[section.id]}
            />
          );
        })}

        {domainInput.customSections.map((section) => (
          <section className={styles.section} key={section.id}>
            <div className={styles.sectionBody}>
              <div className={styles.toolbar}>
                <input className="field" onChange={(event) => renameCustomSection(activeDomain, section.id, event.target.value)} value={section.title} />
                <button className="iconBtn" onClick={() => removeCustomSection(activeDomain, section.id)} title="Remove custom section" type="button"><Icon name="x" /></button>
              </div>
              <TextField value={section.value} onChange={(value) => updateCustomSection(activeDomain, section.id, value)} />
            </div>
          </section>
        ))}

        <button className="btn" onClick={() => addCustomSection(activeDomain)} type="button">
          <Icon name="plus" />
          Add custom section
        </button>
      </div>
    </aside>
  );
}
