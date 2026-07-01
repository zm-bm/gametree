import { EngineOutput } from "@/types";

interface EngineSecondaryStatsProps {
  engineOutput: EngineOutput | null;
}

const EngineSecondaryStats = ({ engineOutput }: EngineSecondaryStatsProps) => {
  const hasOutput = Boolean(engineOutput);
  const { time, seldepth = 0, hashfull, tbhits } = engineOutput || {};

  const timeDisplay = hasOutput && typeof time === "number" ? `${(time / 1000).toFixed(1)}s` : "--";
  const hashDisplay = hasOutput && typeof hashfull === "number" ? `${Math.round(hashfull / 10)}%` : "--";
  const selDepthDisplay = hasOutput ? seldepth : "--";
  const tbDisplay = hasOutput && typeof tbhits === "number" ? tbhits : "--";

  const stats = [
    { label: "time", value: timeDisplay },
    { label: "hash", value: hashDisplay },
    { label: "seldepth", value: selDepthDisplay },
    { label: "tb", value: tbDisplay },
  ];

  return (
    <div className="gt-engine-stats">
      <div className="gt-engine-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="gt-engine-stat-cell">
            <span className="gt-engine-stat-label">{stat.label}</span>
            <span className="gt-engine-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EngineSecondaryStats;
