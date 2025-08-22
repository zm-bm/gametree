import { useSelector } from "react-redux";

import { RootState } from "../../../store";
import { selectCurrentFen } from "../../../store/selectors";

const Fen = () => {
  const fen = useSelector((s: RootState) => selectCurrentFen(s));

  return (
    <div className='flex flex-col text-xs gap-1 p-4'>
      <div>FEN:</div>
      <input className='flex-auto text-[10px] p-1 border border-neutral-400/60 dark:border-600/60 rounded bg-transparent'
        value={fen} readOnly
      />
    </div>
  );
}

export default Fen;
