import { EngineOutput } from "../redux/engineSlice";

function getLocale() {
  if (navigator.languages != undefined) 
    return navigator.languages[0]; 
  return navigator.language;
}
const locale = getLocale();

export const formatSpeed = (speed: number) =>(
  Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(speed)
)

export const formatScore = (
  engineOutput: EngineOutput,
  turnColor: string,
  orientation: string,
) => {
  const { cp, mate } = engineOutput;
  const turn = turnColor === 'w' ? 1 : -1;
  const flipped = orientation === 'white' ? 1 : -1;
  if (cp !== undefined) {
    const score = cp * turn * flipped;
    return Intl.NumberFormat(locale, {
        signDisplay: 'always',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(score / 100)
  } else {
    return mate ? `#${mate * turn * flipped}` : '-';
  }
};
