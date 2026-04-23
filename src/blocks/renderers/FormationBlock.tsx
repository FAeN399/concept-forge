import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function FormationBlock({ block }: { block: Block }) {
  if (block.type !== 'formation') return null;
  return (
    <div className={styles.formation}>
      <p className={styles.summary}>{block.payload.note}</p>
      {block.payload.rows.map((row) => (
        <div className={styles.row} key={row.label}>
          <strong>{row.label}</strong>
          <div className={styles.slots}>{row.slots.map((slot, index) => <span className={styles.slot} key={`${slot}-${index}`}>{slot}</span>)}</div>
        </div>
      ))}
    </div>
  );
}
