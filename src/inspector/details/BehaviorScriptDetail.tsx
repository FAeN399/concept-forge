import type { BehaviorScriptBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function BehaviorScriptDetail({ block }: { block: BehaviorScriptBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Intents"><TextList items={block.payload.intents} /></DetailGroup>
      <DetailGroup label="Rules"><TextList items={block.payload.rules.map((rule) => `When ${rule.when}: ${rule.then}`)} /></DetailGroup>
    </div>
  );
}
