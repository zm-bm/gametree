import { useState } from "react";
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { TOGGLE_ENGINE } from "../redux/engineSlice";

import { AppDispatch, RootState } from '../store';
import EngineTab from "./EngineTab";
import GameTab from "./GameTab";

type Tab = 'game' | 'engine';
const tabs: Tab[] = ['game', 'engine'];

const AnalysisPane = () => {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const engineRunning = useSelector((state: RootState) => state.engine.running);
  const dispatch = useDispatch<AppDispatch>();

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
    <div className="flex flex-col h-full shadow-md border border-neutral-400 m-1 min-h-0">
      {/* tabs */}
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


      {/* content */}
      <div className="flex-1 min-h-0 border-t border-gray-400 bg-gray-100 overflow-auto">
        { renderTabContent() }
      </div>
    </div>
  )
}

export default AnalysisPane;
