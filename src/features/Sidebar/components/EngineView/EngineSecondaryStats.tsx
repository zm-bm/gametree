import { EngineOutput } from "@/types";

interface EngineSecondaryStatsProps {
  engineOutput: EngineOutput | null;
  locale?: string;
}

const GRID_CLASS = "grid grid-cols-5 gap-2 text-xs text-gray-500/70 dark:text-gray-500/80";
const STAT_CELL_CLASS = "text-center leading-tight";
const STAT_VALUE_CLASS = "font-semibold text-gray-400 dark:text-gray-300 tabular-nums";

const formatSpeed = (speed: number, locale?: string) => (
  Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(speed)
);

const EngineSecondaryStats = ({ engineOutput, locale }: EngineSecondaryStatsProps) => {
  const hasOutput = Boolean(engineOutput);
  const { time, speed, seldepth = 0, hashfull, tbhits } = engineOutput || {};

  const timeDisplay = hasOutput && typeof time === "number" ? `${(time / 1000).toFixed(1)}s` : "--";
  const npsDisplay = hasOutput && typeof speed === "number" ? formatSpeed(speed, locale) : "--";
  const hashDisplay = hasOutput && typeof hashfull === "number" ? `${Math.round(hashfull / 10)}%` : "--";
  const selDepthDisplay = hasOutput ? seldepth : "--";
  const tbDisplay = hasOutput && typeof tbhits === "number" ? tbhits : "--";

  const stats = [
    { label: "time", value: timeDisplay },
    { label: "nps", value: npsDisplay },
    { label: "hash", value: hashDisplay },
    { label: "seldepth", value: selDepthDisplay },
    { label: "tb", value: tbDisplay },
  ];

  return (
    <div className="py-2">
      <div className={GRID_CLASS}>
        {stats.map((stat) => (
          <div key={stat.label} className={STAT_CELL_CLASS}>
            <span>{stat.label} </span>
            <span className={STAT_VALUE_CLASS}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineSecondaryStats;
