import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Move } from 'chess.js'
import { moveNumFromFen } from '../chess'

const ECODisplay = () => {
  const moveList = useSelector((state: RootState) => state.game.moveList)
  const openings = useSelector((state: RootState) => state.openings.openings)

  const moveToStr = (m: Move) => ((m.color==='w' ? `${moveNumFromFen(m.before)}.` : '') + m.san)
  const moveSeq = moveList.map(moveToStr).join(' ')
  const eco = openings[moveSeq]

  return (
    <div className='flex flex-col text-sm leading-tight text-nowrap overflow-hidden'>
      <p>{eco.code} - {eco.name}</p>
    </div>
  );
}

export default ECODisplay;
