import type { DomainPlannerValue } from '@/state/useDomainStore';

import styles from '../Planner.module.css';

const statKeys = ['hp', 'atk', 'def', 'mov', 'rng'] as const;

function asStats(value: DomainPlannerValue): Record<(typeof statKeys)[number], number> {
  const fallback = { hp: 3, atk: 3, def: 3, mov: 3, rng: 2 };
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fallback;
  return statKeys.reduce((acc, key) => {
    const raw = value[key];
    return { ...acc, [key]: typeof raw === 'number' ? raw : fallback[key] };
  }, fallback);
}

export function StatsEditor({ value, onChange }: { value: DomainPlannerValue; onChange: (value: DomainPlannerValue) => void }) {
  const stats = asStats(value);
  const total = statKeys.reduce((sum, key) => sum + stats[key], 0);

  return (
    <div className={styles.row}>
      <div className={styles.toolbar}>
        <strong>Power budget</strong>
        <span className="chip">{total} / 30</span>
      </div>
      {statKeys.map((key) => (
        <label className={styles.statRow} key={key}>
          <span className="label">{key.toUpperCase()}</span>
          <input
            max={6}
            min={0}
            onChange={(event) => onChange({ ...stats, [key]: Number(event.target.value) })}
            type="range"
            value={stats[key]}
          />
          <strong>{stats[key]}</strong>
        </label>
      ))}
    </div>
  );
}
