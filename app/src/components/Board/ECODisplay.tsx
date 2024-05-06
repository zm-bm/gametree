import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { book } from '../../chess'
import { movesToString } from '../../chess'
import { selectMovesList } from '../../redux/gameSlice'

const ECODisplay = () => {
  const moves = useSelector((state: RootState) => selectMovesList(state))
  var name = movesToString(moves) 

  var eco = book.find(b => b.uci === name);
  while (!eco && name) {
    name = name.split(',').slice(0, -1).join(',')
    eco = book.find(b => b.uci === name);
  }
  
  return (
    <div className='flex flex-col text-xs leading-none'>
      <p>{eco?.eco}</p>
      <p>{eco?.name}</p>
    </div>
  );
}

export default ECODisplay;
