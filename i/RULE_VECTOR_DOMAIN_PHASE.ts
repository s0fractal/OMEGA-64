export const RULE_VECTOR_DOMAIN_PHASE = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const match = entry.vector.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const domain = Number(match[2]);
  const angleDeg = domain * (360 / 64);
  return `DOMAIN_PHASE ${entry.file} -> ${angleDeg.toFixed(3)}deg (domain=${domain})`;
};
