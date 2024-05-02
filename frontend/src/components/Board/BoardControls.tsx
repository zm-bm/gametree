import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IoIosRewind,
  IoIosFastforward,
  IoIosSkipForward,
  IoIosSkipBackward,
  IoMdSync,
  IoIosPause,
  IoIosPlay
} from "react-icons/io";
import { throttle } from "../../lib/helpers";
import { useMoveActions } from "../../hooks/moveHooks";
import { FLIP_ORIENTATION } from "../../redux/boardSlice";
import ECODisplay from "../ECODisplay";
import { TOGGLE_ENGINE } from "../../redux/engineSlice";
import { AppDispatch, RootState } from '../../store';

const BoardControls = () => {
  const { undo, redo, rewind, forward } = useMoveActions();
  const dispatch = useDispatch<AppDispatch>()
  const flip = useCallback(() => dispatch(FLIP_ORIENTATION()), [])
  const fen = useSelector((state: RootState) => state.board.fen);
  const running = useSelector((state: RootState) => state.engine.running);

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
    const debouncedKeyDown = throttle(handleKeyDown, 200);
    window.addEventListener('keydown', debouncedKeyDown);
    return () => window.removeEventListener('keydown', debouncedKeyDown);
  }, [undo, forward, redo, forward]);

  const buttonClass = "btn-primary p-2 hover:scale-110";

  return (
    <div className="flex items-center gap-1 py-1 neutral-gradient-to-b">
      {/* game controls */}
      <button onClick={rewind} className={buttonClass} title='Rewind to first move'>
        <IoIosRewind className='m-auto' />
      </button>
      <button onClick={undo} className={buttonClass} title='Undo last move'>
        <IoIosSkipBackward className='m-auto' />
      </button>
      <button
        onClick={() => dispatch(TOGGLE_ENGINE(fen))}
        className={`${buttonClass} `}
        title="Start/stop engine"
      >
        { running ? <IoIosPause /> : <IoIosPlay /> }
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

      <ECODisplay />
    </div>
  );
}

export default BoardControls;
