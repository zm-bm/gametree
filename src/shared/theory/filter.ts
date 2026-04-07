import { formatMoveLine } from '@/shared/chess';
import type { TheorySnippet } from '@/types';
import {
  MAX_MOVE_PREFIX_PLIES,
  MIN_HEADING_COMPARE_LENGTH,
  THEORY_HEADING_BLOCKLIST,
} from './constants';

const normalizeTheoryText = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const tokenizeTheoryText = (value: string) => {
  if (!value) return [] as string[];
  return value.split(' ').filter(Boolean);
};

const dropFirstTheoryHeading = (snippets: TheorySnippet[]) => {
  let droppedFirstHeading = false;
  return snippets.filter((snippet) => {
    if (snippet.kind !== 'heading') return true;
    if (!droppedFirstHeading) {
      droppedFirstHeading = true;
      return false;
    }
    return true;
  });
};

const buildMovePrefixSet = (sanMoves: string[]) => {
  const prefixes = new Set<string>();
  const maxPrefixPlies = Math.min(sanMoves.length, MAX_MOVE_PREFIX_PLIES);

  for (let ply = 1; ply <= maxPrefixPlies; ply += 1) {
    const prefix = normalizeTheoryText(formatMoveLine(sanMoves.slice(0, ply)));
    if (prefix) prefixes.add(prefix);
  }

  return prefixes;
};

type HeadingFilterContext = {
  normalizedOpening: string;
  normalizedRecentLine: string;
  movePrefixes: Set<string>;
  recentLineTokens: Set<string>;
  moveTokens: Set<string>;
};

const buildHeadingFilterContext = (
  openingName: string,
  recentLine: string,
  sanMoves: string[],
): HeadingFilterContext => {
  const normalizedRecentLine = normalizeTheoryText(recentLine);
  return {
    normalizedOpening: normalizeTheoryText(openingName),
    normalizedRecentLine,
    movePrefixes: buildMovePrefixSet(sanMoves),
    recentLineTokens: new Set(tokenizeTheoryText(normalizedRecentLine)),
    moveTokens: new Set(sanMoves.map((san) => normalizeTheoryText(san)).filter(Boolean)),
  };
};

const isHeadingDuplicateOfContext = (heading: TheorySnippet, context: HeadingFilterContext) => {
  if (heading.kind !== 'heading') return false;

  const normalizedHeading = normalizeTheoryText(heading.text);
  if (!normalizedHeading) return true;

  if (
    THEORY_HEADING_BLOCKLIST.has(normalizedHeading)
    || normalizedHeading.startsWith('theory table ')
  ) {
    return true;
  }

  const {
    normalizedOpening,
    normalizedRecentLine,
    movePrefixes,
    recentLineTokens,
    moveTokens,
  } = context;

  if (normalizedOpening.length >= MIN_HEADING_COMPARE_LENGTH) {
    const openingMatch = normalizedHeading.includes(normalizedOpening)
      || (normalizedHeading.length >= MIN_HEADING_COMPARE_LENGTH
        && normalizedOpening.includes(normalizedHeading));
    if (openingMatch) return true;

    const openingTokens = tokenizeTheoryText(normalizedOpening).filter((token) => token.length > 2);
    if (openingTokens.length >= 2) {
      const openingLead = openingTokens.slice(0, 2).join(' ');
      if (normalizedHeading.startsWith(openingLead)) return true;
    }
  }

  for (const prefix of movePrefixes) {
    if (!prefix) continue;
    if (normalizedHeading === prefix || normalizedHeading.startsWith(`${prefix} `)) return true;
  }

  if (normalizedRecentLine) {
    if (normalizedHeading === normalizedRecentLine) return true;
    if (
      normalizedRecentLine.includes(normalizedHeading)
      && normalizedHeading.length >= MIN_HEADING_COMPARE_LENGTH
    ) {
      return true;
    }
  }

  const headingTokens = tokenizeTheoryText(normalizedHeading);
  if (!headingTokens.length) return true;

  const hasMoveToken = headingTokens.some((token) => moveTokens.has(token));
  if (!hasMoveToken) return false;

  return headingTokens.every((token) => recentLineTokens.has(token));
};

export const filterTheorySnippets = (
  snippets: TheorySnippet[],
  openingName: string,
  recentLine: string,
  sanMoves: string[],
) => {
  const context = buildHeadingFilterContext(openingName, recentLine, sanMoves);
  return dropFirstTheoryHeading(snippets).filter(
    (snippet) => !isHeadingDuplicateOfContext(snippet, context),
  );
};

