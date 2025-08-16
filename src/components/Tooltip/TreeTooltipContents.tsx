import { NodeTooltipData } from "../../hooks/useTreeTooltip";
import GameOutcomeBar from "../GameOutcomeBar";

interface Props {
  data?: NodeTooltipData;
}

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
    <div className="tree-overlay w-[260px]">
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
          <div className="bg-gradient-to-br from-white to-gray-100 p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm">
            <div className="text-gray-500 text-xs font-medium">Games</div>
            <div className="font-bold text-gray-800">
              { Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(games) }
            </div>
          </div>
          
          {/* Frequency */}
          {frequency !== null && (
            <div className="bg-gradient-to-br from-white to-gray-100 p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm">
              <div className="text-gray-500 text-xs font-medium">Frequency</div>
              <div className="font-bold text-gray-800">{frequency.toFixed(1)}%</div>
              {hasTranspositions && (
                <div className="text-xs text-blue-500">from transpositions</div>
              )}
            </div>
          )}
          
          {/* Average Rating */}
          {data.rating > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-100 p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm">
              <div className="text-gray-500 text-xs font-medium">Avg. Rating</div>
              <div className="font-bold text-gray-800">{data.rating} Elo</div>
            </div>
          )}

          {/* ECO code */}
          {data.eco && (
            <div className="bg-gradient-to-br from-white to-gray-100 p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm">
              <div className="text-gray-500 text-xs font-medium">ECO Code</div>
              <div className="font-bold text-gray-800">{data.eco}</div>
            </div>
          )}
        </div>
        
        {/* Win Statistics */}
        {winStats && (
          <div className="bg-gradient-to-br from-white to-gray-100 p-2.5 rounded-xl border border-gray-400/50 shadow-sm backdrop-blur-sm">
            <div className="text-gray-500 text-xs font-medium">Outcomes</div>
            <div className="mt-2 p-px rounded-xl bg-gradient-to-r from-zinc-300 to-zinc-600 backdrop-blur-sm shadow-inner">
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
