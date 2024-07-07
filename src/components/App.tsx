import Board from './Board'
import BoardControls from './BoardControls'
import AnalysisPane from './AnalysisPane'
import MoveTree from './MoveTree'

const size = 'sm:h-screen sm:w-screen sm:flex-row min-h-0'
const bg = 'bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-200'
const classes = `flex flex-col ${size} ${bg}`

function App() {
  return (
    <main className={classes}>
      <div className='flex-auto flex flex-col sm:w-1/2 md:w-2/5 lg:w-1/3 2xl:w-1/4'>
        <div className='flex-none aspect-w-1 aspect-h-1 w-full pt-1 pl-1'>
          <Board />
          <BoardControls />
        </div>
        <div className='flex-1 flex flex-col min-h-0 p-2'>
          <AnalysisPane />
        </div>
      </div>
      <div className='flex-auto sm:h-screen sm:w-1/2 md:w-3/5 lg:w-2/3 2xl:w-3/4'>
        <MoveTree />
      </div>
    </main>
  )
}

export default App