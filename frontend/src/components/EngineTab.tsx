import { useSelector } from "react-redux";
import { RootState } from '../store';
import EngineControls from "./EngineControls";

const EngineTab = () => {
  const engineOutput = useSelector((state: RootState) => state.engine.output);

  return (
    <>
      <div className="flex-1 p-1 font-mono text-xs leading-tight overflow-auto">
        {engineOutput.slice(0).reverse().map((line, index) => (
          <p key={index}>
            {line}
          </p>
        ))}
      </div>
      <EngineControls />
    </>
  )
};

export default EngineTab;
