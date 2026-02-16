/**
 * @omega.vector 32.00.00
 * @omega.readonly
 */

export const RULE_SYMBOL_OPTIONAL = (entry: { file: string; symbol?: string }) => {
  if (!entry.symbol) return null;
  return `SYMBOL ${entry.file} -> ${entry.symbol}`;
};
