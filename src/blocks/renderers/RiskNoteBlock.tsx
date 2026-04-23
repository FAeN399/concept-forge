import type { Block } from '@/blocks/types';

import { Meter } from './helpers';
import styles from './BlockRenderer.module.css';

export function RiskNoteBlock({ block }: { block: Block }) {
  if (block.type !== 'riskNote') return null;
  return (
    <div className={styles.stack}>
      <div className={styles.row}><strong>Level</strong><span className="chip chipAccent">{block.payload.level}</span></div>
      {block.payload.factors.map((factor) => <Meter key={factor.label} label={factor.label} value={factor.weight} max={3} note={factor.note} />)}
      <span className={styles.subtle}>Blockers: {block.payload.blockers.join(', ')}</span>
    </div>
  );
}
