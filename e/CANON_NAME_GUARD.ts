/// <reference lib="deno.window" />
import { walk } from "jsr:@std/fs";

const ROOT = Deno.cwd();
const CANON_ROOTS = Array.from({ length: 9 }, (_, i) => `${ROOT}/${i}`);
const ALLOWED = new Set(["_.ts", "_.yaml"]);

const violations: string[] = [];

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
