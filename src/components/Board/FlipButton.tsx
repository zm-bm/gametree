import { useCallback } from "react";
import { IoMdSync } from "react-icons/io";
import { useDispatch } from "react-redux";
import { FlipOrientation } from "../../redux/gameSlice";
import { AppDispatch } from "../../store";

export const FlipButton = () => {
  const dispatch = useDispatch<AppDispatch>()
  const flip = useCallback(() => dispatch(FlipOrientation()), [dispatch])

  return (
    <button
      className="absolute z-50 h-4 w-4 -top-4 -right-4 m-0.5 grid place-items-center bg-transparent rotate-90
        text-zinc-400/60 dark:text-zinc-400/60 hover:text-zinc-700 dark:hover:text-zinc-400"
      title='Flip board'
      onClick={flip}
    >
      <IoMdSync className='m-auto' strokeWidth={16} />
    </button>
  );
};
