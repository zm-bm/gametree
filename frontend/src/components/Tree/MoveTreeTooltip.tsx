import { Tooltip } from "@visx/tooltip";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNode } from "../../chess";
import BaseBoard from "../Board/BaseBoard";
import { countGames } from "./helpers";

interface Props {
  tooltip: UseTooltipParams<HierarchyPointNode<TreeNode>>
};
export const MoveTreeTooltip = ({ tooltip }: Props) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = tooltip;

  return (
    (tooltipOpen && tooltipData) && (
      <Tooltip
        key={Math.random()}
        top={tooltipTop}
        left={tooltipLeft}
      >
        Total games: <strong>{countGames(tooltipData.data)}</strong>
        <div className='relative h-[240px] w-[240px]'>
          <BaseBoard
            config={{
              fen: tooltipData.data.attributes.move?.after,
            }}
          />
        </div>
      </Tooltip>
    )
  );
}
