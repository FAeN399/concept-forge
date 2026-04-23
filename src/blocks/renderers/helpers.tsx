import type { ReactNode } from 'react';

import styles from './BlockRenderer.module.css';

export function ChipList({ items }: { items: string[] }) {
  return (
    <div className={styles.slots}>
      {items.map((item) => <span className="chip" key={item}>{item}</span>)}
    </div>
  );
}

export function Meter({ label, value, max = 1, note }: { label: string; value: number; max?: number; note?: ReactNode }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={styles.meterLine}>
      <strong>{label}</strong>
      <div className={styles.bar}><span style={{ width: `${pct}%` }} /></div>
      <span className={styles.subtle}>{note ?? value}</span>
    </div>
  );
}

export function LabelValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.stack}>
      <span className={styles.label}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`${styles.score} ${score >= 0 ? styles.scoreGood : styles.scoreBad}`}>
      {score > 0 ? `+${score}` : score}
    </span>
  );
}
