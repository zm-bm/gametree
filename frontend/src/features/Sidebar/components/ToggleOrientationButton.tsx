import { useCallback } from "react";
import { IoMdSync } from "react-icons/io";

import { useAppDispatch } from "@/store";
import { ui } from "@/store/slices";

const ToggleOrientationButton = () => {
  const dispatch = useAppDispatch()
  const toggle = useCallback(() => dispatch(ui.actions.toggleOrientation()), [dispatch])

  return (
    <button
      className="absolute -top-4 -left-4 text-zinc-400/60 dark:text-zinc-400/60 hover:text-zinc-700 dark:hover:text-zinc-400"
      title='Flip board'
      onClick={toggle}
    >
      <IoMdSync className='rotate-90' strokeWidth={16} />
    </button>
  );
};

export default ToggleOrientationButton;
