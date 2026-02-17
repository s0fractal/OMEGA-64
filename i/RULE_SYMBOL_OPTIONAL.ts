export const RULE_SYMBOL_OPTIONAL = (entry: { file: string; symbol?: string }) => {
  if (!entry.symbol) return null;
  return `SYMBOL ${entry.file} -> ${entry.symbol}`;
};
