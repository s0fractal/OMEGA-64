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
  reason: string;
  excerpt: string;
};

const MANIFEST_PATH = "deno.jsonc";

const FORBIDDEN_PATTERNS: Array<{ reason: string; re: RegExp }> = [
  {
    reason: "legacy @std import alias is forbidden in active architecture",
    re: /["']@std\//u,
  },
  {
    reason: "deno.land/std URL imports are forbidden in active architecture",
    re: /https?:\/\/deno\.land\/std(?:@|\/)/u,
  },
];

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

const collectViolations = async (file: string): Promise<Violation[]> => {
  const source = await Deno.readTextFile(file);
  const lines = source.split(/\r?\n/u);
  const out: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (!pattern.re.test(line)) continue;
      out.push({
        file,
        line: i + 1,
        reason: pattern.reason,
        excerpt: line.trim(),
      });
    }
  }

  return out;
};

const main = async () => {
  const files = await collectManifestTsFiles();
  const violations: Violation[] = [];

  for (const file of files) {
    violations.push(...(await collectViolations(file)));
  }

  if (violations.length > 0) {
    console.error(
      "[std-policy] active-architecture std import policy violated.",
    );
    for (const v of violations) {
      console.error(` - ${v.file}:${v.line}`);
      console.error(`   reason: ${v.reason}`);
      console.error(`   ${v.excerpt}`);
    }
    Deno.exit(1);
  }

  console.log(
    `[std-policy] std import policy guard passed. scanned=${files.length}`,
  );
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
