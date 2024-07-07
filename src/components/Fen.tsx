import { useSelector } from "react-redux";
import { RootState } from "../store";
import { selectFen } from "../redux/gameSlice";

const Fen = () => {
  const fen = useSelector((state: RootState) => selectFen(state));

  return (
    <div className='flex items-center text-sm gap-1 p-1 border-t border-neutral-400 bg-neutral-200'>
      <span>FEN:</span>
      <input className='flex-auto p-1 bg-transparent border border-neutral-400 rounded btn-primary'
        value={fen} readOnly
      />
    </div>
  );
}

export default Fen;
