import type { Block } from '@/blocks/types';
import { blockTypeLabels } from '@/blocks/renderers';
import { useBlocksStore } from '@/state/useBlocksStore';

import styles from '../Inspector.module.css';

export function RelatedTab({ block }: { block: Block }) {
  const blocks = useBlocksStore((state) => state.blocks);
  const selectBlock = useBlocksStore((state) => state.selectBlock);
  const refs = block.relations
    .map((relation) => ({ relation, target: blocks.find((item) => item.id === relation.to) }))
    .filter((item) => item.target);

  if (refs.length === 0) {
    return <p className={styles.summary}>No related blocks yet.</p>;
  }

  return (
    <div className={styles.section}>
      {refs.map(({ relation, target }) => target && (
        <button className={styles.relatedButton} key={`${relation.kind}-${target.id}`} onClick={() => selectBlock(target.id)} type="button">
          <strong>{target.title}</strong>
          <span className={styles.summary}>{relation.kind} | {blockTypeLabels[target.type]}</span>
          {relation.note && <span>{relation.note}</span>}
        </button>
      ))}
    </div>
  );
}
