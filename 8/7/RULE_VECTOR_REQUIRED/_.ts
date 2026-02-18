export type AnnotationEntry = {
  file: string;
  vector?: string;
};

export const RULE_VECTOR_REQUIRED = (entry: AnnotationEntry): string | null => {
  if (!entry.vector) return `VECTOR_REQUIRED: ${entry.file}`;
  return null;
};

export const ATOM = RULE_VECTOR_REQUIRED;
