export type AnnotationEntry = {
  file: string;
  symbol?: string;
};

export const RULE_SYMBOL_OPTIONAL = (entry: AnnotationEntry): string | null => {
  if (!entry.symbol) return null;
  return `SYMBOL: ${entry.file} -> ${entry.symbol}`;
};

export const ATOM = RULE_SYMBOL_OPTIONAL;
