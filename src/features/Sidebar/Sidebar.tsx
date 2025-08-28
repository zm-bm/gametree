import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import TreeOptions from './components/TreeOptions';
import Fen from './components/Fen';
import { CollapsibleCard } from './components/CollapsibleCard';

const Sidebar = () => {
  return (
    <div className="flex-1 flex flex-col space-y-5 h-full">
      <ChessBoard className="sidebar-card" />

      <CollapsibleCard 
        header={<span className="font-semibold tracking-tight">Tree Options</span>}
        className="sidebar-card"
      >
        <TreeOptions className="sidebar-divider" />
      </CollapsibleCard>

      <CollapsibleCard 
        header={<span className="font-semibold tracking-tight">Engine</span>}
        className="sidebar-card"
      >
        <EngineView className="sidebar-divider" />
      </CollapsibleCard>

      <CollapsibleCard 
        header={<span className="font-semibold tracking-tight">Opening</span>}
        className="sidebar-card"
      >
        <div className="sidebar-divider">
          <span className="text-sm text-gray-500 italic">
            Opening book view coming soon!
          </span>
        </div>
      </CollapsibleCard>

      <div className="sidebar-card">
        <Fen />
      </div>
    </div>
  );
};

export default Sidebar;
