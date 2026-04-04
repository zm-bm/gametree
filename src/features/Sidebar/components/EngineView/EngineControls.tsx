import { IoIosPause, IoIosPlay } from "react-icons/io";
import { cn } from "@/shared/cn";

interface EngineControlsProps {
  running: boolean;
  hasOutput: boolean;
  depth?: number;
  speed?: number;
  onToggle: () => void;
}

const EngineControls = ({
  running,
  hasOutput,
  depth,
  speed,
  onToggle,
}: EngineControlsProps) => {
  const depthDisplay = hasOutput ? (depth ?? 0) : "-";
  const npsKnDisplay = hasOutput && typeof speed === "number" ? `${Math.round(speed / 1000)} kn/s` : "--";

  return (
    <div className="flex items-center gap-2.5 py-2 min-w-0">
      <div className="shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "h-10 min-w-24 px-3 inline-flex items-center justify-center gap-2 rounded-md border transition-colors",
            running
              ? "border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
              : "border-sky-300/40 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30",
          )}
          title="Start/stop engine"
        >
          {running ? <IoIosPause className="text-lg" /> : <IoIosPlay className="text-lg" />}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {running ? "Stop" : "Start"}
          </span>
        </button>
      </div>

      <div className="min-w-0 text-lg font-semibold leading-none text-white/90 truncate shrink-0">
        Stockfish 18
      </div>

      <div className="flex items-center gap-1.5 text-sm leading-none whitespace-nowrap text-white/60">
        <span>
          depth <span className="font-semibold text-white/80">{depthDisplay}</span>
        </span>
        <span className="text-white/40">&bull;</span>
        <span className="font-semibold text-white/80">{npsKnDisplay}</span>
      </div>
    </div>
  );
};

export default EngineControls;
