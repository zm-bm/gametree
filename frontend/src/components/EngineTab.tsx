import { useSelector } from "react-redux";
import { RootState } from '../store';

const EngineTab = () => {
  const engineOutput = useSelector((state: RootState) => state.engine.output);

  return (
    <div className="font-mono text-xs p-1">
      {engineOutput.slice(0).reverse().map((line, index) => (
        <p key={index}>
          {line} 
        </p>
      ))}
    </div>
  )

};

export default EngineTab;
