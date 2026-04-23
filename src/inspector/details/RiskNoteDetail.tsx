import type { RiskNoteBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function RiskNoteDetail({ block }: { block: RiskNoteBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Level">{block.payload.level}</DetailGroup>
      <DetailGroup label="Factors"><TextList items={block.payload.factors.map((factor) => `${factor.label} (${factor.weight}): ${factor.note}`)} /></DetailGroup>
      <DetailGroup label="Blockers"><TextList items={block.payload.blockers} /></DetailGroup>
    </div>
  );
}
