import Board from './Board/Board'
import EngineView from './EngineView'
import { TreeControls } from './TreeControls/TreeControls';
import { FlipButton } from './Board/FlipButton';
import Fen from './Fen';

import '../styles/ChessPanel.css';

export const ChessPanel = () => {
  return (
    <div className="chess-panel space-y-4 p-4">
      <div className="aspect-square sm:h-auto relative ">
        <FlipButton />
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
