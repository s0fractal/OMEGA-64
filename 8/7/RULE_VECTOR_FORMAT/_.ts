export type AnnotationEntry = {
  file: string;
  vector?: string;
};

const FORMAT = /^[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/;

export const RULE_VECTOR_FORMAT = (entry: AnnotationEntry): string | null => {
  if (!entry.vector) return null;
  if (!FORMAT.test(entry.vector)) {
    return `VECTOR_FORMAT: ${entry.file} -> ${entry.vector}`;
  }
  return null;
};

export const ATOM = RULE_VECTOR_FORMAT;
