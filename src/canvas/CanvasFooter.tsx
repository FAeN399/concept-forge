import type { CanvasLayoutMode } from '@/domains/types';

import styles from './ConceptCanvas.module.css';

type CanvasFooterProps = {
  layout: CanvasLayoutMode;
  selectedTitle: string | null;
};

export function CanvasFooter({ layout, selectedTitle }: CanvasFooterProps) {
  return (
    <footer className={styles.footer}>
      <span>{layout === 'free' ? 'Free mode: drag block headers to reposition.' : `${layout} layout is auto-arranged.`}</span>
      <span>{selectedTitle ? `Selected: ${selectedTitle}` : 'No block selected'}</span>
    </footer>
  );
}
