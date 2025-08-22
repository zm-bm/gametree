import Board from './components/Board/Board'
import EngineView from './components/EngineView'
import { TreeControls } from './components/TreeControls';
import { ToggleOrientationButton } from './components/ToggleOrientationButton';
import Fen from './components/Fen';

import './ChessPanel.css';

const ChessPanel = () => {
  return (
    <div className="chess-panel">
      <div className="aspect-square h-auto relative">
        <ToggleOrientationButton />
        <Board />
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

export default ChessPanel;
