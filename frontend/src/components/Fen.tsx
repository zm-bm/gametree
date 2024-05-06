import { useSelector } from "react-redux";
import { RootState } from "../store";

const Fen = () => {
  const fen = useSelector((state: RootState) => state.board.fen);

  return (
    <div className='flex items-center text-xs gap-1 p-1 border-t border-neutral-400 neutral-gradient-to-b'>
      <span>FEN:</span>
      <input className='flex-auto p-1 bg-transparent border border-neutral-400 rounded'
        value={fen} readOnly
      />
    </div>
  );
}

export default Fen;
