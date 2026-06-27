import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import PositionSummary from "./components/PositionSummary/PositionSummary";
import PositionTheory from "./components/PositionTheory/PositionTheory";
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="gt-sidebar-layout">
      <div className="gt-sidebar-board-slot">
        <ChessBoard className="gt-sidebar-card" />
      </div>

      <div className="gt-sidebar-analysis-shell">
        <div className="gt-sidebar-stack" data-testid="sidebar-stack">
          <div className="gt-sidebar-card gt-sidebar-card--summary">
            <PositionSummary />
          </div>

          <div className="gt-sidebar-card gt-sidebar-card--engine">
            <EngineView />
          </div>
          <div className="gt-sidebar-card gt-sidebar-card--theory">
            <PositionTheory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
