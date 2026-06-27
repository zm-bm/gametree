export type OpeningBookEntry = {
  eco: string;
  name: string;
  uci: string;
};

export type SourceStats = {
  white: number;
  draws: number;
  black: number;
  total: number;
};

export type OpeningMove = {
  uci: string;
  otb: SourceStats;
  online: SourceStats;
  total: number;
};

export type OpeningTotals = {
  play: string[];
  otb: SourceStats;
  online: SourceStats;
  moves: OpeningMove[];
};
