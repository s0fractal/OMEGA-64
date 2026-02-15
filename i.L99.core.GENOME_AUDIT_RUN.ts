// i.L99.core.GENOME_AUDIT_RUN.ts
// @noncanonical
// OMEGA-64 | Run genome audit over repo paths.

import { GENOME_AUDIT } from "./i.L99.core.GENOME_AUDIT.ts";

const DEFAULT_ROOT = ".";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.GENOME_AUDIT_RUN.ts --root <dir> [--pretty]",
  ].join("\n");

const shouldSkipDir = (name: string): boolean =>
  name.startsWith(".") ||
  name === "archive" ||
  name === "omega_rust_core" ||
  name === "UI" ||
  name === "SINGULARITY";

const isCandidate = (path: string): boolean => {
  const base = path.split("/").pop() ?? path;
  return /^i\.L[0-9]+\./.test(base);
};

const walk = async function* (root: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(root)) {
    const full = `${root}/${entry.name}`;
    if (entry.isDirectory) {
      if (shouldSkipDir(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile) {
      if (isCandidate(entry.name)) yield full;
    }
  }
};

export const GENOME_AUDIT_RUN = async (args: string[]): Promise<void> => {
  const parsed = { root: DEFAULT_ROOT, pretty: false, help: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
      continue;
    }
    if (a === "--pretty") {
      parsed.pretty = true;
      continue;
    }
    if (a === "--root") {
      parsed.root = args[++i] ?? DEFAULT_ROOT;
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  const paths: string[] = [];
  for await (const path of walk(parsed.root)) {
    paths.push(path);
  }

  const report = GENOME_AUDIT(paths);
  const body = parsed.pretty
    ? `${JSON.stringify(report, null, 2)}\n`
    : `${JSON.stringify(report)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  GENOME_AUDIT_RUN(Deno.args);
}
