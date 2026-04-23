import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function NoteBlock({ block }: { block: Block }) {
  if (block.type !== 'note') return null;
  return <p className={styles.summary}>{block.payload.body}</p>;
}
