import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function FlowBlock({ block }: { block: Block }) {
  if (block.type !== 'flow') return null;
  return (
    <div className={styles.timeline}>
      {block.payload.branches.map((branch) => (
        <div className={styles.timelineItem} key={branch.trigger}>
          <strong>{branch.trigger}</strong>
          <ul className={styles.list}>{branch.steps.map((step) => <li key={step}>{step}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
