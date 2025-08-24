import { useCallback } from "react";
import { IoMdSync } from "react-icons/io";
import { useDispatch } from "react-redux";

import { AppDispatch } from "@/store";
import { ui } from "@/store/slices";

const ToggleOrientationButton = () => {
  const dispatch = useDispatch<AppDispatch>()
  const toggle = useCallback(() => dispatch(ui.actions.toggleOrientation()), [dispatch])

  return (
    <button
      className="absolute z-50 h-4 w-4 -top-4 -left-4 m-0.5 grid place-items-center bg-transparent rotate-90
        text-zinc-400/60 dark:text-zinc-400/60 hover:text-zinc-700 dark:hover:text-zinc-400"
      title='Flip board'
      onClick={toggle}
    >
      <IoMdSync className='m-auto' strokeWidth={16} />
    </button>
  );
};

export default ToggleOrientationButton;
