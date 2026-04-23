import type { AbilityKitBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function AbilityKitDetail({ block }: { block: AbilityKitBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Resource">{block.payload.resource}</DetailGroup>
      <DetailGroup label="Actives"><TextList items={block.payload.actives.map((item) => `${item.name}: ${item.effect}`)} /></DetailGroup>
      <DetailGroup label="Passives"><TextList items={block.payload.passives.map((item) => `${item.name}: ${item.effect}`)} /></DetailGroup>
      <DetailGroup label="Counters"><TextList items={block.payload.counters} /></DetailGroup>
    </div>
  );
}
