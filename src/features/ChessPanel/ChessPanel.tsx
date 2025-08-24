import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import TreeOptions from './components/TreeOptions';
import Fen from './components/Fen';

import './ChessPanel.css';

const ChessPanel = () => {
  return (
    <div className="chess-panel">
      <ChessBoard />
      
      <div className="chess-panel-card">
        <TreeOptions />
      </div>

      <div className="chess-panel-card">
        <EngineView />
      </div>

      <div className="chess-panel-card">
        <Fen />
        <Fen />
        <Fen />
        <Fen />
      </div>
    </div>
  );
};

export default ChessPanel;
