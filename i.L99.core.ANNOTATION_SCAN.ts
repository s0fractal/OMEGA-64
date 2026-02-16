// i.L99.core.ANNOTATION_SCAN.ts
// @noncanonical
// OMEGA-64 | Annotation Scan (i -> o)

/// <reference lib="deno.ns" />

type AnnotationEntry = {
  file: string;
  vector?: string;
  readonly?: boolean;
  port?: number;
  unfold?: number;
  load?: number;
};

type ScanReport = {
  root: string;
  generatedAt: string;
  entries: AnnotationEntry[];
  errors: string[];
};

const DEFAULT_ROOT = "i";
const DEFAULT_OUT = "o/vector_map.json";

const parseArgs = (args: string[]) => {
  let root = DEFAULT_ROOT;
  let out = DEFAULT_OUT;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--root") {
      root = args[i + 1] ?? DEFAULT_ROOT;
      i += 1;
    } else if (arg === "--out") {
      out = args[i + 1] ?? DEFAULT_OUT;
      i += 1;
    }
  }
  return { root, out };
};

const parseAnnotation = (source: string, file: string): AnnotationEntry => {
  const entry: AnnotationEntry = { file };
  const vectorMatch = source.match(/@omega\.vector\s+([0-9]+(?:\.[0-9]+){0,2})/);
  if (vectorMatch) entry.vector = vectorMatch[1];

  if (/@omega\.readonly/.test(source)) entry.readonly = true;

  const portMatch = source.match(/@omega\.port\s+(\d{1,5})/);
  if (portMatch) entry.port = Number(portMatch[1]);

  const unfoldMatch = source.match(/@omega\.unfold\s+(\d{1,2})/);
  if (unfoldMatch) entry.unfold = Number(unfoldMatch[1]);

  const loadMatch = source.match(/@omega\.load\s+([0-9]+(?:\.[0-9]+)?)/);
  if (loadMatch) entry.load = Number(loadMatch[1]);

  return entry;
};

const walk = async function* (root: string): AsyncGenerator<string> {
  try {
    for await (const entry of Deno.readDir(root)) {
      const full = `${root}/${entry.name}`;
      if (entry.isDirectory) {
        yield* walk(full);
      } else if (entry.isFile && entry.name.endsWith(".ts")) {
        yield full;
      }
    }
  } catch {
    // root may not exist yet
  }
};

const main = async () => {
  const args = parseArgs(Deno.args);
  const report: ScanReport = {
    root: args.root,
    generatedAt: new Date().toISOString(),
    entries: [],
    errors: [],
  };

  for await (const path of walk(args.root)) {
    const source = await Deno.readTextFile(path);
    const entry = parseAnnotation(source, path);
    if (!entry.vector) {
      report.errors.push(`Missing @omega.vector: ${path}`);
    }
    report.entries.push(entry);
  }

  await Deno.mkdir("o", { recursive: true });
  await Deno.writeTextFile(args.out, JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    console.log(`ANNOTATION_SCAN: ${report.errors.length} error(s)`);
    for (const err of report.errors) console.log(`- ${err}`);
  } else {
    console.log("ANNOTATION_SCAN: OK");
  }
};

if (import.meta.main) {
  await main();
}
