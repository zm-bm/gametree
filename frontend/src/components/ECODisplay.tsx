import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Move } from 'chess.js'
import { moveNumFromFen } from '../chess'

const ECODisplay = () => {
  const moveList = useSelector((state: RootState) => state.game.moveList)
  const eco = useSelector((state: RootState) => state.openings.eco)

  const moveToStr = (m: Move) => ((m.color==='w' ? `${moveNumFromFen(m.before)}.` : '') + m.san)
  const moveSeq = moveList.map(moveToStr).join(' ')
  const entry = eco[moveSeq]

  return (
    <div className='flex flex-col text-xs leading-none'>
      <p>{entry?.code}</p>
      <p>{entry?.name}</p>
    </div>
  );
}

export default ECODisplay;
