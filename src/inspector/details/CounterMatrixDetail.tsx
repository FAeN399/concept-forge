import type { CounterMatrixBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function CounterMatrixDetail({ block }: { block: CounterMatrixBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Unit">{block.payload.unitName}</DetailGroup>
      <DetailGroup label="Matchups"><TextList items={block.payload.matrix.map((row) => `${row.vs}: ${row.score} - ${row.note}`)} /></DetailGroup>
    </div>
  );
}
