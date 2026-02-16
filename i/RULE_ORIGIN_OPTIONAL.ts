/**
 * @omega.vector 32.00.00
 * @omega.readonly
 */

export const RULE_ORIGIN_OPTIONAL = (entry: { file: string; origin?: string }) => {
  if (!entry.origin) return null;
  return `ORIGIN ${entry.file} -> ${entry.origin}`;
};
