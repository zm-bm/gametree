import { useEffect, useState } from 'react';
import Board from './Board'
import Worker from '../worker?worker'

function App() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [chessOutput, setChessOutput] = useState('');

  useEffect(() => {
    const newWorker = new Worker();

    newWorker.onmessage = (e) => {
      console.log('Received:', e.data);
      setChessOutput(e.data);
    };
    setWorker(newWorker);
    return () => newWorker.terminate();
  }, []);

  const sendCommandToStockfish = (command: string) => {
    worker?.postMessage(10);
    // worker?.postMessage(command);
  };

  return (
    <main className='h-screen w-screen flex flex-col sm:flex-row'>
      <div className='flex-auto flex flex-col sm:w-1/2 md:w-2/5 lg:w-1/3'>
        <div className='flex flex-col p-1'>
          <Board />
        </div>
        <div className='flex-auto h-1/2 flex flex-col'>
          <p>{chessOutput}</p>
          <button onClick={() => sendCommandToStockfish('go depth 15')}>Calculate Move</button>
        </div>
      </div>

      <div className='flex-auto sm:h-screen sm:w-1/2 md:w-3/5 lg:w-2/3'>
        <p>tree</p>
      </div>
    </main> 
  )
}

export default App
 