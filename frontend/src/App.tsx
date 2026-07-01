import BoardHud from './features/Hud/BoardHud';
import TreeCanvas from './features/Tree';
import { useKeyboardActions } from './shared/hooks';

function App() {
  useKeyboardActions();

  return (
    <div className="gt-app">
      <div className="gt-app-shell">
        <main className="gt-treeview">
          <div className="gt-app-workspace" data-testid="app-workspace">
            <TreeCanvas />
            <BoardHud />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
