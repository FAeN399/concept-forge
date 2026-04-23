import { Icon } from '@/chrome/Icon';
import type { DomainPlannerValue } from '@/state/useDomainStore';

import styles from '../Planner.module.css';

type FormationRow = { label: string; slots: string[] };

function asRows(value: DomainPlannerValue): FormationRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is FormationRow => (
    typeof item === 'object' && item !== null && 'label' in item && 'slots' in item && Array.isArray(item.slots)
  ));
}

export function FormationEditor({ value, onChange }: { value: DomainPlannerValue; onChange: (value: DomainPlannerValue) => void }) {
  const rows = asRows(value);
  const updateRow = (index: number, row: FormationRow) => onChange(rows.map((item, itemIndex) => itemIndex === index ? row : item));

  return (
    <div className={styles.row}>
      {rows.map((row, index) => (
        <div className={styles.formationRow} key={row.label}>
          <div className={styles.toolbar}>
            <strong>{row.label}</strong>
            <button className="btn" onClick={() => updateRow(index, { ...row, slots: [...row.slots, 'Open slot'] })} type="button">
              <Icon name="plus" />
              Slot
            </button>
          </div>
          <div className={styles.slotGrid}>
            {row.slots.map((slot, slotIndex) => (
              <span className={styles.slot} key={`${slot}-${slotIndex}`}>
                {slot}
                <button
                  className="iconBtn"
                  onClick={() => updateRow(index, { ...row, slots: row.slots.filter((_, itemIndex) => itemIndex !== slotIndex) })}
                  title={`Remove ${slot}`}
                  type="button"
                >
                  <Icon name="x" size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
