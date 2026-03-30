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

      <SidebarCard title="Bookmarks">
        <span className="text-sm text-gray-500 italic">
          Bookmarks view coming soon!
        </span>
      </SidebarCard>
    </div>
  );
};

export default Sidebar;
