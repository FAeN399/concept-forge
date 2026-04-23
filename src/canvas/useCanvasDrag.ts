import { useCallback, useEffect, useRef } from 'react';

import type { Block } from '@/blocks/types';
import { useBlocksStore } from '@/state/useBlocksStore';

type DragState = {
  id: string;
  pointerId: number;
  startPointer: { x: number; y: number };
  startPosition: { x: number; y: number };
  nextPosition: { x: number; y: number };
  frame: number | null;
};

export function useCanvasDrag(enabled: boolean) {
  const moveBlock = useBlocksStore((state) => state.moveBlock);
  const dragRef = useRef<DragState | null>(null);

  const flush = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;
    moveBlock(drag.id, drag.nextPosition);
    drag.frame = null;
  }, [moveBlock]);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startPointer.x;
    const dy = event.clientY - drag.startPointer.y;
    drag.nextPosition = {
      x: Math.max(0, Math.round(drag.startPosition.x + dx)),
      y: Math.max(0, Math.round(drag.startPosition.y + dy)),
    };
    if (drag.frame === null) {
      drag.frame = window.requestAnimationFrame(flush);
    }
  }, [flush]);

  const stopDrag = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.frame !== null) {
      window.cancelAnimationFrame(drag.frame);
    }
    moveBlock(drag.id, drag.nextPosition);
    dragRef.current = null;
  }, [moveBlock]);

  useEffect(() => {
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  return useCallback((event: React.PointerEvent<HTMLElement>, block: Block) => {
    if (!enabled || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      id: block.id,
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startPosition: block.position,
      nextPosition: block.position,
      frame: null,
    };
  }, [enabled]);
}
