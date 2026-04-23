import type { Block } from '@/blocks/types';

import { ChipList } from './helpers';
import styles from './BlockRenderer.module.css';

export function BehaviorScriptBlock({ block }: { block: Block }) {
  if (block.type !== 'behaviorScript') return null;
  return (
    <div className={styles.stack}>
      <ChipList items={block.payload.intents} />
      {block.payload.rules.slice(0, 4).map((rule) => (
        <div className={styles.stack} key={rule.when}>
          <strong>When {rule.when}</strong>
          <span>{rule.then}</span>
        </div>
      ))}
    </div>
  );
}
