import { 
  IoIosRewind,
  IoIosFastforward,
  IoIosSkipForward,
  IoIosSkipBackward,
  IoMdSync,
} from "react-icons/io";
import { useEffect } from "react";
import { throttle } from "../helpers";
import { useMoveActions } from "../hooks/moveHooks";

const BoardControls = () => {
  const { undo, redo, rewind, forward } = useMoveActions();

  const flip = () => {};

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
  const debouncedKeyDown = throttle(handleKeyDown, 200);

  useEffect(() => {
    window.addEventListener('keydown', debouncedKeyDown);

    return () => {
      window.removeEventListener('keydown', debouncedKeyDown);
    };
  }, []);


  const buttonClass = "btn-primary p-2";
  return (
    <div 
      className="flex items-center gap-1 p-1"
    >
      <button onClick={rewind} className={buttonClass} title='Rewind to first move'>
        <IoIosRewind className='m-auto' />
      </button>
      <button onClick={undo} className={buttonClass} title='Undo last move'>
        <IoIosSkipBackward className='m-auto' />
      </button>
      <button onClick={redo} className={buttonClass} title='Redo next move'>
        <IoIosSkipForward className='m-auto' />
      </button>
      <button onClick={forward} className={buttonClass} title='Forward to last move'>
        <IoIosFastforward className='m-auto' />
      </button>
      <button onClick={flip} className={buttonClass} title='Flip board'>
        <IoMdSync className='m-auto' strokeWidth={16} />
      </button>
    </div>

  );
}

export default BoardControls;
