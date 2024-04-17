import { useState } from "react";
import EngineTab from "./EngineTab";


type Tab = 'game' | 'engine';
const tabs: Tab[] = ['game', 'engine'];

const GameTab = () => <div className="flex-1 h-full">Content of Game tab</div>;

const AnalysisPane = () => {
  const [activeTab, setActiveTab] = useState<Tab>('engine');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'game':
        return <GameTab />;
      case 'engine':
        return <EngineTab />;
      default:
        return <div></div>;
    }
  };

  return (
    <div className="flex flex-col h-full shadow-xl border border-neutral-400 m-1 min-h-0">
      <div className="bg-gradient-to-b from-neutral-100 to-neutral-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(tab)}
            className={`pt-1 px-4 text-gray-700 hover:text-gray-950 focus:outline-none font-mono border-b-2 ${
              activeTab === tab ? 'border-gray-900' : 'border-transparent'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 border-t border-neutral-400 bg-neutral-100 overflow-auto">
        { renderTabContent() }
      </div>
    </div>
  )
}

export default AnalysisPane;
