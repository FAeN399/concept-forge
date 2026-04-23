import type { SynergyLinksBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function SynergyLinksDetail({ block }: { block: SynergyLinksBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Unit">{block.payload.unitName}</DetailGroup>
      <DetailGroup label="Links"><TextList items={block.payload.links.map((link) => `${link.with}: ${link.kind} - ${link.why}`)} /></DetailGroup>
    </div>
  );
}
