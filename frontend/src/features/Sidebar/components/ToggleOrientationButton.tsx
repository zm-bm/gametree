import { useCallback } from 'react';
import { IoMdSync } from 'react-icons/io';

import { cn } from '@/shared/cn';
import { useAppDispatch } from '@/store';
import { ui } from '@/store/slices';

export interface ToggleOrientationButtonProps {
  className?: string;
}

const ToggleOrientationButton = ({ className }: ToggleOrientationButtonProps) => {
  const dispatch = useAppDispatch();
  const toggle = useCallback(() => dispatch(ui.actions.toggleOrientation()), [dispatch]);

  return (
    <button
      type="button"
      className={cn('gt-position-inspector-board-action', className)}
      aria-label="Flip board"
      title="Flip board"
      onClick={toggle}
    >
      <IoMdSync className="rotate-90" aria-hidden="true" />
    </button>
  );
};

export default ToggleOrientationButton;
