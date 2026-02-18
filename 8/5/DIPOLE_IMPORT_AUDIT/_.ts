// i.L99.core.DIPOLE_IMPORT_AUDIT.ts
// @noncanonical
// OMEGA-64 | Dipole Import Audit (Canon-aware)

/// <reference lib="deno.ns" />

import { resolve, relative, dirname } from "jsr:@std/path";
import { walk } from "jsr:@std/fs";

type Direction = "ASCEND" | "DESCEND" | "CONVERGE32";
type Mode = "WARN" | "FAIL";

type Violation = {
  file: string;
  source_level: number;
  target_level: number;
  language: "ts" | "rs";
  rule: string;
  snippet: string;
};

const DEFAULT_ROOT = ".";
const DEFAULT_RS = "ASCEND";
const DEFAULT_TS = "CONVERGE32";
const DEFAULT_MODE = "WARN";
const DEFAULT_CACHE_ALLOW = false;
const DEFAULT_CACHE_PATH = "e/legacy/i.L99.core.CACHE_INVARIANTS.md";
const MOD_PATH = "mod.ts";

const parseArgs = (args: string[]) => {
  const out: {
    root: string;
    rs: Direction;
    ts: Direction;
    mode: Mode;
    includeNoncanonical: boolean;
    includeIndex: boolean;
    cacheAllow: boolean;
  } = {
    root: DEFAULT_ROOT,
    rs: DEFAULT_RS,
    ts: DEFAULT_TS,
    mode: DEFAULT_MODE,
    includeNoncanonical: false,
    includeIndex: false,
    cacheAllow: DEFAULT_CACHE_ALLOW,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--root") {
      out.root = args[i + 1] ?? DEFAULT_ROOT;
      i += 1;
      continue;
    }
    if (arg === "--rs") {
      const next = (args[i + 1] ?? "").toUpperCase() as Direction;
      if (next === "ASCEND" || next === "DESCEND" || next === "CONVERGE32") out.rs = next;
      i += 1;
      continue;
    }
    if (arg === "--ts") {
      const next = (args[i + 1] ?? "").toUpperCase() as Direction;
      if (next === "ASCEND" || next === "DESCEND" || next === "CONVERGE32") out.ts = next;
      i += 1;
      continue;
    }
    if (arg === "--mode") {
      const next = (args[i + 1] ?? "").toUpperCase() as Mode;
      if (next === "WARN" || next === "FAIL") out.mode = next;
      i += 1;
      continue;
    }
    if (arg === "--include-noncanonical") {
      out.includeNoncanonical = true;
      continue;
    }
    if (arg === "--include-index") {
      out.includeIndex = true;
      continue;
    }
    if (arg === "--cache") {
      out.cacheAllow = true;
      continue;
    }
    if (arg === "--no-cache") {
      out.cacheAllow = false;
      continue;
    }
  }
  return out;
};

const shouldSkipDir = (name: string): boolean =>
  name.startsWith(".") ||
  name === "archive" ||
  name === "omega_rust_core" ||
  name === "UI" ||
  name === "SINGULARITY" ||
  name === "tests" ||
  name === "e";

const isNoncanonical = (content: string): boolean => {
  const head = content.split("\n").slice(0, 12).join("\n");
  return head.includes("@noncanonical");
};

const loadCacheAllow = async (root: string): Promise<Set<string>> => {
  const allow = new Set<string>();
  const path = resolve(root, DEFAULT_CACHE_PATH);
  try {
    const raw = await Deno.readTextFile(path);
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("- i.")) {
        allow.add(trimmed.slice(2).trim());
      }
    }
  } catch {
    // ignore if missing
  }
  return allow;
};

const levelFromPath = (path: string): number | null => {
  const normalized = path.replaceAll("\\", "/");
  // legacy i.Lxx.* form
  const legacy = normalized.match(/i\.L(\d{2})\./);
  if (legacy) return Number.parseInt(legacy[1], 10);

  // canon octal: /<sector>/<orbit>/<atom>/_.ts
  const canon = normalized.match(/(?:^|\/)([0-8])\/([0-7])\/[^/]+\/_\.t[rs]$/);
  if (!canon) return null;
  const sector = Number.parseInt(canon[1], 10);
  const orbit = Number.parseInt(canon[2], 10);
  if (!Number.isFinite(sector) || !Number.isFinite(orbit)) return null;
  if (sector === 8) return 63;
  return (sector * 8) + orbit;
};

const isWithinBand = (level: number | null): level is number =>
  level !== null && level >= 0 && level <= 63;

