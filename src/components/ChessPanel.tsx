import Board from './Board/Board'
import EngineView from './EngineView'
import { TreeControls } from './TreeControls/TreeControls';
import { ToggleOrientationButton } from './Board/ToggleOrientationButton';
import Fen from './Fen';

import '../styles/ChessPanel.css';

export const ChessPanel = () => {
  return (
    <div className="chess-panel space-y-4 py-4 px-1">
      <div className="aspect-square sm:h-auto relative">
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
