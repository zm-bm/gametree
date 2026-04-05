import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import OpeningView from './components/OpeningView';

const Sidebar = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
      <div className="shrink-0 px-5">
        <ChessBoard className="sidebar-card" />
      </div>

      <div className="sidebar-scroll min-h-0 flex-1" data-testid="sidebar-scroll">
        <div className="space-y-5 pr-1">
          <OpeningView />
          <EngineView />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
