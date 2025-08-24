import { useState } from 'react';
import clsx from 'clsx';

import MoveTreePanel from '@/features/MoveTreePanel';
import ChessPanel from '@/features/ChessPanel';
import { useKeyboardActions } from '@/shared/hooks';
import './styles/App.css'

const TABS = [
  { id: 'chess', label: 'Chess' },
  { id: 'moveTree', label: 'Tree' },
];

function App() {
  useKeyboardActions();
  const [activeTab, setActiveTab] = useState('chess');

  return (
    <main className="app-wrapper">
      <div className="app">
        <div className="app-tab-wrapper">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={clsx('app-tab-button', { 'app-tab-button-active': activeTab === tab.id })}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={clsx('chess-panel-container', { hidden: activeTab !== 'chess' }, 'sm:block')}>
          <ChessPanel />
        </div>

        <div className={clsx('move-tree-panel-container', { hidden: activeTab !== 'moveTree' }, 'sm:block')}>
          <MoveTreePanel />
        </div>
      </div>
    </main>
  );
}

export default App;
