import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import PositionDetailsView from './components/PositionDetailsView';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="gt-sidebar-layout">
      <div className="gt-sidebar-board-slot">
        <ChessBoard className="gt-sidebar-card" />
      </div>

      <div className="gt-sidebar-analysis-shell">
        <div className="gt-sidebar-analysis-divider" aria-hidden="true">
          <span className="gt-sidebar-analysis-divider-label">Analysis</span>
          <span className="gt-sidebar-analysis-divider-line" />
        </div>

        <div className="gt-sidebar-scroll-region" data-testid="sidebar-scroll">
          <div className="gt-sidebar-stack">
            <div className="gt-sidebar-card gt-sidebar-sections">
              <PositionDetailsView />
            </div>
            <div className="gt-sidebar-card gt-sidebar-sections">
              <EngineView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
