import type { FieldSchema } from '@/domains/types';
import type { DomainPlannerValue } from '@/state/useDomainStore';

import { ChipInput } from './ChipInput';
import styles from '../Planner.module.css';

type FieldsValue = Record<string, DomainPlannerValue>;

function asRecord(value: DomainPlannerValue): FieldsValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as FieldsValue : {};
}

function asStringArray(value: DomainPlannerValue | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function FieldsGroup({ fields, value, onChange }: { fields: FieldSchema[]; value: DomainPlannerValue; onChange: (value: DomainPlannerValue) => void }) {
  const record = asRecord(value);
  const update = (fieldId: string, next: DomainPlannerValue) => onChange({ ...record, [fieldId]: next });

  return (
    <div className={styles.grid}>
      {fields.map((field) => (
        <label className={styles.row} key={field.id}>
          <span className="label">{field.label}</span>
          {field.kind === 'chips' ? (
            <ChipInput value={asStringArray(record[field.id])} onChange={(next) => update(field.id, next)} />
          ) : (
            <input
              className="field"
              min={field.kind === 'num' ? 0 : undefined}
              onChange={(event) => update(field.id, field.kind === 'num' ? Number(event.target.value) : event.target.value)}
              type={field.kind === 'num' ? 'number' : 'text'}
              value={String(record[field.id] ?? '')}
            />
          )}
        </label>
      ))}
    </div>
  );
}
