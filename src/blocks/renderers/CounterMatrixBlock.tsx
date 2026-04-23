import type { Block } from '@/blocks/types';

import { ScoreBadge } from './helpers';
import styles from './BlockRenderer.module.css';

export function CounterMatrixBlock({ block }: { block: Block }) {
  if (block.type !== 'counterMatrix') return null;
  return (
    <div className={styles.stack}>
      {block.payload.matrix.map((row) => (
        <div className={styles.row} key={row.vs}>
          <strong>{row.vs}</strong>
          <ScoreBadge score={row.score} />
          <span className={styles.subtle}>{row.note}</span>
        </div>
      ))}
    </div>
  );
}
