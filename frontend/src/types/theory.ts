export type TheoryStrategy = 'fen-search' | 'exact-path' | 'none';

export interface GetTheoryArgs {
  nodeId: string;
}

export type TheorySnippetKind = 'heading' | 'paragraph';

export interface TheorySnippet {
  kind: TheorySnippetKind;
  text: string;
  html: string;
}

export interface TheoryLookupResult {
  snippets: TheorySnippet[];
  sourceTitle: string | null;
  sourceUrl: string | null;
  strategy: TheoryStrategy;
}

export type MediaWikiParseResponse = {
  parse?: {
    text?: {
      '*': string;
    };
  };
  error?: {
    code?: string;
    info?: string;
  };
};

export type MediaWikiSearchResponse = {
  query?: {
    search?: Array<{
      title: string;
    }>;
  };
  error?: {
    code?: string;
    info?: string;
  };
};
