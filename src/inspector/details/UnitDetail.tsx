import type { UnitBlock } from '@/blocks/types';

import { DetailGroup } from './helpers';
import styles from '../Inspector.module.css';

export function UnitDetail({ block }: { block: UnitBlock }) {
  const stats = block.payload.stats;
  return (
    <div className={styles.section}>
      <DetailGroup label="Role">{block.payload.role}</DetailGroup>
      <DetailGroup label="Job">{block.payload.job}</DetailGroup>
      <DetailGroup label="Silhouette">{block.payload.silhouette}</DetailGroup>
      <DetailGroup label="Stats">HP {stats.hp} / ATK {stats.atk} / DEF {stats.def} / MOV {stats.mov} / RNG {stats.rng}</DetailGroup>
      <DetailGroup label="Risk">{block.payload.risk}</DetailGroup>
      <DetailGroup label="Party handoff">{block.payload.sentToParty ? 'Sent to Party Lab suggestions' : 'Not sent yet'}</DetailGroup>
    </div>
  );
}
