import { MoveTreePanel } from './MoveTree/MoveTreePanel'
import { ChessPanel } from './ChessPanel';
import { useKeyboardActions } from '../hooks';
import '../styles/App.css'

function App() {
  useKeyboardActions();

  return (
    <main className="flex flex-col w-full h-full min-h-screen app">
      {/* Vertical on mobile, horizontal on larger screens */}
      <div className="flex flex-col sm:flex-row w-full h-full">
        <div className="flex flex-col w-full sm:w-1/2 md:w-2/5 lg:w-1/3 2xl:w-1/4 chess-container">
          <ChessPanel />
        </div>
        <div className="h-[70vh] sm:h-screen w-full sm:w-1/2 md:w-3/5 lg:w-2/3 2xl:w-3/4 move-tree-container">
          <MoveTreePanel />
        </div>
      </div>
    </main>
  )
}

export default App;
