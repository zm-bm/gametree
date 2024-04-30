import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import MoveButton from "./MoveButton";
import { AppDispatch, RootState } from "../store";
import { GOTO_MOVE } from "../redux/actions";
import { DEFAULT_POSITION } from "chess.js";
import Fen from "./Fen";


const GameTab = () => {
  const moveTree = useSelector((state: RootState) => state.game.moveTree)
  const dispatch = useDispatch<AppDispatch>()

  const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    const datakey = e.currentTarget.getAttribute('data-key');
    if (datakey) {
      const key = +datakey
      dispatch(GOTO_MOVE({ key, fen: moveTree[key].move?.after || DEFAULT_POSITION }))
      // goto(+key);
    }
  }, [moveTree])

  function buildHistory(children: number[], isStartOfVariation: boolean = false) {
    const pvKey = children.at(0)
    if (pvKey === undefined) return <></>;
    const pvMoveNode = moveTree.at(pvKey);
    if (pvMoveNode === undefined) return <></>;

    return (
      <React.Fragment key={pvKey}>
        {/* primary variation */}
        <MoveButton
          moveKey={pvKey}
          move={pvMoveNode.move}
          isStartOfVariation={isStartOfVariation}
          onClick={onClick}
        />

        {/* recursive variations */}
        {
          children.slice(1).flatMap(k => {
            const moveNode = moveTree.at(k);
            if (moveNode === undefined) return <></>;
            return (
              <div key={k} className="pl-6">
                <span>(</span>
                <MoveButton
                  moveKey={k}
                  move={moveNode.move}
                  isStartOfVariation={true}
                  onClick={onClick}
                />
                { buildHistory(moveNode.children, false) }
                <span>)</span>
              </div>
            )
          })
        }

        {/* continue principal variation with children */}
        { buildHistory(pvMoveNode.children, children.length > 1) }
      </React.Fragment>
    );
  }



  return (
    <>
      <div className="flex-1 p-1 font-mono text-sm leading-tight overflow-auto">
        { buildHistory(moveTree[0].children) }
      </div>
      <Fen />
    </>
  );
}

export default GameTab;
