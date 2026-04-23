import type { Block } from '@/blocks/types';

import { Meter } from './helpers';
import styles from './BlockRenderer.module.css';

export function UnitBlock({ block }: { block: Block }) {
  if (block.type !== 'unit') return null;
  const stats = block.payload.stats;
  return (
    <div className={styles.stack}>
      <p className={styles.summary}>{block.summary}</p>
      <div className={styles.split}>
        <div><span className={styles.label}>Role</span><strong>{block.payload.role}</strong></div>
        <div><span className={styles.label}>Risk</span><strong>{block.payload.risk}</strong></div>
      </div>
      <div className={styles.stack}>
        <Meter label="HP" value={stats.hp} max={6} />
        <Meter label="ATK" value={stats.atk} max={6} />
        <Meter label="DEF" value={stats.def} max={6} />
        <Meter label="MOV" value={stats.mov} max={6} />
        <Meter label="RNG" value={stats.rng} max={6} />
      </div>
      <span className={styles.subtle}>{block.payload.silhouette}</span>
    </div>
  );
}
