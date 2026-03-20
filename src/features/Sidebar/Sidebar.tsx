import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import Fen from './components/Fen';
import OpeningView from './components/OpeningView';
import { SidebarCard } from './components/SidebarCard';

const Sidebar = () => {
  return (
    <div className="flex-1 flex flex-col space-y-5 h-full">
      <ChessBoard className="sidebar-card" />

      <SidebarCard title="Opening">
        <OpeningView />
      </SidebarCard>

      <SidebarCard title="Engine">
        <EngineView />
      </SidebarCard>

      <SidebarCard title="Bookmarks">
        <span className="text-sm text-gray-500 italic">
          Bookmarks view coming soon!
        </span>
      </SidebarCard>

      <div className="sidebar-card">
        <Fen />
      </div>
    </div>
  );
};

export default Sidebar;
