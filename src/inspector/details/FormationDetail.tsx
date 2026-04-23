import type { FormationBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function FormationDetail({ block }: { block: FormationBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Note">{block.payload.note}</DetailGroup>
      {block.payload.rows.map((row) => <DetailGroup key={row.label} label={row.label}><TextList items={row.slots} /></DetailGroup>)}
    </div>
  );
}
