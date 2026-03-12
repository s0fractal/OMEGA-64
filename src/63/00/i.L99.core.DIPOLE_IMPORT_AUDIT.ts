// i.L99.core.DIPOLE_IMPORT_AUDIT.ts
// @noncanonical
// OMEGA-64 | Dipole Import Audit

/// <reference lib="deno.ns" />

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
const DEFAULT_CACHE_ALLOW = true;

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
  name === "SINGULARITY";

const levelFromName = (name: string): number | null => {
  const match = name.match(/i\.L(\d{2})\./);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
};

const isWithinBand = (level: number | null): level is number =>
  level !== null && level >= 0 && level <= 63;

const isNoncanonical = (content: string): boolean => {
  const head = content.split("\n").slice(0, 12).join("\n");
  return head.includes("@noncanonical");
};

const loadCacheAllow = async (root: string): Promise<Set<string>> => {
  const allow = new Set<string>();
  const path = `${root}/i.L99.core.CACHE_INVARIANTS.md`;
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

const extractTargets = (content: string): Array<{ level: number; snippet: string }> => {
  const results: Array<{ level: number; snippet: string }> = [];
  const importRegex = /(?:from\s+|import\s+|use\s+)[^'"]*['"]([^'"]+)['"]/g;
  const inlineRegex = /i\.L(\d{2})\./g;

  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const path = match[1];
    const levelMatch = path.match(/i\.L(\d{2})\./);
    if (levelMatch) {
      results.push({ level: Number.parseInt(levelMatch[1], 10), snippet: match[0] });
    }
  }

  while ((match = inlineRegex.exec(content)) !== null) {
    const level = Number.parseInt(match[1], 10);
    results.push({ level, snippet: match[0] });
  }

  return results;
};

const allows = (direction: Direction, source: number, target: number): boolean => {
  if (direction === "ASCEND") return target >= source;
  if (direction === "DESCEND") return target <= source;
  if (source === 32) return true;
  if (source < 32) return target >= source && target <= 32;
  return target <= source && target >= 32;
};

const walk = async function* (root: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (shouldSkipDir(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile) {
      if (entry.name.endsWith(".ts") || entry.name.endsWith(".rs")) {
        if (entry.name.startsWith("i.L")) yield full;
      }
    }
  }
};

const main = async () => {
  const args = parseArgs(Deno.args);
  const violations: Violation[] = [];
  const cacheAllow = args.cacheAllow ? await loadCacheAllow(args.root) : new Set<string>();

  for await (const path of walk(args.root)) {
    const base = path.split("/").pop() ?? path;
    const sourceLevel = levelFromName(base);
    if (!isWithinBand(sourceLevel)) continue;
    if (!args.includeIndex && base.endsWith(".i.ts")) continue;

    const language = base.endsWith(".rs") ? "rs" : "ts";
    const content = await Deno.readTextFile(path);
    if (!args.includeNoncanonical && isNoncanonical(content)) continue;

    const direction = language === "rs" ? args.rs : args.ts;
    const targets = extractTargets(content);

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
