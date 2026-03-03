import { LOGGER, type LogLevel } from "./LOGGER.ts";

type SinkCounts = {
  debug: number;
  info: number;
  warn: number;
  error: number;
  log: number;
};

const assert = (cond: unknown, message: string): void => {
  if (!cond) throw new Error(message);
};

const withCapturedConsole = async (
  run: (counts: SinkCounts) => Promise<void> | void,
): Promise<void> => {
  const counts: SinkCounts = { debug: 0, info: 0, warn: 0, error: 0, log: 0 };

  const origDebug = console.debug;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;
  const origLog = console.log;

  console.debug = (..._args: unknown[]) => {
    counts.debug++;
  };
  console.info = (..._args: unknown[]) => {
    counts.info++;
  };
  console.warn = (..._args: unknown[]) => {
    counts.warn++;
  };
  console.error = (..._args: unknown[]) => {
    counts.error++;
  };
  console.log = (..._args: unknown[]) => {
    counts.log++;
  };

  try {
    await run(counts);
  } finally {
    console.debug = origDebug;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
    console.log = origLog;
  }
};

const setEnv = (value: string | undefined): void => {
  if (value === undefined) Deno.env.delete("OMEGA_LOG_LEVEL");
  else Deno.env.set("OMEGA_LOG_LEVEL", value);
};

const expectLevel = (
  raw: string | undefined,
  expected: LogLevel,
): void => {
  setEnv(raw);
  const actual = LOGGER.refreshLevelFromEnv();
  assert(
    actual === expected,
    `[logger-policy] expected "${expected}" for OMEGA_LOG_LEVEL="${raw}", got="${actual}"`,
  );
};

const main = async () => {
  const originalEnv = Deno.env.get("OMEGA_LOG_LEVEL");
  const originalLevel = LOGGER.getLevel();

  try {
    expectLevel(undefined, "warn");
    expectLevel("warning", "warn");
    expectLevel("off", "silent");
    expectLevel("none", "silent");
    expectLevel("not-a-level", "warn");

    setEnv(undefined);
    LOGGER.refreshLevelFromEnv();
    await withCapturedConsole((counts) => {
      LOGGER.debug("[logger-policy] debug");
      LOGGER.info("[logger-policy] info");
      LOGGER.warn("[logger-policy] warn");
      LOGGER.error("[logger-policy] error");
      assert(
        counts.debug === 0 && counts.info === 0 &&
          counts.warn === 1 && counts.error === 1,
        `[logger-policy] default warn filtering mismatch: ${
          JSON.stringify(counts)
        }`,
      );
    });

    setEnv("info");
    LOGGER.refreshLevelFromEnv();
    await withCapturedConsole((counts) => {
      LOGGER.debug("[logger-policy] debug");
      LOGGER.info("[logger-policy] info");
      LOGGER.warn("[logger-policy] warn");
      LOGGER.error("[logger-policy] error");
      assert(
        counts.debug === 0 && counts.info === 1 &&
          counts.warn === 1 && counts.error === 1,
        `[logger-policy] info filtering mismatch: ${JSON.stringify(counts)}`,
      );
    });

    setEnv("silent");
    LOGGER.refreshLevelFromEnv();
    await withCapturedConsole((counts) => {
      LOGGER.debug("[logger-policy] debug");
      LOGGER.info("[logger-policy] info");
      LOGGER.warn("[logger-policy] warn");
      LOGGER.error("[logger-policy] error");
      assert(
        counts.debug === 0 && counts.info === 0 &&
          counts.warn === 0 && counts.error === 0 && counts.log === 0,
        `[logger-policy] silent filtering mismatch: ${JSON.stringify(counts)}`,
      );
    });

    console.log("✅ [TEST] LOGGER level policy verified.");
  } finally {
    setEnv(originalEnv);
    LOGGER.setLevel(originalLevel);
  }
};

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
