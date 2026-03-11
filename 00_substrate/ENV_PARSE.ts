export const parseEnvBool = (
  raw: string | undefined,
  fallback: boolean,
): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};

export const parseEnvBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};
