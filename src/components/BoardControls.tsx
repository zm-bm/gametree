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
import ECODisplay from "./ECODisplay";
import { useMoveActions } from "../hooks/useMoveActions";
import { FlipOrientation, selectFen } from "../redux/gameSlice";
import { ToggleEngine } from "../redux/engineSlice";
import { AppDispatch, RootState } from '../store';

const BoardControls = () => {
  const dispatch = useDispatch<AppDispatch>()
  const flip = useCallback(() => dispatch(FlipOrientation()), [dispatch])
  const fen = useSelector((state: RootState) => selectFen(state));
  const running = useSelector((state: RootState) => state.engine.running);
  const { undo, redo, rewind, forward } = useMoveActions();
  const buttonClass = "btn-primary p-2 hover:scale-105";

  return (
    <div className="flex items-center gap-1 pl-1 pt-2">
      {/* game controls */}
      <button onClick={rewind} className={buttonClass} title='Rewind to first move'>
        <IoIosRewind className='m-auto' />
      </button>
      <button onClick={undo} className={buttonClass} title='Undo last move'>
        <IoIosSkipBackward className='m-auto' />
      </button>
      <button
        onClick={() => dispatch(ToggleEngine(fen))}
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
