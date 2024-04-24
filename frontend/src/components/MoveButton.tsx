import { Move } from "chess.js";
import { colorFromFen, moveNumFromFen } from "../chess";
import MoveText from "./MoveText";
import { useSelector } from "react-redux";
import { RootState } from "../store";

type MoveProps = {
  moveKey: number,
  move: Move | null,
  isStartOfVariation: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>,
}
function MoveButton(props: MoveProps) {
  const key = useSelector((state: RootState) => state.game.key)

  if (props.move === null) return <></>;

  const fen = props.move.before;
  const isWhitesTurn = colorFromFen(fen) === 'w';
  const moveNum = moveNumFromFen(fen);

  return (
    <>
      <button
        data-key={props.moveKey}
        className={`hover:text-sky-600 hover:underline cursor-pointer focus:outline-none ${
          key === props.moveKey ? 'font-bold' : ''}
        `}
        onClick={props.onClick}
      >
        &#32;
        <MoveText
          moveTxt={props.move.san}
          moveNum={moveNum}
          isWhitesTurn={isWhitesTurn}
          showMoveNum={isWhitesTurn || props.isStartOfVariation}
        />
      </button>
      &#32;
    </>
  );
};

export default MoveButton;
