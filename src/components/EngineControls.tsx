import { useDispatch, useSelector } from "react-redux";

import { SetHash, SetThreads, ToggleEngine } from "../redux/engineSlice";
import { AppDispatch, RootState } from '../store';
import { selectFen } from "../redux/gameSlice";
import { IoIosPause, IoIosPlay } from "react-icons/io";

const EngineControls = () => {
  const fen = useSelector((state: RootState) => selectFen(state));
  const nnue = useSelector((state: RootState) => state.engine.nnue);
  const hash = useSelector((state: RootState) => state.engine.hash);
  const threads = useSelector((state: RootState) => state.engine.threads);
  const running = useSelector((state: RootState) => state.engine.running);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="flex items-center text-sm p-1 gap-1 border-b border-gray-400">
      <button
        onClick={() => dispatch(ToggleEngine(fen))}
        className= "border border-gray-400 dark:border-gray-600 p-2 hover:scale-105"
        title="Start/stop engine"
      >
        { running ? <IoIosPause /> : <IoIosPlay /> }
      </button>

      <select
        title="Hash size"
        className="p-2"
        onChange={(e) => dispatch(SetHash(+e.target.value))}
        value={hash}
      >
        <option value="1">1MB</option>
        <option value="2">2MB</option>
        <option value="4">4MB</option>
        <option value="8">8MB</option>
        <option value="16">16MB</option>
        <option value="32">32MB</option>
      </select>
      <select
        title="# of threads"
        className="p-2"
        onChange={(e) => dispatch(SetThreads(+e.target.value))}
        value={threads}
      >
        <option value="1">1 Threads</option>
        <option value="2">2 Threads</option>
        <option value="4">4 Threads</option>
        <option value="8">8 Threads</option>
        <option value="16">16 Threads</option>
      </select>
      <div className="flex flex-col text-xs leading-none overflow-hidden whitespace-nowrap	">
        <div>
          <span>Stockfish 16</span>
          {
            nnue &&
            <span className="text-green-700"> NNUE</span>
          }
        </div>
        <p>in local browser</p>
      </div>
    </div>
  );
}

export default EngineControls;
