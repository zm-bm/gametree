import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { book } from '../lib/chess'
import { movesToString } from '../lib/chess'
import { selectMovesList } from '../redux/gameSlice'

const ECODisplay = () => {
  const moves = useSelector((state: RootState) => selectMovesList(state))
  let name = movesToString(moves) 

  let eco = book.find(b => b.uci === name);
  while (!eco && name) {
    name = name.split(',').slice(0, -1).join(',')
    eco = book.find(b => b.uci === name);
  }
  
  return (
    <div className='h-8 flex items-center'>
      <p className='text-xs leading-none'>
        <span>{eco?.eco}</span>
        {eco ? ': ' : ''}
        <span>{eco?.name}</span>
      </p>
    </div>
  );
}

export default ECODisplay;
