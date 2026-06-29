import Sidebar from '@/features/Sidebar';
import TreeWorkspace from '@/features/TreeWorkspace';

const AppShell = () => {
  return (
    <div className="gt-app">
      <div className="gt-app-shell">
        <aside className="hidden gt-sidebar sm:block">
          <Sidebar />
        </aside>

        <main className="gt-treeview">
          <TreeWorkspace />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
