import { Move } from "chess.js";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

type Props = {
  moveKey: number,
  move: Move | null,
  isStartOfVariation: boolean
  onClick: React.MouseEventHandler<HTMLButtonElement>,
}
function GameInfoMove(props: Props) {
  const currentMove = useSelector((state: RootState) => state.game.currentMove)

  if (props.move === null) return <></>;

  const fen = props.move.before;
  const isWhitesTurn = props.move.color === 'w';
  const moveNumber = fen.split(' ').at(-1) || '';

  return (
    <>
      <button
        data-key={props.moveKey}
        className={`hover:text-sky-600 hover:underline cursor-pointer focus:outline-none ${
          currentMove === props.moveKey ? 'font-bold' : ''}
        `}
        onClick={props.onClick}
      >
        {
          (isWhitesTurn || props.isStartOfVariation) &&
          <>{moveNumber}{isWhitesTurn ?  '.' : <>&#8230;</>}</>
        }
        { props.move.san }
      </button>
      &#32;
    </>
  );
}

export default GameInfoMove;