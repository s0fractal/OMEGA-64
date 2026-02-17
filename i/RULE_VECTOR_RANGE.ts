export const RULE_VECTOR_RANGE = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const match = entry.vector.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const level = Number(match[1]);
  const domain = Number(match[2]);
  const port = Number(match[3]);
  return null;
};
