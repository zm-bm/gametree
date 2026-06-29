import AppShell from './features/AppShell';
import { useKeyboardActions } from './shared/hooks';

function App() {
  useKeyboardActions();
  return <AppShell />;
}

export default App;
