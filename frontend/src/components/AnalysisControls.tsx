import { useDispatch, useSelector } from "react-redux";
import { CiPause1, CiPlay1 } from "react-icons/ci";

import { TOGGLE_ENGINE } from "../redux/engineSlice";
import { AppDispatch, RootState } from '../store';

const AnalysisControls = () => {
  const running = useSelector((state: RootState) => state.engine.running);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="flex items-center pl-1 pb-1 gap-1">
      <button
        className="btn-primary p-2"
        onClick={() => dispatch(TOGGLE_ENGINE())}
      >
        { running ? <CiPause1 /> : <CiPlay1 />  }
      </button>
    </div>
  );
}

export default AnalysisControls;
