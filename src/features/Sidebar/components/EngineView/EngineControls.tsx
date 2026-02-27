import { useCallback } from "react";
import { useSelector } from "react-redux";
import { IoIosPause, IoIosPlay } from "react-icons/io";

import { RootState, useAppDispatch } from '@/store';
import { selectEngineHash, selectEngineRunning, selectEngineThreads } from "@/store/selectors";
import { ui } from "@/store/slices";

const EngineControls = () => {
  const dispatch = useAppDispatch();
  const hash = useSelector((s: RootState) => selectEngineHash(s));
  const threads = useSelector((s: RootState) => selectEngineThreads(s));
  const running = useSelector((s: RootState) => selectEngineRunning(s));

  const engineToggle = useCallback(() =>
    dispatch(ui.actions.toggleEngine()), [dispatch]);

  const selectHash = useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>
    dispatch(ui.actions.setEngineHash(parseInt(e.target.value))), [dispatch]);

  const selectThreads = useCallback((e: React.ChangeEvent<HTMLSelectElement>) =>
    dispatch(ui.actions.setEngineThreads(parseInt(e.target.value))), [dispatch]);

  return (
    <div className="flex items-center text-sm p-2 gap-2 border-b border-white/5 dark:border-white/10">
      <button
        onClick={engineToggle}
        className= "border border-gray-400/60 dark:border-gray-600/60 p-2 hover:scale-105"
        title="Start/stop engine"
      >
        { running ? <IoIosPause /> : <IoIosPlay /> }
      </button>

      <select
        title="Hash size"
        className="p-2"
        onChange={selectHash}
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
        onChange={selectThreads}
        value={threads}
      >
        <option value="1">1 Threads</option>
        <option value="2">2 Threads</option>
        <option value="4">4 Threads</option>
        <option value="8">8 Threads</option>
        <option value="16">16 Threads</option>
      </select>
      <div className="flex flex-col text-xs leading-none overflow-hidden whitespace-nowrap	">
        <span>Stockfish 16</span>
        <p>in local browser</p>
      </div>
    </div>
  );
}

export default EngineControls;
