type Violation = {
  file: string;
  line: number;
  excerpt: string;
};

const RUNTIME_HOT_PATH_FILES = [
  "02_metabolism/PULSE.ts",
  "02_metabolism/PULSE_WORKER.ts",
  "00_substrate/STATE_MATRIX.ts",
  "02_metabolism/SNAP.ts",
  "06_akasha/SNAPSHOT_ENGINE.ts",
  "BREATH.ts",
  "02_metabolism/RIBOSOME.ts",
  "02_metabolism/REFLECTION_ENGINE.ts",
  "SYSTEM_START.ts",
  "02_metabolism/RIBOSOME_TICK.ts",
] as const;

const CONSOLE_PATTERN = /\bconsole\.[a-zA-Z_]+\b/u;

const collectViolations = async (file: string): Promise<Violation[]> => {
  const source = await Deno.readTextFile(file);
  const lines = source.split(/\r?\n/u);
  const out: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!CONSOLE_PATTERN.test(line)) continue;
    out.push({
      file,
      line: i + 1,
      excerpt: line.trim(),
    });
  }

  return out;
};

const main = async () => {
  const violations: Violation[] = [];

  for (const file of RUNTIME_HOT_PATH_FILES) {
    violations.push(...(await collectViolations(file)));
  }

  if (violations.length > 0) {
    console.error("[logging] runtime LOGGER guard failed.");
    for (const v of violations) {
      console.error(` - ${v.file}:${v.line}`);
      console.error(`   ${v.excerpt}`);
    }
    Deno.exit(1);
  }

  console.log("[logging] runtime LOGGER guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
