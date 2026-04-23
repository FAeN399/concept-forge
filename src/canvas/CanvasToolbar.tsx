import { blockTypeLabels } from '@/blocks/renderers';
import type { BlockType } from '@/blocks/types';
import type { CanvasLayoutMode } from '@/domains/types';

import styles from './ConceptCanvas.module.css';

type CanvasToolbarProps = {
  layout: CanvasLayoutMode;
  blockCount: number;
  visibleTypes: BlockType[];
};

export function CanvasToolbar({ layout, blockCount, visibleTypes }: CanvasToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarMeta}>
        <span className="chip chipAccent">{layout.toUpperCase()}</span>
        <span className="chip">{blockCount} blocks</span>
      </div>
      <div className={styles.toolbarMeta}>
        {visibleTypes.slice(0, 5).map((type) => <span className="chip" key={type}>{blockTypeLabels[type]}</span>)}
      </div>
    </div>
  );
}
