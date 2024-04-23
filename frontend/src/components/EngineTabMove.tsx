import { Move } from "chess.js";
import MoveText from "./MoveText";
import { moveNumFromFen } from "../chess";

interface Props {
  onHover: React.MouseEventHandler<HTMLButtonElement>,
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  move: Move,
  moves: string[],
  showMoveNum: boolean,
}

const EngineTabMove = (props: Props) => {
  return (
    <button
      data-fen={props.move.after}
      data-moves={props.moves.join(',')}
      onMouseEnter={props.onHover}
      onClick={props.onClick}
      className="hover:text-sky-600 hover:underline"
    >
      <MoveText
        moveNum={moveNumFromFen(props.move.before)}
        moveTxt={props.move.san}
        isWhitesTurn={props.move.color === 'w'}
        showMoveNum={props.showMoveNum}
      />
    </button>
  );
}

export default EngineTabMove;
