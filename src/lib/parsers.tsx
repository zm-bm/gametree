export const parseTime = (line: string) => {
  const match = line.match(/time (\w+)/);
  return match ? +match[1] : undefined;
};

export const parseSpeed = (line: string) => {
  const match = line.match(/nps (\w+)/);
  return match ? +match[1] : undefined;
};

export const parseHashfull = (line: string) => {
  const match = line.match(/hashfull (\w+)/);
  return match ? +match[1] : undefined;
};

export const parseTBHits = (line: string) => {
  const match = line.match(/tbhits (\w+)/);
  return match ? +match[1] : undefined;
};

export const parseMultiPV = (line: string) => {
  const match = line.match(/multipv (\w+)/);
  return match ? (+match[1] - 1) : 0
}

export const parseDepth = (line: string) => {
  const match = line.match(/depth (\w+)/);
  return match ? +match[1] : 0;
}

export const parseSelDepth = (line: string) => {
  const match = line.match(/seldepth (\w+)/);
  return match ? +match[1] : 0;
}

export const parseCp = (line: string) => {
  const cp = line.match(/score cp (-?\w+)/);
  return cp ? +cp[1] : undefined;
}

export const parseMate = (line: string) => {
  const mate = line.match(/score mate (-?\w+)/);
  return mate ? +mate[1] : undefined;
}

// export const parseWDL = (line: string, turnColor?: string) => {
//   var wdlArr = line.match(/wdl (\w+) (\w+) (\w+)/);
//   if (wdlArr) {
//     const wdl = wdlArr.slice(1, 4).map(v => +v)
//     if (turnColor === 'w') {
//       return wdl;
//     } else {
//       return wdl.reverse();
//     }
//   }
// }

export const parseMoves = (line: string) => {
  line = line.substring(line.indexOf(" pv ") + 4);
  // Match chess moves including promotions (e.g. e2e4, e7e8q)
  const moveRegex = /\b[a-h][1-8][a-h][1-8][qrnb]?\b/g;
  return line.match(moveRegex) as string[];
}
