export type AnnotationEntry = {
  file: string;
  origin?: string;
};

export const RULE_ORIGIN_OPTIONAL = (entry: AnnotationEntry): string | null => {
  if (!entry.origin) return null;
  return `ORIGIN: ${entry.file} -> ${entry.origin}`;
};

export const ATOM = RULE_ORIGIN_OPTIONAL;
