import { parse } from "jsr:@std/jsonc";
type ExportManifest = {
  core_entry_files: string[];
};

type Violation = {
  file: string;
  line: number;
  excerpt: string;
};

const MANIFEST_PATH = "deno.jsonc";
const LEGACY_API_PATTERN =
  /\bSTATE_MATRIX\.(getCode|getContext|setCode|setContext)\b/u;

const collectCoreEntryFiles = async (): Promise<string[]> => {
  const raw = await Deno.readTextFile(MANIFEST_PATH);
  const parsed = parse(raw).omega as ExportManifest;
  if (!Array.isArray(parsed.core_entry_files)) {
    throw new Error(`[runtime-api] invalid manifest: ${MANIFEST_PATH}`);
  }
  return parsed.core_entry_files.filter((f) => f.endsWith(".ts"));
};

const collectViolations = async (file: string): Promise<Violation[]> => {
  const source = await Deno.readTextFile(file);
  const lines = source.split(/\r?\n/u);
  const out: Violation[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!LEGACY_API_PATTERN.test(line)) continue;
    out.push({
      file,
      line: i + 1,
      excerpt: line.trim(),
    });
  }
  return out;
};

const main = async () => {
  const files = await collectCoreEntryFiles();
  const violations: Violation[] = [];

  for (const file of files) {
    violations.push(...(await collectViolations(file)));
  }

  if (violations.length > 0) {
    console.error("[runtime-api] legacy STATE_MATRIX API usage detected.");
    for (const v of violations) {
      console.error(` - ${v.file}:${v.line}`);
      console.error(`   ${v.excerpt}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[runtime-api] state-matrix API guard passed. scanned=${files.length}`,
  );
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
