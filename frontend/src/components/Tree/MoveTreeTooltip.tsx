import { TooltipWithBounds } from "@visx/tooltip";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNode } from "../../chess";
import BaseBoard from "../Board/BaseBoard";
import { countGames } from "./helpers";
import { Key } from "chessground/types";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import WinChanceBar from "../WinChanceBar";

interface Props {
  tooltip: UseTooltipParams<HierarchyPointNode<TreeNode>>
};
export const MoveTreeTooltip = ({ tooltip }: Props) => {
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = tooltip;
  if (!tooltipOpen || !tooltipData) return null;

  const move = tooltipData.data.attributes.move;
  const totalGames = countGames(tooltipData.data);
  const parent = tooltipData.parent;
  const { wins, draws, losses } = tooltipData.data.attributes;

  return (
    <TooltipWithBounds
      key={Math.random()}
      top={tooltipTop}
      left={tooltipLeft}
      className="border border-neutral-400"
    >
      <div className="flex border-b border-neutral-400 text-sm">
        <div className="flex-auto overflow-hidden">
          <span className="font-bold mr-1">Games:</span>
          <span>{totalGames.toLocaleString()}</span>
        </div>
        {
          parent &&
          <div className="flex-auto overflow-hidden">
            <span className="font-bold mr-1">Frequency:</span>
            <span>{(totalGames / countGames(parent.data) * 100).toFixed(2)}%</span>
          </div>
        }
      </div>
      {
        (wins && draws && losses) &&
        <div className="flex items-center py-1 text-sm">
          <span className="font-bold mr-1">Wins:</span>
          <WinChanceBar
            win={wins/totalGames*100}
            draw={draws/totalGames*100}
            loss={losses/totalGames*100}
          />
        </div>
      }
      <div className='relative h-[320px] w-[320px]'>
        <BaseBoard
          config={{
            fen: move?.after,
            orientation,
            coordinates: false,
            viewOnly: true,
            lastMove: (move ? [move?.from as Key, move?.to as Key] : []),
          }}
        />
      </div>
    </TooltipWithBounds>
  );
}
