import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useContext, useMemo } from 'react'
import { OpeningsContext } from './App'

const ECODisplay = () => {
  const moveList = useSelector((state: RootState) => state.game.moveList)
  const openings = useContext(OpeningsContext)

  const { code, title } = useMemo(() => {
    let book = openings 
    for (const i in moveList) {
      const san = moveList[i].san;
      if (book.children) {
        const childBook = book.children.find(b => b.move === san)
        if (childBook) {
          book = childBook
        } else {
          break
        }
      } else {
        break;
      }
    }
    return {
      code: book?.code,
      title: book?.title,
    }
  }, [openings, moveList])

  return (
    <div className='flex flex-col text-xs leading-none'>
      <p>{code}</p>
      <p>{title}</p>
    </div>
  );
}

export default ECODisplay;
