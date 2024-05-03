interface Props {
  white: number;
  draws: number;
  black: number;
}

const WinChanceBar = ({ white, draws, black }: Props) => {
  return (
    <div className="w-full h-4">
      <div className="flex h-full w-full text-sm font-medium border border-gray-400">
        <div
          style={{ width: `${white}%` }}
          className="bg-white flex items-center justify-center"
        >
          {white.toFixed(1)}%
        </div>
        <div
          style={{ width: `${draws}%` }}
          className="bg-gray-500 flex items-center justify-center text-white"
        >
          {draws.toFixed(1)}%
        </div>
        <div
          style={{ width: `${black}%` }}
          className="bg-black flex items-center justify-center text-white"
        >
          {black.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default WinChanceBar;
