import { COLORS } from '../../lib/colors';

interface Props {
  white: number;
  draws: number;
  black: number;
  showLabels?: boolean;
}

const barClass = "flex items-center justify-center relative";

const GameOutcomeBar = ({ white, draws, black, showLabels = false }: Props) => {
  // Format percentages with 1 decimal place
  const whiteFormatted = white.toFixed(1);
  const drawsFormatted = draws.toFixed(1);
  const blackFormatted = black.toFixed(1);

  return (
    <div className="w-full h-6 rounded-xl overflow-hidden flex text-xs font-medium shadow-md backdrop-blur-sm">

      {white > 0 && (
        <div
          style={{ 
            width: `${white}%`, 
            background: `linear-gradient(to right, ${COLORS.win}, ${COLORS.nearwin}cc)`
          }}
          className={barClass}
          title={`White: ${whiteFormatted}%`}
        >
          {showLabels && white >= 8 && (
            <span className="text-white px-1 truncate font-semibold">
              {whiteFormatted}%
            </span>
          )}
        </div>
      )}

      {draws > 0 && (
        <div
          style={{ 
            width: `${draws}%`,
            background: `linear-gradient(to right, ${COLORS.draw}, ${COLORS.draw}cc)`
          }}
          className={barClass}
          title={`Draws: ${drawsFormatted}%`}
        >
          {showLabels && draws >= 8 && (
            <span className="text-gray-800 px-1 truncate font-semibold">
              {drawsFormatted}%
            </span>
          )}
        </div>
      )}

      {black > 0 && (
        <div
          style={{ 
            width: `${black}%`, 
            background: `linear-gradient(to right, ${COLORS.nearlose}, ${COLORS.lose}cc)`
          }}
          className={barClass}
          title={`Black: ${blackFormatted}%`}
        >
          {showLabels && black >= 8 && (
            <span className="text-white px-1 truncate font-semibold">
              {blackFormatted}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GameOutcomeBar;
