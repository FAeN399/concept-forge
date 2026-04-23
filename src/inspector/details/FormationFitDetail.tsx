import type { FormationFitBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function FormationFitDetail({ block }: { block: FormationFitBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Slots"><TextList items={block.payload.slots.map((slot) => `${slot.row} ${slot.pos}: ${slot.fit}/5 - ${slot.reason}`)} /></DetailGroup>
      <DetailGroup label="Archetypes"><TextList items={block.payload.archetypes.map((item) => `${item.name}: ${item.fit}`)} /></DetailGroup>
    </div>
  );
}
