import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function SynergyLinksBlock({ block }: { block: Block }) {
  if (block.type !== 'synergyLinks') return null;
  return (
    <div className={styles.stack}>
      {block.payload.links.map((link) => (
        <div className={styles.row} key={link.with}>
          <strong>{link.with}</strong>
          <span className="chip">{link.kind}</span>
          <span className={styles.subtle}>{link.why}</span>
        </div>
      ))}
    </div>
  );
}
