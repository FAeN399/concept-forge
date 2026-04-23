import type { UpgradePathBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function UpgradePathDetail({ block }: { block: UpgradePathBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Stages"><TextList items={block.payload.stages.map((stage) => `${stage.tier} ${stage.name}: ${stage.gives.join(', ')}`)} /></DetailGroup>
      <DetailGroup label="Branches"><TextList items={block.payload.branches.map((branch) => `${branch.at}: ${branch.choice.join(' / ')}`)} /></DetailGroup>
    </div>
  );
}
