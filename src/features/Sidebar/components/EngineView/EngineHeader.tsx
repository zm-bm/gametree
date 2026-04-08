interface EngineHeaderProps {
  running: boolean;
  hasOutput: boolean;
  evalDisplay: string;
  depth?: number;
  speed?: number;
  onToggle: () => void;
}

const EngineHeader = ({
  running,
  hasOutput,
  evalDisplay,
  depth,
  speed,
  onToggle,
}: EngineHeaderProps) => {
  const depthDisplay = hasOutput ? (depth ?? 0) : "-";
  const npsKnDisplay = hasOutput && typeof speed === "number" ? `${Math.round(speed / 1000)} kn/s` : "--";

  return (
    <div className="gt-engine-header">
      <div className="gt-engine-header-layout">
        <button
          onClick={onToggle}
          type="button"
          role="switch"
          aria-checked={running}
          aria-label="Toggle engine"
          className="gt-engine-switch"
          title="Toggle engine"
        >
          <span className="gt-engine-switch-track" aria-hidden="true">
            <span className="gt-engine-switch-thumb" />
          </span>
        </button>

        <div className="gt-engine-identity">
          <span className="gt-engine-name" title="Stockfish 18">Stockfish 18</span>
        </div>

        {evalDisplay ? (
          <div className="gt-engine-header-score" data-testid="engine-header-score">
            {evalDisplay}
          </div>
        ) : null}

        <div className="gt-engine-meta-stats">
          <span className="gt-engine-meta-stat gt-engine-meta-stat--depth">
            depth <span className="gt-engine-meta-value">{depthDisplay}</span>
          </span>
          <span className="gt-engine-meta-stat gt-engine-meta-value">{npsKnDisplay}</span>
        </div>
      </div>
    </div>
  );
};

export default EngineHeader;
