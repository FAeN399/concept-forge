import type { GraphBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function GraphDetail({ block }: { block: GraphBlock }) {
  return (
    <div className={styles.section}>
      <DetailGroup label="Nodes"><TextList items={block.payload.nodes.map((node) => `${node.label}: ${node.role}`)} /></DetailGroup>
      <DetailGroup label="Edges"><TextList items={block.payload.edges.map((edge) => `${edge[0]} -> ${edge[1]} (${edge[2]})`)} /></DetailGroup>
    </div>
  );
}
