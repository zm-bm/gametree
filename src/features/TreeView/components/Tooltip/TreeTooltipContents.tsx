import { NodeTooltipData } from "@/shared/types";
import { cn } from "@/shared/lib/cn";

import GameOutcomeBar from "./GameOutcomeBar";

interface Props {
  data?: NodeTooltipData;
}

const TOOLTIP = {
  card: [
    "p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm",
    "bg-gradient-to-br from-white to-gray-100 dark:from-zinc-800 dark:to-zinc-900",
  ],
  label: "font-medium text-xs text-zinc-500 dark:text-zinc-300",
  value: "font-bold text-zinc-700 dark:text-zinc-200",
};

export const TreeTooltipContents = ({ data }: Props) => {
  if (!data) return null;

  const games = data.white + data.draws + data.black;
  const frequency = data.parent > 0 ? games / data.parent * 100 : null;
  const hasTranspositions = frequency && frequency > 100;
  const winStats = games > 0 ? {
    white: (data.white / games * 100),
    draws: (data.draws / games * 100),
    black: (data.black / games * 100)
  } : null;

  return (
    <div className="treeview-card w-[260px]">
      {/* ECO Header */}
      {data.name && (
        <div className="p-4">
          { 
            data.name.split(':').map((part, index) => (
              <div key={index} className={index === 0 ? 'text-lg font-bold' : 'font-medium text-sm'}>
                {part}
              </div>
            ))
          }
        </div>
      )}
      
      {/* Stats Section */}
      <div className="p-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          {/* Games Count */}
          <div className={cn(TOOLTIP.card)}>
            <div className={TOOLTIP.label}>Games</div>
            <div className={TOOLTIP.value}>
              { Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(games) }
            </div>
          </div>
          
          {/* Frequency */}
          {frequency !== null && (
            <div className={cn(TOOLTIP.card)}>
              <div className={TOOLTIP.label}>Frequency</div>
              <div className={TOOLTIP.value}>{frequency.toFixed(1)}%</div>
              {hasTranspositions && (
                <div className="text-xs text-blue-500">from transpositions</div>
              )}
            </div>
          )}
          
          {/* Average Rating */}
          {data.rating && data.rating > 0 && (
            <div className={cn(TOOLTIP.card)}>
              <div className={TOOLTIP.label}>Avg. Rating</div>
              <div className={TOOLTIP.value}>{data.rating} Elo</div>
            </div>
          )}

          {/* ECO code */}
          {data.eco && (
            <div className={cn(TOOLTIP.card)}>
              <div className={TOOLTIP.label}>ECO Code</div>
              <div className={TOOLTIP.value}>{data.eco}</div>
            </div>
          )}
        </div>
        
        {/* Win Statistics */}
        {winStats && (
          <div className={cn(TOOLTIP.card)}>
            <div className={TOOLTIP.label}>Outcomes</div>
            <div className="mt-2 p-px rounded-xl bg-zinc-300 backdrop-blur-sm shadow-inner">
              <GameOutcomeBar
                white={winStats.white}
                draws={winStats.draws}
                black={winStats.black}
                showLabels={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
