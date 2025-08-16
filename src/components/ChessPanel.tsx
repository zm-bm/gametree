import Board from './Board'
import BoardControls from './BoardControls'
import EngineView from './EngineView'
import '../styles/ChessPanel.css';
import { TreeControls } from './TreeControls/TreeControls';
import Fen from './Fen';

export const ChessPanel = () => {
  return (
    <div className="chess-panel">
      <div className="aspect-square sm:h-auto">
        <Board />
      </div>
      
      <div className="chess-panel-card">
        <BoardControls />
      </div>

      <div className="chess-panel-card">
        <TreeControls />
      </div>

      <div className="chess-panel-card">
        <EngineView />
      </div>

      <div className="chess-panel-card">
        <Fen />
      </div>

    </div>
  );
};
