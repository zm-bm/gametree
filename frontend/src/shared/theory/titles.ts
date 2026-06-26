import { getFenFromPathId } from '@/shared/chess';
import { THEORY_PATH_VARIANTS, type TheoryPathVariant } from './constants';

export const normalizeTheoryTitle = (title: string) => title.replace(/ /g, '_');

const stripSanAnnotation = (sanMove: string) => sanMove.replace(/[+#?!]/g, '');
const toTheoryToken = (sanMove: string) => stripSanAnnotation(sanMove).replace(/\s+/g, '_');

export const getFenField = (nodeId: string) => getFenFromPathId(nodeId).split(' ')[0] || '';

const buildTheoryTitle = (sanMoves: string[], variant: TheoryPathVariant) => {
  if (!sanMoves.length) return 'Chess_Opening_Theory';

  const segments = sanMoves.map((sanMove, idx) => {
    const token = toTheoryToken(sanMove);
    const moveNo = Math.floor(idx / 2) + 1;
    const isWhiteMove = idx % 2 === 0;

    if (isWhiteMove) {
      return variant.whiteUsesUnderscore ? `${moveNo}._${token}` : `${moveNo}.${token}`;
    }

    return variant.blackUsesUnderscore ? `${moveNo}..._${token}` : `${moveNo}...${token}`;
  });

  return `Chess_Opening_Theory/${segments.join('/')}`;
};

export const getExactTheoryTitles = (sanMoves: string[]) => {
  if (!sanMoves.length) return ['Chess_Opening_Theory'];
  const titles = new Set<string>();
  for (const variant of THEORY_PATH_VARIANTS) {
    titles.add(buildTheoryTitle(sanMoves, variant));
  }
  return Array.from(titles);
};

