export type AnalysisType = 'OMISSION' | 'DIVERGENCE' | 'INCOHÉRENCE' | 'SILENCE';
export type Category = 'Géopolitique' | 'Économie' | 'Société' | 'Climat' | 'Justice';
export type Page = 'revue' | 'sources' | 'confrontation' | 'favoris' | 'sujets' | 'apropos';

export interface MediaSource {
  id: string;
  name: string;
  country: string;
  flag: string;
  bias: string;
  articleCount: number;
  color: string;
}

export interface SourceQuote {
  sourceId: string;
  quote: string;
  date?: string;
}

export interface PressItem {
  id: string;
  type: AnalysisType;
  category: Category;
  title: string;
  summary: string;
  detail: string;
  sourceIds: string[];
  silentSourceIds?: string[];
  severity: 1 | 2 | 3;
  isPriority: boolean;
  date: string;
  sourceQuotes?: SourceQuote[];
}
