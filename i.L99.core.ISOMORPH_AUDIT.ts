// i.L99.core.ISOMORPH_AUDIT.ts
// @noncanonical
// OMEGA-64 | Isomorph Audit (Projection Metric Preservation)

/// <reference lib="deno.ns" />

type CanonEntry = {
  file: string;
  vector?: string;
  origin?: string;
};

type ProjectionEntry = {
  base: string;
  ext: string;
  path: string;
};

type IsomorphReport = {
  generatedAt: string;
  canonRoot: string;
  projectionRoots: string[];
  canon: CanonEntry[];
  projections: Record<string, ProjectionEntry[]>;
  errors: string[];
  notes: string[];
};

const DEFAULT_CANON_ROOT = "i";
const DEFAULT_PROJECTION_ROOTS = ["."];
const DEFAULT_OUT = "o/isomorph_audit.json";

const parseArgs = (args: string[]) => {
  let canonRoot = DEFAULT_CANON_ROOT;
  let out = DEFAULT_OUT;
  let projectionRoots = [...DEFAULT_PROJECTION_ROOTS];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--canon") {
      canonRoot = args[i + 1] ?? DEFAULT_CANON_ROOT;
      i += 1;
    } else if (arg === "--out") {
      out = args[i + 1] ?? DEFAULT_OUT;
      i += 1;
    } else if (arg === "--roots") {
      const raw = args[i + 1] ?? "";
      projectionRoots = raw.split(",").map((part) => part.trim()).filter(Boolean);
      i += 1;
    }
  }
  return { canonRoot, out, projectionRoots };
};

const parseCanon = (source: string, file: string): CanonEntry => {
  const entry: CanonEntry = { file };
  const vectorMatch = source.match(/@omega\.vector\s+([0-9]+(?:\.[0-9]+){0,2})/);
  if (vectorMatch) entry.vector = vectorMatch[1];
  const originMatch = source.match(/@omega\.origin\s+(.+)/);
  if (originMatch) entry.origin = originMatch[1].trim();
  return entry;
};

const walk = async function* (root: string): AsyncGenerator<string> {
  try {
    for await (const entry of Deno.readDir(root)) {
      const full = `${root}/${entry.name}`;
      if (entry.isDirectory) {
        yield* walk(full);
      } else if (entry.isFile) {
        yield full;
      }
    }
  } catch {
    // ignore missing roots
  }
};

const normalizeBase = (path: string): string => {
  const trimmed = path.replace(/^\.\//, "");
  return trimmed.replace(/\.[a-z0-9]+$/i, "");
};

const isProjectionFile = (path: string): boolean =>
  /i\.L\d{2}\.[^.]+\..+\.(ts|rs|md|q)$/i.test(path);

const collectProjections = async (roots: string[]) => {
  const projections: Record<string, ProjectionEntry[]> = {};
  for (const root of roots) {
    for await (const path of walk(root)) {
      if (!isProjectionFile(path)) continue;
      const extMatch = path.match(/\.([a-z0-9]+)$/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : "unknown";
      const base = normalizeBase(path);
      if (!projections[base]) projections[base] = [];
      projections[base].push({ base, ext, path });
    }
  }
  return projections;
};

const main = async () => {
  const { canonRoot, out, projectionRoots } = parseArgs(Deno.args);
  const report: IsomorphReport = {
    generatedAt: new Date().toISOString(),
    canonRoot,
    projectionRoots,
    canon: [],
    projections: {},
    errors: [],
    notes: [],
  };

  for await (const path of walk(canonRoot)) {
    if (!path.endsWith(".ts")) continue;
    const source = await Deno.readTextFile(path);
    report.canon.push(parseCanon(source, path));
  }

  report.projections = await collectProjections(projectionRoots);

  const originMap = new Map<string, CanonEntry[]>();
  for (const entry of report.canon) {
    if (!entry.origin) continue;
    const originBase = normalizeBase(entry.origin);
    if (!originMap.has(originBase)) originMap.set(originBase, []);
    originMap.get(originBase)?.push(entry);
  }

  for (const [originBase, entries] of originMap.entries()) {
    const vectors = Array.from(new Set(entries.map((e) => e.vector).filter(Boolean)));
    if (vectors.length > 1) {
      report.errors.push(`VECTOR_DRIFT ${originBase} -> ${vectors.join(", ")}`);
    }
    const projections = report.projections[originBase];
    if (!projections || projections.length === 0) {
      report.errors.push(`MISSING_PROJECTION ${originBase}`);
    } else {
      const exts = Array.from(new Set(projections.map((p) => p.ext))).sort();
      report.notes.push(`PROJECTIONS ${originBase} -> ${exts.join(",")}`);
    }
  }

  await Deno.mkdir("o", { recursive: true });
  await Deno.writeTextFile(out, JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    console.log(`ISOMORPH_AUDIT: ${report.errors.length} error(s)`);
    for (const err of report.errors) console.log(`- ${err}`);
  } else {
    console.log("ISOMORPH_AUDIT: OK");
  }
};

if (import.meta.main) {
  await main();
}
