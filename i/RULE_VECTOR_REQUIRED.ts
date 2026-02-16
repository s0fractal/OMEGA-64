/**
 * @omega.vector 32.00.00
 * @omega.readonly
 */

export const RULE_VECTOR_REQUIRED = (entry: { file: string; vector?: string }) =>
  entry.vector ? null : `Missing @omega.vector: ${entry.file}`;
