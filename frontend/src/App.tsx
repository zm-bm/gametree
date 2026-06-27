import { useState } from 'react';

import TreeView from './features/TreeView';
import Sidebar from './features/Sidebar';
import { useKeyboardActions } from './shared/hooks';
import { cn } from './shared/cn';

const TABS = [
  { id: 'sidebar', label: 'Chess' },
  { id: 'tree', label: 'Move Tree' },
];

function App() {
  useKeyboardActions();
  const [activeTab, setActiveTab] = useState('tree');

  return (
    <div className="gt-app">
      <div className="gt-app-shell">

        <div className="gt-mobile-tabs">
          {TABS.map(tab => (
            <button
              type="button"
              key={tab.id}
              className={cn('gt-mobile-tab', { 'gt-mobile-tab-active': activeTab === tab.id })}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <aside className={cn({ hidden: activeTab !== 'sidebar' }, 'gt-sidebar sm:block')}>
          <Sidebar />
        </aside>

        <main className={cn({ hidden: activeTab !== 'tree' }, 'gt-treeview sm:block')}>
          <TreeView />
        </main>
      </div>
    </div>
  );
}

export default App;
