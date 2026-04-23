import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function AbilityKitBlock({ block }: { block: Block }) {
  if (block.type !== 'abilityKit') return null;
  return (
    <div className={styles.stack}>
      <div className={styles.row}><strong>{block.payload.resource}</strong><span className={styles.subtle}>{block.payload.unitName}</span></div>
      {block.payload.actives.slice(0, 2).map((ability) => (
        <div className={styles.stack} key={ability.name}>
          <strong>{ability.name}</strong>
          <span className={styles.subtle}>{ability.cost} | {ability.cd} | {ability.timing}</span>
          <span>{ability.effect}</span>
        </div>
      ))}
      <span className={styles.subtle}>Passives: {block.payload.passives.map((passive) => passive.name).join(', ')}</span>
    </div>
  );
}
