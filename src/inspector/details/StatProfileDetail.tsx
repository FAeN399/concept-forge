import type { StatProfileBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function StatProfileDetail({ block }: { block: StatProfileBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Unit">{block.payload.unitName}</DetailGroup>
      <DetailGroup label="Archetype">{block.payload.archetype}</DetailGroup>
      <DetailGroup label="Power">{block.payload.power}</DetailGroup>
      <DetailGroup label="Stats"><TextList items={block.payload.stats.map((stat) => `${stat.k}: ${stat.v}/${stat.max} (${stat.note})`)} /></DetailGroup>
    </div>
  );
}
