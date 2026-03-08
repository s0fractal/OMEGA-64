/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

const ROOT = Deno.cwd();
const CANON_ROOTS = Array.from({ length: 9 }, (_, i) => `${ROOT}/${i}`);
const DEFAULT_ALLOWED = ["_.ts", "_.yaml"];

async function loadAllowedFromFirewall(): Promise<string[]> {
  try {
    const rawText = await Deno.readTextFile(`${ROOT}/8/2/CODEX_RULES/_.yaml`);
    const raw = parseYaml(rawText) as {
      rules?: Array<Record<string, unknown>>;
    };
    const rules = Array.isArray(raw?.rules) ? raw.rules : [];
    const canonRule = rules.find((r) =>
      r?.id === "CANON_FILENAMES" && r?.status === "ACTIVE"
    );
    if (canonRule && Array.isArray((canonRule as { allow?: unknown }).allow)) {
      const allow = (canonRule as { allow?: unknown }).allow as unknown[];
      const filtered = allow.filter((v): v is string => typeof v === "string");
      if (filtered.length > 0) return filtered;
    }
  } catch {
    // fall back to defaults
  }
  return DEFAULT_ALLOWED;
}

const violations: string[] = [];

const ALLOWED = new Set(await loadAllowedFromFirewall());

for (const root of CANON_ROOTS) {
  try {
    for await (const entry of walk(root, { includeDirs: false })) {
      const base = entry.name;
      if (base.startsWith(".")) continue; // ignore hidden files
      if (!ALLOWED.has(base)) violations.push(entry.path);
    }
  } catch {
    // root may not exist
  }
}

if (violations.length > 0) {
  console.error("[CANON_NAME_GUARD] Forbidden file names detected in canon:");
  for (const v of violations) console.error(` - ${v}`);
  Deno.exit(1);
}

console.log("[CANON_NAME_GUARD] OK");
