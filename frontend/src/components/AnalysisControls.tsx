import { useDispatch, useSelector } from "react-redux";
import { IoIosPause, IoIosPlay } from "react-icons/io";

import { TOGGLE_ENGINE } from "../redux/engineSlice";
import { AppDispatch, RootState } from '../store';

const AnalysisControls = () => {
  const running = useSelector((state: RootState) => state.engine.running);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="flex items-center p-1 gap-1 border-t border-gray-400 bg-gradient-to-b from-gray-100 to-gray-200">
      <button
        title="Start/stop engine"
        className="btn-primary p-1.5"
        onClick={() => dispatch(TOGGLE_ENGINE())}
      >
        { running ? <IoIosPause /> : <IoIosPlay /> }
      </button>
      <select title="Hash size" className="btn-primary">
        <option value="1">1MB</option>
        <option value="2">2MB</option>
        <option value="4">4MB</option>
        <option value="8">8MB</option>
      </select>
      <select title="# of threads" className="btn-primary">
        <option value="1">1 CPU</option>
        <option value="2">2 CPU</option>
        <option value="4">4 CPU</option>
        <option value="8">8 CPU</option>
        <option value="16">16 CPU</option>
        <option value="32">32 CPU</option>
      </select>
      <label className="relative btn-primary w-[5.5rem]">
        <input
          type="number"
          min={1} max={99}
          className="bg-transparent w-full"
          defaultValue={1}
        />
        <span className="absolute right-6 pointer-events-none">Lines</span>
      </label>
    </div>
  );
}

export default AnalysisControls;
