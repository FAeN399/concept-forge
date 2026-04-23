import type { Block } from '@/blocks/types';

import styles from './BlockRenderer.module.css';

export function GraphBlock({ block }: { block: Block }) {
  if (block.type !== 'graph') return null;
  return (
    <div className={styles.stack}>
      <div className={styles.miniGraph}>
        {block.payload.nodes.map((node) => (
          <span
            className={styles.node}
            key={node.id}
            style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
            title={`${node.label} - ${node.role}`}
          >
            {node.label}
          </span>
        ))}
      </div>
      <span className={styles.subtle}>{block.payload.edges.length} synergy links mapped</span>
    </div>
  );
}
