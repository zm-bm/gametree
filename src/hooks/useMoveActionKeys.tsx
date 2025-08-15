import { useEffect } from "react";

interface MoveActions {
  undo: () => void;
  redo: () => void;
  rewind: () => void;
  forward: () => void;
  clear: () => void;
}

export const useMoveActionKeys = ({ undo, redo, rewind, forward, clear }: MoveActions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          forward();
          break;
        case 'ArrowDown':
          rewind();
          break;
        case 'ArrowLeft':
          undo();
          break;
        case 'ArrowRight':
          redo();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', clear);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', clear);
    };
  }, [undo, forward, redo, rewind, clear]);
};
