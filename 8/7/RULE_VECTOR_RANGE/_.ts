export type AnnotationEntry = {
  file: string;
  vector?: string;
};

export const RULE_VECTOR_RANGE = (entry: AnnotationEntry): string | null => {
  if (!entry.vector) return null;
  const parts = entry.vector.split(".");
  if (parts.length !== 3) return `VECTOR_RANGE: ${entry.file} -> ${entry.vector}`;
  const [lRaw, dRaw, vRaw] = parts;
  const l = Number(lRaw);
  const d = Number(dRaw);
  const v = Number(vRaw);
  if (![l, d, v].every(Number.isFinite)) return `VECTOR_RANGE: ${entry.file} -> ${entry.vector}`;
  if (l < 0 || l > 63) return `VECTOR_RANGE: ${entry.file} -> ${entry.vector}`;
  if (d < 0 || d > 63) return `VECTOR_RANGE: ${entry.file} -> ${entry.vector}`;
  if (v < 0 || v > 15) return `VECTOR_RANGE: ${entry.file} -> ${entry.vector}`;
  return null;
};

export const ATOM = RULE_VECTOR_RANGE;
