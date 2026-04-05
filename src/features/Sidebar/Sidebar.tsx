import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import OpeningView from './components/OpeningView';

const Sidebar = () => {
  return (
    <div className="gt-sidebar-layout">
      <div className="gt-sidebar-board-slot">
        <ChessBoard className="gt-sidebar-panel" />
      </div>

      <div className="gt-sidebar-scroll-region" data-testid="sidebar-scroll">
        <div className="gt-sidebar-stack">
          <OpeningView />
          <EngineView />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
