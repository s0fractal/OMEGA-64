/**
 * @omega.vector 32.00.0
 * @omega.readonly
 */

export const RULE_VECTOR_FORMAT = (entry: { file: string; vector?: string }) => {
  if (!entry.vector) return null;
  const ok = /^(\d{1,2})\.(\d{1,2})\.(\d{1,2})$/.test(entry.vector);
  return ok ? null : `Invalid @omega.vector format (expected L.D.P): ${entry.file}`;
};
