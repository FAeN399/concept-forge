import type { ArchetypeBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function ArchetypeDetail({ block }: { block: ArchetypeBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Tagline">{block.payload.tagline}</DetailGroup>
      <DetailGroup label="Roles">
        <TextList items={block.payload.roles.map((role) => `${role.name}: ${role.role} x${role.count}`)} />
      </DetailGroup>
      <DetailGroup label="Leader">{block.payload.leader}</DetailGroup>
      <DetailGroup label="Strengths"><TextList items={block.payload.strengths} /></DetailGroup>
      <DetailGroup label="Weaknesses"><TextList items={block.payload.weaknesses} /></DetailGroup>
    </div>
  );
}
