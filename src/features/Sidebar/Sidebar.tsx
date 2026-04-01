import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import OpeningView from './components/OpeningView';
import { SidebarCard } from './components/SidebarCard';

const Sidebar = () => {
  return (
    <div className="flex-1 flex flex-col space-y-5 h-full">
      <ChessBoard className="sidebar-card" />

      <SidebarCard title="Opening" persistKey='gtOpeningViewCollapsed'>
        <OpeningView />
      </SidebarCard>

      <EngineView />
    </div>
  );
};

export default Sidebar;
