// i.L99.core.DRIFT_CONTROLLER_CLI.ts
// OMEGA-64 | Drift Controller CLI
// "Evaluate semantic drift between old/new sources."

/// <reference lib="deno.ns" />

import { DRIFT_CONTROLLER } from "./i.L99.core.DRIFT_CONTROLLER.ts";

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.DRIFT_CONTROLLER_CLI.ts --old <path> --new <path> [--pattern <regex>] [--allow-type-removals] [--json]",
    "",
    "Notes:",
    "  - --pattern can be repeated to mark critical imports.",
    "  - --json outputs machine-readable report.",
  ].join("\n");

const parseArgs = (args: string[]) => {
  const out: {
    old?: string;
    next?: string;
    patterns: string[];
    allowTypeRemovals: boolean;
    json: boolean;
    help: boolean;
  } = {
    patterns: [],
    allowTypeRemovals: false,
    json: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      out.help = true;
      continue;
    }
    if (arg === "--old") {
      out.old = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--new") {
      out.next = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--pattern") {
      const value = args[i + 1];
      if (value) out.patterns.push(value);
      i += 1;
      continue;
    }
    if (arg === "--allow-type-removals") {
      out.allowTypeRemovals = true;
      continue;
    }
    if (arg === "--json") {
      out.json = true;
      continue;
    }
  }
  return out;
};

if (import.meta.main) {
  const args = parseArgs(Deno.args);
  if (args.help || !args.old || !args.next) {
    console.log(usage());
    Deno.exit(args.help ? 0 : 1);
  }

  const [oldSource, newSource] = await Promise.all([
    Deno.readTextFile(args.old),
    Deno.readTextFile(args.next),
  ]);

  const report = DRIFT_CONTROLLER.audit(oldSource, newSource, {
    criticalImportPatterns: args.patterns.length > 0
      ? args.patterns
      : undefined,
    allowTypeRemovals: args.allowTypeRemovals,
  });

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      report.ok ? "DRIFT_OK" : `DRIFT_FAIL: ${report.reasons.join(", ")}`,
    );
  }

  if (!report.ok) {
    Deno.exit(1);
  }
}
