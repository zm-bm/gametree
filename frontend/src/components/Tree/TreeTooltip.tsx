import { TooltipWithBounds } from "@visx/tooltip";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNode } from "../../chess";
import BaseBoard from "../Board/BaseBoard";
import { countGames } from "../../chess";
import { Key } from "chessground/types";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import WinChanceBar from "../WinChanceBar";
import { TransformMatrix } from "@visx/zoom/lib/types";

interface Props {
  tooltip: UseTooltipParams<HierarchyPointNode<TreeNode>>
  transformMatrix: TransformMatrix,
};
export const TreeTooltip = ({ tooltip, transformMatrix }: Props) => {
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = tooltip;
  if (!tooltipOpen || !tooltipData || !tooltipTop || !tooltipLeft) {
    return null;
  }

  const totalGames = countGames(tooltipData.data);
  const parent = tooltipData.parent;
  const { move, white, draws, black, averageRating } = tooltipData.data.attributes;
  const freq = parent && totalGames / countGames(parent.data) * 100;

  return (
    <TooltipWithBounds
      key={Math.random()}
      top={tooltipTop}
      left={tooltipLeft + (10 * transformMatrix.scaleX)}
      className="border border-neutral-400 font-mono"
    >
      <div className="text-base text-neutral-800">
        <span className="font-bold pr-1">Games:</span>
        <span>{totalGames.toLocaleString()}</span>
      </div>
      {
          freq &&
          <div className="text-base text-neutral-800">
            <span className="font-bold pr-1">Frequency:</span>
            <span>{(freq).toFixed(2)}%</span>
            {
              freq > 100 &&
              <span className="pl-1">(from transpositions)</span>
            }
          </div>
        }
      {
        averageRating &&
        <div className="text-base text-neutral-800">
          <span className="font-bold pr-1">Avg. rating:</span>
          <span>{averageRating} Elo</span>
        </div>
      }
      {
        (white !== null && draws !== null && black !== null) &&
        <div className="flex items-center text-base text-neutral-800 pb-1">
          <span className="font-bold pr-1">Wins:</span>
          <WinChanceBar
            white={white/totalGames*100}
            draws={draws/totalGames*100}
            black={black/totalGames*100}
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
