import type { PlannerSectionSchema } from '@/domains/types';
import type { DomainPlannerValue } from '@/state/useDomainStore';
import { Icon } from '@/chrome/Icon';

import { AbilitiesEditor } from './fields/AbilitiesEditor';
import { ChipInput, type ChipSuggestion } from './fields/ChipInput';
import { FieldsGroup } from './fields/FieldsGroup';
import { FormationEditor } from './fields/FormationEditor';
import { StatsEditor } from './fields/StatsEditor';
import { TextField } from './fields/TextField';
import styles from './Planner.module.css';

function asString(value: DomainPlannerValue | undefined) {
  return typeof value === 'string' ? value : '';
}

function asStringArray(value: DomainPlannerValue | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function PlannerSection({
  section,
  open,
  value,
  suggestions,
  onToggle,
  onChange,
}: {
  section: PlannerSectionSchema;
  open: boolean;
  value: DomainPlannerValue | undefined;
  suggestions?: ChipSuggestion[] | undefined;
  onToggle: () => void;
  onChange: (value: DomainPlannerValue) => void;
}) {
  return (
    <section className={styles.section}>
      <button className={styles.sectionHeader} onClick={onToggle} type="button">
        <Icon name={open ? 'chevron_down' : 'chevron_right'} />
        <span>
          <span className={styles.sectionTitle}>{section.title}</span>
          {section.hint && <span className={styles.hint}>{section.hint}</span>}
        </span>
        <span className="chip">{section.kind}</span>
      </button>
      {open && (
        <div className={styles.sectionBody}>
          {section.kind === 'text' && <TextField value={asString(value)} onChange={onChange} />}
          {section.kind === 'chips' && <ChipInput value={asStringArray(value)} suggestions={suggestions} onChange={onChange} />}
          {section.kind === 'fields' && <FieldsGroup fields={section.fields} value={value ?? {}} onChange={onChange} />}
          {section.kind === 'formation' && <FormationEditor value={value ?? []} onChange={onChange} />}
          {section.kind === 'stats' && <StatsEditor value={value ?? {}} onChange={onChange} />}
          {section.kind === 'abilities' && <AbilitiesEditor mode={section.mode} value={value ?? []} onChange={onChange} />}
        </div>
      )}
    </section>
  );
}