const loadAliasMap = (root: string): Map<string, string> => {
  const map = new Map<string, string>();
  const modPath = resolve(root, MOD_PATH);
  const text = Deno.readTextFileSync(modPath);
  const re =
    /export\s+\{\s*([A-Za-z0-9_]+)\s+as\s+([A-Za-z0-9_]+)\s*\}\s+from\s+["']\.\/([^"']+)["']\s*;?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const alias = m[2];
    const relPath = m[3].replaceAll("\\", "/");
    map.set(alias, relPath);
  }
  return map;
};

const allows = (direction: Direction, source: number, target: number): boolean => {
  if (direction === "ASCEND") return target >= source;
  if (direction === "DESCEND") return target <= source;
  if (source === 32) return true;
  if (source < 32) return target >= source && target <= 32;
  return target <= source && target >= 32;
};

const extractTargets = (
  content: string,
  fileDir: string,
  root: string,
  aliasMap: Map<string, string>,
): Array<{ level: number; snippet: string }> => {
  const results: Array<{ level: number; snippet: string }> = [];
  const omegaImport =
    /import\s+(type\s+)?\{\s*([^}]+)\s*\}\s+from\s+["']@omega["']\s*;?/g;
  const genericImport = /import\s+(type\s+)?\{\s*([^}]+)\s*\}\s+from\s+["']([^"']+)["']\s*;?/g;
  const inlineLegacy = /i\.L(\d{2})\./g;

  let match: RegExpExecArray | null;

  while ((match = omegaImport.exec(content)) !== null) {
    const specList = match[2];
    const specs = specList.split(",").map((s) => s.trim()).filter(Boolean);
    for (const spec of specs) {
      const raw = spec.replace(/^type\s+/, "");
      const [leftRaw] = raw.split(/\s+as\s+/i);
      const alias = (leftRaw ?? "").trim();
      const rel = aliasMap.get(alias);
      if (!rel) continue;
      const level = levelFromPath(rel);
      if (level === null) continue;
      results.push({ level, snippet: `@omega:${alias}` });
    }
  }

  while ((match = genericImport.exec(content)) !== null) {
    const modPath = match[3];
    if (modPath === "@omega") continue;
    if (!modPath.startsWith(".") && !modPath.startsWith("/")) continue;
    const abs = resolve(fileDir, modPath);
    const rel = relative(root, abs).replaceAll("\\", "/");
    const level = levelFromPath(rel);
    if (level === null) continue;
    results.push({ level, snippet: match[0] });
  }

  while ((match = inlineLegacy.exec(content)) !== null) {
    const level = Number.parseInt(match[1], 10);
    if (Number.isFinite(level)) {
      results.push({ level, snippet: match[0] });
    }
  }

  return results;
};

const walkCanon = async function* (root: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (shouldSkipDir(entry.name)) continue;
      yield* walkCanon(full);
    } else if (entry.isFile) {
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".rs")) {
        if (full.replaceAll("\\", "/").match(/\/[0-8]\/[0-7]\/[^/]+\/_\.t[rs]$/)) {
          yield full;
        }
      }
    }
  }
};

const main = async () => {
  const args = parseArgs(Deno.args);
  const violations: Violation[] = [];
  const cacheAllow = args.cacheAllow ? await loadCacheAllow(args.root) : new Set<string>();
  const aliasMap = loadAliasMap(args.root);

  for await (const path of walkCanon(args.root)) {
    const base = path.split("/").pop() ?? path;
    const sourceLevel = levelFromPath(path);
    if (!isWithinBand(sourceLevel)) continue;
    if (!args.includeIndex && base.endsWith(".i.ts")) continue;

    const language = base.endsWith(".rs") ? "rs" : "ts";
    const content = await Deno.readTextFile(path);
    if (!args.includeNoncanonical && isNoncanonical(content)) continue;

    const direction = language === "rs" ? args.rs : args.ts;
    const targets = extractTargets(content, dirname(path), args.root, aliasMap);

    for (const target of targets) {
      if (!isWithinBand(target.level)) continue;
      if (cacheAllow.size > 0) {
        const hit = Array.from(cacheAllow).find((id) => target.snippet.includes(id));
        if (hit) continue;
      }
      if (!allows(direction, sourceLevel, target.level)) {
        violations.push({
          file: path,
          source_level: sourceLevel,
          target_level: target.level,
          language,
          rule: direction,
          snippet: target.snippet,
        });
      }
    }
  }

  if (violations.length > 0) {
    console.log(`DIPOLE_IMPORT_AUDIT: ${violations.length} violation(s)`);
    for (const v of violations) {
      console.log(
        `- ${v.language.toUpperCase()} L${String(v.source_level).padStart(2, "0")} -> L${
          String(v.target_level).padStart(2, "0")
        } (${v.rule}) ${v.file} :: ${v.snippet}`,
      );
    }
    if (args.mode === "FAIL") {
      Deno.exit(1);
    }
  } else {
    console.log("DIPOLE_IMPORT_AUDIT: OK");
  }
};

if (import.meta.main) {
  await main();
}
