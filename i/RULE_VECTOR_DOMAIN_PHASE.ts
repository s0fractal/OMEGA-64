/**
 * @omega.vector 32.00.00
 * @omega.readonly
 */

export const RULE_VECTOR_DOMAIN_PHASE = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const match = entry.vector.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const domain = Number(match[2]);
  if (domain < 0 || domain > 63) return `@omega.vector domain out of range (00..63): ${entry.file}`;
  const angleDeg = domain * (360 / 64);
  return `DOMAIN_PHASE ${entry.file} -> ${angleDeg.toFixed(3)}deg (domain=${domain})`;
};
