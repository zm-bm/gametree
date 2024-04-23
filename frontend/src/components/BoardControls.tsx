import { 
  IoIosRewind,
  IoIosFastforward,
  IoIosSkipForward,
  IoIosSkipBackward,
  IoMdSync,
} from "react-icons/io";
import { FaChess } from "react-icons/fa";
import { useCallback, useEffect, useRef, useState } from "react";
import { throttle } from "../lib/helpers";
import { useMoveActions } from "../hooks/moveHooks";
import { IoSettingsSharp } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { FLIP_ORIENTATION } from "../redux/boardSlice";

const BoardControls = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { undo, redo, rewind, forward } = useMoveActions();
  const dispatch = useDispatch<AppDispatch>()
  const flip = useCallback(() => dispatch(FLIP_ORIENTATION()), [])
  const clickSettings = useCallback(() => setSettingsOpen(!settingsOpen), [settingsOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          forward();
          break;
        case 'ArrowDown':
          rewind();
          break;
        case 'ArrowLeft':
          undo();
          break;
        case 'ArrowRight':
          redo();
          break;
        default:
          break;
      }
    };
    const debouncedKeyDown = throttle(handleKeyDown, 200);
    window.addEventListener('keydown', debouncedKeyDown);
    return () => window.removeEventListener('keydown', debouncedKeyDown);
  }, [undo, forward, redo, forward]);

  useEffect(() => {
    // Close the dropdown when clicking outside of it
    const mousedown = (event: MouseEvent) => {
      if (
        !buttonRef?.current?.contains(event.target as HTMLElement) &&
        !dropdownRef?.current?.contains(event.target as HTMLElement)
      ) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', mousedown);
    return () => {
      document.removeEventListener('mousedown', mousedown);
    };
  }, [buttonRef, dropdownRef]);


  const buttonClass = "btn-primary p-2";
  return (
    <div className="flex items-center gap-1 pt-1">
      {/* game controls */}
      <button onClick={rewind} className={buttonClass} title='Rewind to first move'>
        <IoIosRewind className='m-auto' />
      </button>
      <button onClick={undo} className={buttonClass} title='Undo last move'>
        <IoIosSkipBackward className='m-auto' />
      </button>
      <button onClick={redo} className={buttonClass} title='Redo next move'>
        <IoIosSkipForward className='m-auto' />
      </button>
      <button onClick={forward} className={buttonClass} title='Forward to last move'>
        <IoIosFastforward className='m-auto' />
      </button>

      {/* settings / dropdown */}
      <div className="relative">
        <button onClick={clickSettings} className={`${buttonClass} group`} ref={buttonRef}>
          <IoSettingsSharp className='m-auto group-hover:rotate-90 transform transition ease-in-out' />
        </button>
        <div
          ref={dropdownRef}
          className={`flex flex-col gap-2 w-40 p-2 absolute bottom-9 z-10 bg-gray-100 border border-gray-400 rounded-sm shadow-xl ${
            settingsOpen ? '' : 'hidden'
          }`}
        >
          <div className="flex gap-2 items-center">
            <button onClick={flip} className={buttonClass} title='Flip board'>
              <IoMdSync className='m-auto' strokeWidth={16} />
            </button>
            <p>Flip board</p>
          </div>
          <div className="flex gap-2 items-center">
            <button className={buttonClass} title='Setup board'>
              <FaChess className='m-auto' strokeWidth={16} />
            </button>
            <p>Setup board</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardControls;
