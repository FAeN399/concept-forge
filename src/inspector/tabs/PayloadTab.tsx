import type { Block } from '@/blocks/types';

import styles from '../Inspector.module.css';

export function PayloadTab({ block }: { block: Block }) {
  const remixPayload = {
    sourceBlockId: block.id,
    sourceType: block.type,
    title: block.title,
    payload: block.payload,
    pins: block.pinned ? [block.id] : [],
  };

  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <span className={styles.label}>Returned from backend</span>
        <pre className={styles.jsonPanel}>{JSON.stringify(block, null, 2)}</pre>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Would send on remix</span>
        <pre className={styles.jsonPanel}>{JSON.stringify(remixPayload, null, 2)}</pre>
      </div>
    </div>
  );
}
