import Board from './Board'
import BoardControls from './BoardControls'
import AnalysisPane from './AnalysisPane'
import '../styles/ChessPanel.css';
import { TreeControls } from './TreeControls/TreeControls';

export const ChessPanel = () => {
  return (
    <div className="chess-panel">
      <div className="aspect-square sm:h-auto">
        <Board />
      </div>
      
      <div className="chess-panel-card -mt-1">
        <BoardControls />
      </div>

      <div className="chess-panel-card">
        <TreeControls />
      </div>

      <div className="chess-panel-card">
        {/* <AnalysisPane /> */}
      </div>

    </div>
  );
};
