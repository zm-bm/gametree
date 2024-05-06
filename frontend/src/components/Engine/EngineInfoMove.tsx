import { Move } from "chess.js";

interface Props {
  move: Move,
  onMouseEnter: React.MouseEventHandler<HTMLDivElement>,
  onMouseLeave: React.MouseEventHandler<HTMLDivElement>,
  onMouseMove: React.MouseEventHandler<HTMLDivElement>,
}

export const EngineInfoMove = ({ move, ...props }: Props) => {
  const moveNumber = move.before.split(' ').at(-1) || '';

  return (
    <span
      key={move.lan}
      data-move={move.lan}
      data-fen={move.after}
      className="hover:text-sky-600 cursor-pointer"
      onMouseEnter={props.onMouseEnter}
      onMouseMove={props.onMouseMove}
      onMouseLeave={props.onMouseLeave}
    >
      {
        move.color === 'w' &&
        moveNumber + (move.color === 'w' ?  '.' : <>&#8230;</>)
      }
      { move.san }
      &#32;
    </span>
  );
}
