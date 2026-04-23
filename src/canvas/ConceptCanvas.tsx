import { useMemo } from 'react';

import { Icon } from '@/chrome/Icon';
import { blockTypeIcons, blockTypeLabels, rendererMap } from '@/blocks/renderers';
import type { Block, BlockType } from '@/blocks/types';
import { useBlocksStore } from '@/state/useBlocksStore';
import { useSessionStore } from '@/state/useSessionStore';
import { useStatusStore } from '@/state/useStatusStore';
import { cn } from '@/util/cn';

import { CanvasFooter } from './CanvasFooter';
import { CanvasToolbar } from './CanvasToolbar';
import styles from './ConceptCanvas.module.css';
import { layoutBlocks } from './layoutModes';
import { useCanvasDrag } from './useCanvasDrag';

type ConceptCanvasProps = {
  onGenerate: () => void;
};

function blockStyle(block: ReturnType<typeof layoutBlocks>[number]) {
  return {
    left: block.layoutPosition.x,
    top: block.layoutPosition.y,
    width: block.layoutSize.width,
    height: block.layoutSize.height,
  };
}

function planeSize(blocks: ReturnType<typeof layoutBlocks>) {
  return blocks.reduce(
    (acc, block) => ({
      width: Math.max(acc.width, block.layoutPosition.x + block.layoutSize.width + 60),
      height: Math.max(acc.height, block.layoutPosition.y + block.layoutSize.height + 60),
    }),
    { width: 1200, height: 820 },
  );
}

function uniqueTypes(blocks: Block[]) {
  return Array.from(new Set(blocks.map((block) => block.type))) as BlockType[];
}

export function ConceptCanvas({ onGenerate }: ConceptCanvasProps) {
  const activeDomain = useSessionStore((state) => state.activeDomain);
  const layout = useSessionStore((state) => state.layoutByDomain[activeDomain] ?? 'free');
  const allBlocks = useBlocksStore((state) => state.blocks);
  const blocks = useMemo(
    () => allBlocks.filter((block) => block.domain === activeDomain && block.status !== 'archived'),
    [allBlocks, activeDomain],
  );
  const selectedBlockId = useBlocksStore((state) => state.selectedBlockId);
  const selectBlock = useBlocksStore((state) => state.selectBlock);
  const dispatchBlockAction = useBlocksStore((state) => state.dispatchBlockAction);
  const selectedBlock = useMemo(() => allBlocks.find((block) => block.id === selectedBlockId) ?? null, [allBlocks, selectedBlockId]);
  const { status, message, step, totalSteps, error } = useStatusStore();
  const laidOut = layoutBlocks(blocks, layout);
  const size = planeSize(laidOut);
  const startDrag = useCanvasDrag(layout === 'free');

  return (
    <section className={styles.canvasShell}>
      <CanvasToolbar layout={layout} blockCount={laidOut.length} visibleTypes={uniqueTypes(laidOut)} />
      <div className={styles.viewport} onClick={() => selectBlock(null)}>
        {status === 'error' ? (
          <div className={styles.errorState}>
            <h2>Generation failed</h2>
            <p>{error ?? 'The mock backend returned an error.'}</p>
            <button className="btn btnPrimary" onClick={onGenerate} type="button">Retry</button>
          </div>
        ) : laidOut.length === 0 && status === 'idle' ? (
          <div className={styles.emptyState}>
            <h2>Canvas is empty.</h2>
            <p>Generate from Planner or Raw Context.</p>
            <button className="btn btnPrimary" onClick={onGenerate} type="button">
              <Icon name="wand" />
              Generate
            </button>
          </div>
        ) : (
          <div className={styles.plane} style={{ width: size.width, height: size.height }}>
            {laidOut.map((block) => {
              const Renderer = rendererMap[block.type];
              return (
                <article
                  className={cn(styles.blockCard, selectedBlockId === block.id && styles.blockCardSelected)}
                  key={block.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectBlock(block.id);
                  }}
                  style={blockStyle(block)}
                >
                  <header
                    className={cn(styles.blockHeader, layout === 'free' && styles.draggable)}
                    onPointerDown={(event) => startDrag(event, block)}
                  >
                    <Icon name={blockTypeIcons[block.type]} />
                    <div className={styles.blockTitle}>
                      <strong>{block.title}</strong>
                      <span className={styles.blockType}>{blockTypeLabels[block.type]} | {Math.round(block.confidence * 100)}%</span>
                    </div>
                    <div className={styles.blockActions} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                      <button className="iconBtn" onClick={() => dispatchBlockAction({ kind: 'pin', id: block.id })} title={block.pinned ? 'Unpin' : 'Pin'} type="button"><Icon name="pin" /></button>
                      <button className="iconBtn" onClick={() => dispatchBlockAction({ kind: 'approve', id: block.id })} title="Approve" type="button"><Icon name="approve" /></button>
                      <button className="iconBtn" onClick={() => dispatchBlockAction({ kind: 'duplicate', id: block.id })} title="Duplicate" type="button"><Icon name="duplicate" /></button>
                      <button className="iconBtn" onClick={() => dispatchBlockAction({ kind: 'compareAdd', id: block.id })} title="Add to compare" type="button"><Icon name="compare" /></button>
                      <button className="iconBtn" onClick={() => dispatchBlockAction({ kind: 'archive', id: block.id })} title="Archive" type="button"><Icon name="archive" /></button>
                    </div>
                  </header>
                  <div className={styles.blockBody}>
                    <Renderer block={block} />
                  </div>
                </article>
              );
            })}
            {status === 'streaming' && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingPanel}>
                  <strong>{message}</strong>
                  <div className="meter"><span style={{ width: `${(step / totalSteps) * 100}%` }} /></div>
                  <span className="chip">{step} / {totalSteps}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <CanvasFooter layout={layout} selectedTitle={selectedBlock?.title ?? null} />
    </section>
  );
}
