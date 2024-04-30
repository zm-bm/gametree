import { useState } from "react";

import EngineTab from "./EngineTab";
import GameTab from "./GameTab";

type Tab = 'engine' | 'game';
const tabs: Tab[] = ['engine', 'game'];

const layout = "flex flex-col h-full m-1 min-h-64 max-h-64 sm:min-h-0 sm:max-h-none"
const color = "shadow-md border border-neutral-400 dark:border-neutral-600"
const tabClasses = "m-1 px-4 border-b-2 font-mono focus:outline-none"
const tabColor =  "text-neutral-800 hover:text-black dark:text-white dark:hover:text-neutral-400"
const contentLayout = "flex-1 flex flex-col min-h-0 border-t"
const contentColor = 'border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900'

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
    <div className={`${layout} ${color}`}>
      {/* tabs */}
      <div className="neutral-gradient-to-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${tabClasses} ${tabColor} ${
              activeTab === tab
              ? 'border-neutral-900 dark:border-neutral-100'
              : 'border-transparent'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* content */}
      <div className={`${contentLayout} ${contentColor}`}>
        { renderTabContent() }
      </div>
    </div>
  )
}

export default AnalysisPane;
