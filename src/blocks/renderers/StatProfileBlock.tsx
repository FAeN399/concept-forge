import type { Block } from '@/blocks/types';

import { Meter } from './helpers';
import styles from './BlockRenderer.module.css';

export function StatProfileBlock({ block }: { block: Block }) {
  if (block.type !== 'statProfile') return null;
  return (
    <div className={styles.stack}>
      <p className={styles.summary}>{block.payload.unitName} | {block.payload.archetype} | Power {block.payload.power}</p>
      {block.payload.stats.map((stat) => <Meter key={stat.k} label={stat.k} value={stat.v} max={stat.max} note={stat.note} />)}
    </div>
  );
}
