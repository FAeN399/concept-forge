import type { TradeoffBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function TradeoffDetail({ block }: { block: TradeoffBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Scores"><TextList items={block.payload.items.map((item) => `${item.label}: ${Math.round(item.value * 100)}% (${item.k})`)} /></DetailGroup>
      <DetailGroup label="Counters"><TextList items={block.payload.counters} /></DetailGroup>
    </div>
  );
}
