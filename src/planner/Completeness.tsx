import styles from './Planner.module.css';

export function Completeness({ filled, total }: { filled: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((filled / total) * 100);
  return (
    <div className={styles.row}>
      <div className={styles.toolbar}>
        <strong>Completeness</strong>
        <span className="chip">{filled} / {total}</span>
      </div>
      <div className="meter"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
