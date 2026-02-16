/**
 * @omega.vector 32.00.0
 * @omega.readonly
 */

export const RULE_VECTOR_RANGE = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const match = entry.vector.match(/^(\d{1,2})\.(\d{1,2})\.(\d{1,2})$/);
  if (!match) return null;
  const level = Number(match[1]);
  const domain = Number(match[2]);
  const port = Number(match[3]);
  if (level < 0 || level > 63) return `@omega.vector level out of range (00..63): ${entry.file}`;
  if (domain < 0 || domain > 63) return `@omega.vector domain out of range (00..63): ${entry.file}`;
  if (port < 0 || port > 15) return `@omega.vector port out of range (00..15): ${entry.file}`;
  return null;
};
