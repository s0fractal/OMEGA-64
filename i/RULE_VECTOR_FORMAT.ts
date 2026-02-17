export const RULE_VECTOR_FORMAT = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const ok = /^(\d{2})\.(\d{2})\.(\d{2})$/.test(entry.vector);
};
