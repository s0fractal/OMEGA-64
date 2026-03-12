// @noncanonical
// OMEGA-64 | Recursive Sigma Export
// Produces a single structured markdown (I.sigma.md) with all i.L* projections.

/// <reference lib="deno.ns" />

const DEFAULT_OUTPUT = "I.sigma.md";
const DEFAULT_ROOT = ".";
const DEFAULT_MODE = "entity";

const parseArgs = (args: string[]) => {
  const out: {
    root: string;
    output: string;
    mode: string;
    includeQView: boolean;
    includeQLegacy: boolean;
    help: boolean;
  } = {
    root: DEFAULT_ROOT,
    output: DEFAULT_OUTPUT,
    mode: DEFAULT_MODE,
    includeQView: false,
    includeQLegacy: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--root") {
      out.root = args[i + 1] ?? DEFAULT_ROOT;
      i += 1;
      continue;
    }
    if (arg === "--output") {
      out.output = args[i + 1] ?? DEFAULT_OUTPUT;
      i += 1;
      continue;
    }
    if (arg === "--mode") {
      out.mode = args[i + 1] ?? DEFAULT_MODE;
      i += 1;
      continue;
    }
    if (arg === "--include-q-view") {
      out.includeQView = true;
      continue;
    }
    if (arg === "--include-q-legacy") {
      out.includeQLegacy = true;
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A export_sigma.ts [--root <dir>] [--output <file>] [--mode entity|level] [--include-q-view] [--include-q-legacy]",
    "",
    "Defaults:",
    `  root: ${DEFAULT_ROOT}`,
    `  output: ${DEFAULT_OUTPUT}`,
    `  mode: ${DEFAULT_MODE}`,
  ].join("\n");

const shouldSkipDir = (name: string): boolean =>
  name.startsWith(".") ||
  name === "archive" ||
  name === "omega_rust_core" ||
  name === "UI" ||
  name === "SINGULARITY";

const isCandidate = (path: string): boolean => {
  const base = path.split("/").pop() ?? path;
  return /^i\.L[0-9+-]+/.test(base) || base === "i.q";
};

const shouldSkipFile = (
  name: string,
  includeQView: boolean,
  includeQLegacy: boolean,
): boolean => {
  if (!includeQView && /\.q\.(hue|phi|evt)$/.test(name)) return true;
  if (!includeQLegacy && /\.q\.(md|ts)$/.test(name)) return true;
  return false;
};

const walk = async function* (
  root: string,
  includeQView: boolean,
  includeQLegacy: boolean,
): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (shouldSkipDir(entry.name)) continue;
      yield* walk(full, includeQView, includeQLegacy);
    } else if (entry.isFile) {
      if (
        isCandidate(entry.name) &&
        !shouldSkipFile(entry.name, includeQView, includeQLegacy)
      ) {
        yield full;
      }
    }
  }
};

const levelToken = (filename: string): string | null => {
  if (filename === "i.q") return "Q";
  const match = filename.match(/^i\.(L[0-9+-]+)\./);
  return match ? match[1] : null;
};

const levelOrder = (token: string): number => {
  if (token === "Q") return -1;
  const raw = token.replace(/^L/, "");
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
};

const langFor = (path: string): string => {
  const ext = path.split(".").pop() ?? "";
  switch (ext) {
    case "ts":
      return "ts";
    case "rs":
      return "rs";
    case "md":
      return "md";
    case "json":
      return "json";
    case "html":
      return "html";
    case "svg":
      return "svg";
    case "lean":
      return "lean";
    case "txt":
      return "txt";
    case "q":
      return "q";
    default:
      return "";
  }
};

const header = (title: string): string => `# ${title}`;
const subheader = (title: string): string => `## ${title}`;
const fileHeader = (title: string): string => `### ${title}`;
const projectionHeader = (title: string): string => `#### ${title}`;

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    return;
  }

  const files: { path: string; level: string; order: number }[] = [];
  for await (
    const path of walk(args.root, args.includeQView, args.includeQLegacy)
  ) {
    const base = path.split("/").pop() ?? path;
    const token = levelToken(base);
    if (!token) continue;
    files.push({ path, level: token, order: levelOrder(token) });
  }

  files.sort((a, b) =>
    a.order - b.order || a.level.localeCompare(b.level) ||
    a.path.localeCompare(b.path)
  );

  const byLevel = new Map<string, string[]>();
  for (const file of files) {
    const list = byLevel.get(file.level) ?? [];
    list.push(file.path);
    byLevel.set(file.level, list);
  }

  const lines: string[] = [];
  lines.push(header("OMEGA-64 | I.sigma.md | Recursive Fold"));
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  const mode = args.mode.toLowerCase();
  for (
    const level of Array.from(byLevel.keys()).sort((a, b) =>
      levelOrder(a) - levelOrder(b) || a.localeCompare(b)
    )
  ) {
    lines.push("");
    lines.push(subheader(level));
    const levelFiles = byLevel.get(level) ?? [];
    if (mode === "level") {
      for (const path of levelFiles) {
        const base = path.startsWith("./") ? path.slice(2) : path;
        const content = await Deno.readTextFile(path);
        const lang = langFor(path);
        lines.push("");
        lines.push(fileHeader(base));
        lines.push("");
        lines.push(`\`\`\`${lang}`);
        lines.push(content.replace(/\s+$/, ""));
        lines.push("```");
      }
      continue;
    }

    const byEntity = new Map<string, string[]>();
    for (const path of levelFiles) {
      const baseName = path.split("/").pop() ?? path;
      const base = baseName === "i.q" ? path : path.replace(/\.[^.]+$/, "");
      const list = byEntity.get(base) ?? [];
      list.push(path);
      byEntity.set(base, list);
    }
    const entities = Array.from(byEntity.keys()).sort((a, b) =>
      a.localeCompare(b)
    );
    for (const entity of entities) {
      const label = entity.startsWith("./") ? entity.slice(2) : entity;
      lines.push("");
      lines.push(fileHeader(label));
      const projections = (byEntity.get(entity) ?? []).sort((a, b) =>
        a.localeCompare(b)
      );
      for (const path of projections) {
        const lang = langFor(path);
        const ext = path.split(".").pop() ?? "";
        const content = await Deno.readTextFile(path);
        lines.push("");
        lines.push(projectionHeader(ext));
        lines.push("");
        lines.push(`\`\`\`${lang}`);
        lines.push(content.replace(/\s+$/, ""));
        lines.push("```");
      }
    }
  }

  await Deno.writeTextFile(args.output, lines.join("\n"));
  console.log(`Sigma fold written to ${args.output}`);
};

if (import.meta.main) {
  await main();
}
