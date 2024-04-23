interface Props {
  moveNum?: string,
  moveTxt: string,
  isWhitesTurn: boolean,
  showMoveNum: boolean,
}

const MoveText = (props: Props) => {
  return (
    <>
      {
        props.showMoveNum &&
        <span>
          {props.moveNum}{props.isWhitesTurn ?  '.' : <>&#8230;</>}
        </span>
      }
      { props.moveTxt }
    </>
  );
}

export default MoveText;
