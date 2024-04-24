import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Move } from 'chess.js'
import { moveNumFromFen } from '../chess'
import { useMemo } from 'react'
import { ECO } from '../redux/openingsSlice'

const ECODisplay = () => {
  const moveList = useSelector((state: RootState) => state.game.moveList)
  const eco = useSelector((state: RootState) => state.openings.eco)

  const { code, name } = useMemo(() => {
    const moveToStr = (m: Move) => ((m.color==='w' ? `${moveNumFromFen(m.before)}.` : '') + m.san)
    const moves = moveList.map(moveToStr)
    let current = eco
    for (const i in moves) {
      let mv = moves[i]
      if (Object.hasOwn(current, mv))
        current = current[mv] as ECO
      else
        break
    }
    return {
      code: current?.ECO as string,
      name: current?.name as string,
    }
  }, [eco, moveList])

  return (
    <div className='flex flex-col text-xs leading-none'>
      <p>{code}</p>
      <p>{name}</p>
    </div>
  );
}

export default ECODisplay;
