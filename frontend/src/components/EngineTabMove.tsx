import { Move } from "chess.js";
import MoveText from "./MoveText";
import { moveNumFromFen } from "../chess";

interface Props {
  onHover: React.MouseEventHandler<HTMLButtonElement>,
  move: Move,
  showMoveNum: boolean,
}

const EngineTabMove = (props: Props) => {
  return (
    <button
      data-fen={props.move.after}
      data-move={props.move.lan}
      onMouseEnter={props.onHover}
      onClick={() => {}}
      className="hover:text-sky-600"
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
