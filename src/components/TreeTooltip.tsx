import { useSelector } from "react-redux";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Key } from "chessground/types";

import { TreeNode } from "../types/chess";
import BaseBoard from "./BaseBoard";
import { countGames } from "../lib/chess";
import { RootState } from "../store";
import WinChanceBar from "./WinChanceBar";

interface Props {
  tooltip: UseTooltipParams<HierarchyPointNode<TreeNode>>
}

export const TreeTooltip = ({ tooltip }: Props) => {
  const orientation = useSelector((state: RootState) => state.game.orientation);
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
    <>
      <div className="text-base text-neutral-800">
        <div>
          <span className="font-bold pr-1">Games:</span>
          <span>{totalGames.toLocaleString()}</span>
        </div>
        {
          freq !== null && freq > 0 &&
          <div>
            <span className="font-bold pr-1">Frequency:</span>
            <span>{freq.toFixed(2)}%</span>
            {
              freq > 100 &&
              <span className="pl-1">(from transpositions)</span>
            }
          </div>
        }
        {
          averageRating &&
          <div>
            <span className="font-bold pr-1">Avg. rating:</span>
            <span>{averageRating} Elo</span>
          </div>
        }
        {
          (totalGames > 0) &&
          <div className="flex items-center pb-1">
            <span className="font-bold pr-1">Wins:</span>
            <WinChanceBar
              white={white/totalGames*100}
              draws={draws/totalGames*100}
              black={black/totalGames*100}
            />
          </div>
        }
      </div>
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
    </>
  );
}
