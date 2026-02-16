// i.L99.core.ISOMORPH_AUDIT.ts
// @noncanonical
// OMEGA-64 | Isomorph Audit (Projection Metric Preservation)

/// <reference lib="deno.ns" />

type ProjectionEntry = {
  level: number;
  layer: string;
  name: string;
  ext: string;
  path: string;
};

type IsomorphReport = {
  generatedAt: string;
  projectionRoots: string[];
  projections: Record<string, ProjectionEntry[]>;
  errors: string[];
  notes: string[];
};

const DEFAULT_PROJECTION_ROOTS = ["."];
const DEFAULT_OUT = "o/isomorph_audit.json";
const MIRROR_CENTER = 63;

const parseArgs = (args: string[]) => {
  let out = DEFAULT_OUT;
  let projectionRoots = [...DEFAULT_PROJECTION_ROOTS];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--out") {
      out = args[i + 1] ?? DEFAULT_OUT;
      i += 1;
    } else if (arg === "--roots") {
      const raw = args[i + 1] ?? "";
      projectionRoots = raw.split(",").map((part) => part.trim()).filter(Boolean);
      i += 1;
    }
  }
  return { out, projectionRoots };
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

const parseProjection = (path: string): ProjectionEntry | null => {
  const match = path.match(/i\.L(\d{2})\.([^.]+)\.([^.]+)\.([a-z0-9]+)$/i);
  if (!match) return null;
  const level = Number(match[1]);
  const layer = match[2];
  const name = match[3];
  const ext = match[4].toLowerCase();
  return { level, layer, name, ext, path };
};

const collectProjections = async (roots: string[]) => {
  const projections: Record<string, ProjectionEntry[]> = {};
  for (const root of roots) {
    for await (const path of walk(root)) {
      const entry = parseProjection(path);
      if (!entry) continue;
      const key = `${entry.layer}.${entry.name}`;
      if (!projections[key]) projections[key] = [];
      projections[key].push(entry);
    }
  }
  return projections;
};

const main = async () => {
  const { out, projectionRoots } = parseArgs(Deno.args);
  const report: IsomorphReport = {
    generatedAt: new Date().toISOString(),
    projectionRoots,
    projections: {},
    errors: [],
    notes: [],
  };

  report.projections = await collectProjections(projectionRoots);

  for (const [key, entries] of Object.entries(report.projections)) {
    const tsEntries = entries.filter((entry) => entry.ext === "ts");
    const rsEntries = entries.filter((entry) => entry.ext === "rs");
    if (tsEntries.length === 0 && rsEntries.length === 0) continue;

    const rsLevels = new Set(rsEntries.map((entry) => entry.level));

    for (const ts of tsEntries) {
      const expected = MIRROR_CENTER - ts.level;
      if (!rsLevels.has(expected)) {
        report.errors.push(
          `MISSING_MIRROR ${key} ts=L${ts.level.toString().padStart(2, "0")} -> rs=L${expected
            .toString()
            .padStart(2, "0")}`,
        );
      }
    }

    if (tsEntries.length > 0 && rsEntries.length > 0) {
      report.notes.push(
        `MIRROR_PAIR ${key} ts=${tsEntries.length} rs=${rsEntries.length}`,
      );
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
