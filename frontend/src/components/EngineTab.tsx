import { useSelector } from "react-redux";
import { RootState } from '../store';

const EngineTab = () => {
  const engineOutput = useSelector((state: RootState) => state.engine.output);

  return (
    <div className="p-1 font-mono text-xs leading-tight">
      {engineOutput.slice(0).reverse().map((line, index) => (
        <p key={index}>
          {line}
        </p>
      ))}
    </div>
  )
};

export default EngineTab;
