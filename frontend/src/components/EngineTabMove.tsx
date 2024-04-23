import MoveText from "./MoveText";

interface Props {
  onHover: React.MouseEventHandler<HTMLButtonElement>,
  moves: string[],
  move: string,
  moveNum: number,
  isWhitesTurn: boolean,
  showMoveNum: boolean,
}

const EngineTabMove = (props: Props) => {
  return (
    <button
      data-moves={props.moves}
      onMouseEnter={props.onHover}
      onClick={() => {}}

      className="hover:text-sky-600 mx-0.5"
    >
      {' '}
      <MoveText
        moveNum={props.moveNum.toString()}
        moveTxt={props.move}
        isWhitesTurn={props.isWhitesTurn}
        showMoveNum={props.showMoveNum}
      />
    </button>
  );
}

export default EngineTabMove;
