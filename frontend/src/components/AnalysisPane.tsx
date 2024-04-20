import { useState } from "react";

import EngineTab from "./EngineTab";
import GameTab from "./GameTab";

type Tab = 'engine' | 'game';
const tabs: Tab[] = ['engine', 'game'];

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
    <div className="flex flex-col h-full shadow-md border border-gray-400 m-1 min-h-64 max-h-64 sm:min-h-0 sm:max-h-none">
      {/* tabs */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200">
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

      {/* content */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-gray-400 bg-gray-100">
        { renderTabContent() }
      </div>
    </div>
  )
}

export default AnalysisPane;
