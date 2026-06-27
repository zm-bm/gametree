export const DEFAULT_THEORY_EXTRA_SECTIONS = 3;

export const STOP_HEADINGS = new Set([
  'theory table',
  'references',
  'external links',
  'see also',
  'further reading',
  'bibliography',
  'notes',
  'sources',
  'footnotes',
]);

export const ALLOWED_INLINE_TAGS = new Set(['EM', 'STRONG', 'B', 'I', 'CODE', 'BR']);

export const THEORY_PATH_VARIANTS = [
  { whiteUsesUnderscore: true, blackUsesUnderscore: false },
  { whiteUsesUnderscore: true, blackUsesUnderscore: true },
  { whiteUsesUnderscore: false, blackUsesUnderscore: false },
] as const;

export type TheoryPathVariant = {
  whiteUsesUnderscore: boolean;
  blackUsesUnderscore: boolean;
};
