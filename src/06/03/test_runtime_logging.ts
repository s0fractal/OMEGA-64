import { resolveSourcePath } from "../../resolve_source.ts";

type Violation = {
  file: string;
  line: number;
  excerpt: string;
};

const RUNTIME_HOT_PATH_FILES = [
  "PULSE.ts",
  "PULSE_WORKER.ts",
  "STATE_MATRIX.ts",
  "SNAPSHOT_ENGINE.ts",
  "BREATH.ts",
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

  for (const name of RUNTIME_HOT_PATH_FILES) {
    let resolvedPath = "";
    try {
      resolvedPath = await resolveSourcePath(name);
    } catch (e) {
      console.warn(`[logging] Warning: Could not resolve hot path file ${name}`);
      continue;
    }
    violations.push(...(await collectViolations(resolvedPath)));
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
