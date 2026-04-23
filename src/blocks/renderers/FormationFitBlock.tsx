import type { Block } from '@/blocks/types';

import { Meter } from './helpers';
import styles from './BlockRenderer.module.css';

export function FormationFitBlock({ block }: { block: Block }) {
  if (block.type !== 'formationFit') return null;
  return (
    <div className={styles.stack}>
      {block.payload.slots.slice(0, 4).map((slot) => <Meter key={`${slot.row}-${slot.pos}`} label={`${slot.row} ${slot.pos}`} value={slot.fit} max={5} note={slot.reason} />)}
      <span className={styles.subtle}>{block.payload.archetypes.map((item) => `${item.name}: ${item.fit}`).join(' | ')}</span>
    </div>
  );
}
