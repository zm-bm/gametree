import { TooltipInPortalProps } from "@visx/tooltip/lib/hooks/useTooltipInPortal";
import { NodeTooltipData } from "../../hooks/useTreeTooltip";
import { TreeTooltipContents } from "./TreeTooltipContents";

interface Props {
  tooltipOpen: boolean;
  tooltipData?: NodeTooltipData;
  tooltipLeft: number;
  tooltipTop: number;
  tooltipOffsetLeft: number;
  tooltipOffsetTop: number;
  TooltipInPortal: React.FC<TooltipInPortalProps>;
};

export const TreeTooltip = ({
  tooltipOpen,
  tooltipData,
  tooltipLeft,
  tooltipTop,
  tooltipOffsetLeft,
  tooltipOffsetTop,
  TooltipInPortal,
}: Props) => {
  if (!tooltipOpen || !tooltipData) return null;
  
  return (
    <TooltipInPortal
      key={Math.random()}
      left={tooltipLeft}
      top={tooltipTop}
      offsetLeft={tooltipOffsetLeft}
      offsetTop={tooltipOffsetTop}
      unstyled={true}
      className="absolute"
    >
      <TreeTooltipContents data={tooltipData} />
    </TooltipInPortal>
  );
};