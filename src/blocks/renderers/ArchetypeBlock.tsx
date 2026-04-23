import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function ArchetypeBlock({ block }: { block: Block }) {
  if (block.type !== 'archetype') return null;
  return (
    <div className={styles.stack}>
      <p className={styles.summary}>{block.payload.tagline}</p>
      {block.payload.roles.map((role) => (
        <div className={styles.row} key={`${role.name}-${role.role}`}>
          <span className={styles.roleDot} style={{ background: role.color }} />
          <strong>{role.name}</strong>
          <span className={styles.subtle}>{role.role} x{role.count}</span>
        </div>
      ))}
      <div className={styles.row}><strong>Leader</strong><span className={styles.subtle}>{block.payload.leader}</span></div>
    </div>
  );
}
