// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/LOGGER.md
import { LogLevel, TYPES } from "@g05";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const readEnv = (key: string): string | undefined => {
  try {
    const deno = (globalThis as {
      Deno?: { env?: { get?: (k: string) => string | undefined } };
    }).Deno;
    return deno?.env?.get?.(key);
  } catch {
    return undefined;
  }
};

const normalizeLevel = (raw: string | undefined): LogLevel => {
  const value = raw?.trim().toLowerCase();
  if (value === "debug") return "debug";
  if (value === "info") return "info";
  if (value === "warn" || value === "warning") return "warn";
  if (value === "error") return "error";
  if (value === "silent" || value === "off" || value === "none") {
    return "silent";
  }
  return "warn";
};

let currentLevel: LogLevel = normalizeLevel(readEnv("OMEGA_LOG_LEVEL"));

const shouldLog = (level: LogLevel): boolean => {
  if (currentLevel === "silent") return false;
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel];
};

const emit = (method: "debug" | "info" | "warn" | "error", args: unknown[]) => {
  const sink =
    (console as unknown as Record<string, (...xs: unknown[]) => void>)[
      method
    ] ?? console.log;
  sink(...args);
};

export const LOGGER = {
  getLevel: (): LogLevel => currentLevel,
  setLevel: (level: LogLevel): void => {
    currentLevel = level;
  },
  refreshLevelFromEnv: (): LogLevel => {
    currentLevel = normalizeLevel(readEnv("OMEGA_LOG_LEVEL"));
    return currentLevel;
  },
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) emit("debug", args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) emit("info", args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) emit("warn", args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) emit("error", args);
  },
};

export const Ld = LOGGER.debug;
export const Li = LOGGER.info;
export const Lw = LOGGER.warn;
export const Le = LOGGER.error;
