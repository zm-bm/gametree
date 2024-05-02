interface Props {
  win: number;
  loss: number;
  draw: number;
}

const WinChanceBar = ({ win, loss, draw}: Props) => {
  return (
    <div className="w-full h-4">
      <div className="flex h-full w-full text-sm font-medium border border-gray-400">
        <div
          style={{ width: `${win}%` }}
          className="bg-white flex items-center justify-center"
        >
          {win.toFixed(1)}%
        </div>
        <div
          style={{ width: `${draw}%` }}
          className="bg-gray-500 flex items-center justify-center text-white"
        >
          {draw.toFixed(1)}%
        </div>
        <div
          style={{ width: `${loss}%` }}
          className="bg-black flex items-center justify-center text-white"
        >
          {loss.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default WinChanceBar;
