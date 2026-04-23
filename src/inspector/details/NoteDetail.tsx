import type { NoteBlock } from '@/blocks/types';

import { DetailGroup } from './helpers';
import styles from '../Inspector.module.css';

export function NoteDetail({ block }: { block: NoteBlock }) {
  return <div className={styles.section}><DetailGroup label="Body">{block.payload.body}</DetailGroup></div>;
}
