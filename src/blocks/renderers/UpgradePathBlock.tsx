import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function UpgradePathBlock({ block }: { block: Block }) {
  if (block.type !== 'upgradePath') return null;
  return (
    <div className={styles.timeline}>
      {block.payload.stages.map((stage) => (
        <div className={styles.timelineItem} key={stage.tier}>
          <strong>{stage.tier} - {stage.name}</strong>
          <div className={styles.subtle}>{stage.req} | {stage.party}</div>
          <span>{stage.gives.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}
