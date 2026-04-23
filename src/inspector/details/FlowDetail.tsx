import type { FlowBlock } from '@/blocks/types';

import { DetailGroup, TextList } from './helpers';
import styles from '../Inspector.module.css';

export function FlowDetail({ block }: { block: FlowBlock }) {
  return <div className={styles.section}>{block.payload.branches.map((branch) => <DetailGroup key={branch.trigger} label={branch.trigger}><TextList items={branch.steps} /></DetailGroup>)}</div>;
}
