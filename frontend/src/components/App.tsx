import Board from './Board'
import BoardControls from './BoardControls'
import AnalysisControls from './AnalysisControls'
import AnalysisPane from './AnalysisPane'

function App() {
  return (
    <main className='sm:h-screen sm:w-screen flex flex-col sm:flex-row min-h-0'>
      <div className='flex-auto flex flex-col sm:w-1/2 md:w-2/5 lg:w-1/3 2xl:w-1/4'>
        <div className='flex-none aspect-w-1 aspect-h-1 w-full pt-1 pl-1'>
          <Board />
          <BoardControls />
        </div>
        <div className='flex-1 flex flex-col min-h-0'>
          <AnalysisPane />
          <AnalysisControls />
        </div>
      </div>
      <div className='flex-auto sm:h-screen sm:w-1/2 md:w-3/5 lg:w-2/3 2xl:w-3/4'>
        <p>tree</p>
      </div>
    </main> 
  )
}

export default App
 