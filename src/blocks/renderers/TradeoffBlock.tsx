import type { Block } from '@/blocks/types';

import { ChipList, Meter } from './helpers';
import styles from './BlockRenderer.module.css';

export function TradeoffBlock({ block }: { block: Block }) {
  if (block.type !== 'tradeoff') return null;
  return (
    <div className={styles.stack}>
      {block.payload.items.map((item) => <Meter key={item.label} label={item.label} value={item.value} note={item.k} />)}
      <ChipList items={block.payload.counters} />
    </div>
  );
}
