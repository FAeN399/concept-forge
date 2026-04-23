import type { TableBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function TableDetail({ block }: { block: TableBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Columns"><TextList items={block.payload.cols.map((col) => col.label)} /></DetailGroup>
      <DetailGroup label="Rows"><TextList items={block.payload.rows.map((row) => String(row.name ?? 'Untitled row'))} /></DetailGroup>
    </div>
  );
}
