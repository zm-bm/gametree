import { useState } from 'react';

import TreeView from '@/features/TreeView';
import Sidebar from '@/features/Sidebar';
import { useKeyboardActions } from '@/shared/hooks';
import { cn } from '@/shared/lib/cn';

const TABS = [
  { id: 'sidebar', label: 'Chess' },
  { id: 'tree', label: 'Move Tree' },
];

const tabWrapper = [
  'flex flex-row w-full h-[48px] sm:hidden',
  'text-primary font-medium text-center',
  'bg-sidebar border-b border-sidebar',
]

const tabBase = 'flex-1 bg-sidebar border-b-4 border-transparent';
const tabActive = 'bg-lightmode-700/50 dark:bg-darkmode-900/80 border-highlight-500';

function App() {
  useKeyboardActions();
  const [activeTab, setActiveTab] = useState('tree');

  return (
    <div className="w-full h-full min-h-screen max-h-screen">
      <div className="flex flex-col sm:flex-row w-full h-full">

        <div className={cn(tabWrapper)}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={cn(tabBase, { [tabActive]: activeTab === tab.id })}
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
