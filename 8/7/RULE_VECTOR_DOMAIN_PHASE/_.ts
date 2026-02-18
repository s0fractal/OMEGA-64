export type AnnotationEntry = {
  file: string;
  vector?: string;
};

export const RULE_VECTOR_DOMAIN_PHASE = (entry: AnnotationEntry): string | null => {
  if (!entry.vector) return null;
  const parts = entry.vector.split(".");
  if (parts.length !== 3) return null;
  const [lRaw, dRaw] = parts;
  const l = Number(lRaw);
  const d = Number(dRaw);
  if (!Number.isFinite(l) || !Number.isFinite(d)) return null;
  if (l === d) return `DOMAIN_PHASE: ${entry.file} -> ${entry.vector}`;
  return null;
};

export const ATOM = RULE_VECTOR_DOMAIN_PHASE;
