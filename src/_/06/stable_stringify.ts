// SSoT: file:///Users/s0fractal/OMEGA/I/crypto/stable_stringify.md

export const stable_stringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stable_stringify(v)).join(",") + "]";
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return "{" +
      entries.map(([k, v]) => JSON.stringify(k) + ":" + stable_stringify(v))
        .join(",") +
      "}";
  }
  return JSON.stringify(value);
};
