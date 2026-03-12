// i.L99.core.NONCANONICAL_AUDIT.ts
// @noncanonical
// OMEGA-64 | Noncanonical Survey
// List files that are not i.* coordinates (system anchors excluded).

/// <reference lib="deno.ns" />

const DEFAULT_ROOT = ".";

const SYSTEM_ALLOWLIST = new Set([
  "deno.jsonc",
  "deno.lock",
  "Cargo.toml",
  "Core.lean",
  "core.rs",
  "SOVEREIGN_UI.html",
  "README.md",
  "mod.ts",
  "mod.md",
  "main.rs",
  "lakefile.lean",
  "serve_ui.ts",
  ".gitignore",
  ".gitattributes",
]);

const SKIP_DIRS = new Set([
  ".git",
  "archive",
  "omega_rust_core",
  "UI",
  "SINGULARITY",
  "vis",
]);

const parseArgs = (args: string[]) => {
  const out: { root: string; json: boolean; help: boolean } = {
    root: DEFAULT_ROOT,
    json: false,
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
    if (arg === "--json") {
      out.json = true;
      continue;
    }
  }
  return out;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.NONCANONICAL_AUDIT.ts [--root <dir>] [--json]",
    "",
    "Defaults:",
    `  root: ${DEFAULT_ROOT}`,
  ].join("\n");

const isSystemFile = (name: string): boolean => SYSTEM_ALLOWLIST.has(name);

const isCoordinateFile = (name: string): boolean => name.startsWith("i.");

const walk = async function* (root: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile) {
      yield full;
    }
  }
};

if (import.meta.main) {
  const args = parseArgs(Deno.args);
  if (args.help) {
    console.log(usage());
    Deno.exit(0);
  }

  const system: string[] = [];
  const candidates: string[] = [];
  for await (const path of walk(args.root)) {
    const base = path.split("/").pop() ?? path;
    if (isCoordinateFile(base)) continue;
    if (isSystemFile(base)) {
      system.push(path);
      continue;
    }
    candidates.push(path);
  }

  const report = {
    generated_at: new Date().toISOString(),
    root: args.root,
    system,
    candidates,
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`SYSTEM: ${system.length}`);
    console.log(`CANDIDATES: ${candidates.length}`);
    candidates.forEach((path) => console.log(path));
  }
}
