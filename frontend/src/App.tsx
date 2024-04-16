import Board from './Board'

function App() {
  return (
    <main className='h-screen w-screen flex flex-col sm:flex-row'>
      <div className='flex-auto flex flex-col sm:w-1/2 md:w-2/5 lg:w-1/3'>
        <div className='flex flex-col p-1'>
          <Board />
        </div>
        <div className='flex-auto h-1/2 flex flex-col'>
          <p>engine</p>
        </div>
      </div>

      <div className='flex-auto sm:h-screen sm:w-1/2 md:w-3/5 lg:w-2/3'>
        <p>tree</p>
      </div>
    </main> 
  )
}

export default App
 