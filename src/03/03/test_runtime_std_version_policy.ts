import { parse } from "jsr:@std/jsonc";
import { resolveSourcePath } from "../../resolve_source.ts";
type ExportManifest = {
  core_entry_files: string[];
  required_additional_files: string[];
  context_files: string[];
};

type Violation = {
  file: string;
  line: number;
  specifier: string;
  reason: string;
};

const MANIFEST_PATH = "deno.jsonc";
const STATIC_IMPORT_RE =
  /(?:import|export)\s+(?:[\s\S]*?\sfrom\s+)?["'](jsr:@std\/[^"']+)["']/g;
const DYNAMIC_IMPORT_RE = /import\(\s*["'](jsr:@std\/[^"']+)["']\s*\)/g;
const VERSIONED_STD_SPEC_RE =
  /^jsr:@std\/[a-z0-9-]+@\^[0-9]+\.[0-9]+\.[0-9]+(?:\/[a-z0-9._/-]+)?$/i;

const collectManifestTsFiles = async (): Promise<string[]> => {
  const raw = await Deno.readTextFile(MANIFEST_PATH);
  const parsed = parse(raw).omega as ExportManifest;
  const all = [
    ...(Array.isArray(parsed.core_entry_files) ? parsed.core_entry_files : []),
    ...(Array.isArray(parsed.required_additional_files)
      ? parsed.required_additional_files
      : []),
    ...(Array.isArray(parsed.context_files) ? parsed.context_files : []),
  ];
  const unique = Array.from(new Set(all));
  const tsNames = unique.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
  const resolved: string[] = [];
  for (const name of tsNames) {
    try {
      resolved.push(await resolveSourcePath(name));
    } catch {
      resolved.push(name);
    }
  }
  return resolved;
};

const collectViolationsForFile = async (file: string): Promise<Violation[]> => {
  const source = await Deno.readTextFile(file);
  const lines = source.split(/\r?\n/u);
  const out: Violation[] = [];

  for (const re of [STATIC_IMPORT_RE, DYNAMIC_IMPORT_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null = null;
    while ((match = re.exec(source)) !== null) {
      const specifier = match[1];
      if (VERSIONED_STD_SPEC_RE.test(specifier)) continue;
      const prefix = source.slice(0, match.index);
      const line = prefix.split(/\r?\n/u).length;
      out.push({
        file,
        line,
        specifier,
        reason:
          "jsr:@std import must use explicit caret version: jsr:@std/<pkg>@^x.y.z[/subpath]",
      });
    }
  }

  // Ensure line numbers are valid even in edge cases.
  for (const v of out) {
    if (v.line < 1 || v.line > lines.length) v.line = 1;
  }
  return out;
};

const main = async () => {
  const files = await collectManifestTsFiles();
  const violations: Violation[] = [];

  for (const file of files) {
    violations.push(...(await collectViolationsForFile(file)));
  }

  if (violations.length > 0) {
    console.error(
      "[std-version-policy] active-architecture @std version policy violated.",
    );
    for (const v of violations) {
      console.error(` - ${v.file}:${v.line}`);
      console.error(`   reason: ${v.reason}`);
      console.error(`   specifier: ${v.specifier}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[std-version-policy] std version policy guard passed. scanned=${files.length}`,
  );
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
