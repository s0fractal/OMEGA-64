export const RULE_REDIRECT_OPTIONAL = (entry: { file: string; redirect?: string }) => {
  if (!entry.redirect) return null;
  return `REDIRECT ${entry.file} -> ${entry.redirect}`;
};
