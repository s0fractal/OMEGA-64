export type AnnotationEntry = {
  file: string;
  redirect?: string;
};

export const RULE_REDIRECT_OPTIONAL = (entry: AnnotationEntry): string | null => {
  if (!entry.redirect) return null;
  return `REDIRECT: ${entry.file} -> ${entry.redirect}`;
};

export const ATOM = RULE_REDIRECT_OPTIONAL;
