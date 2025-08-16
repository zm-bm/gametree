import { useSelector } from "react-redux";
import { RootState } from "../store";
import { selectFen } from "../redux/gameSlice";

const Fen = () => {
  const fen = useSelector((state: RootState) => selectFen(state));

  return (
    <div className='flex items-center text-xs gap-1 p-1'>
      <span>FEN:</span>
      <input className='flex-auto p-1 border border-neutral-400/60 dark:border-600/60 rounded bg-transparent'
        value={fen} readOnly
      />
    </div>
  );
}

export default Fen;
