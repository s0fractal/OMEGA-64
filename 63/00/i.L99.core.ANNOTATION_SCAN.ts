// i.L99.core.ANNOTATION_SCAN.ts
// @noncanonical
// OMEGA-64 | Annotation Scan (i -> o)

/// <reference lib="deno.ns" />

import { RULE_VECTOR_REQUIRED } from "./RULE_VECTOR_REQUIRED.ts";
import { RULE_VECTOR_FORMAT } from "./RULE_VECTOR_FORMAT.ts";
import { RULE_VECTOR_RANGE } from "./RULE_VECTOR_RANGE.ts";
import { RULE_VECTOR_DOMAIN_PHASE } from "./RULE_VECTOR_DOMAIN_PHASE.ts";
import { RULE_SYMBOL_OPTIONAL } from "./RULE_SYMBOL_OPTIONAL.ts";
import { RULE_ORIGIN_OPTIONAL } from "./RULE_ORIGIN_OPTIONAL.ts";
import { RULE_REDIRECT_OPTIONAL } from "./RULE_REDIRECT_OPTIONAL.ts";

type AnnotationEntry = {
  file: string;
  vector?: string;
  readonly?: boolean;
  symbol?: string;
  origin?: string;
  redirect?: string;
  port?: number;
  unfold?: number;
  load?: number;
};

type Rule = (entry: AnnotationEntry) => string | null;

type ScanReport = {
  root: string;
  generatedAt: string;
  entries: AnnotationEntry[];
  errors: string[];
  notes: string[];
};

const DEFAULT_ROOT = "i";
const DEFAULT_OUT = "o/vector_map.json";
const RULES: Rule[] = [
  RULE_VECTOR_REQUIRED,
  RULE_VECTOR_FORMAT,
  RULE_VECTOR_RANGE,
  RULE_VECTOR_DOMAIN_PHASE,
  RULE_SYMBOL_OPTIONAL,
  RULE_ORIGIN_OPTIONAL,
  RULE_REDIRECT_OPTIONAL,
];

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
  const vectorMatch = source.match(
    /@omega\.vector\s+([0-9]+(?:\.[0-9]+){0,2})/,
  );
  if (vectorMatch) entry.vector = vectorMatch[1];

  if (/@omega\.readonly/.test(source)) entry.readonly = true;

  const symbolMatch = source.match(/@omega\.symbol\s+(.+)/);
  if (symbolMatch) entry.symbol = symbolMatch[1].trim();

  const originMatch = source.match(/@omega\.origin\s+(.+)/);
  if (originMatch) entry.origin = originMatch[1].trim();

  const redirectMatch = source.match(/@omega\.redirect\s+(.+)/);
  if (redirectMatch) entry.redirect = redirectMatch[1].trim();

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
    notes: [],
  };

  for await (const path of walk(args.root)) {
    const source = await Deno.readTextFile(path);
    const entry = parseAnnotation(source, path);
    for (const rule of RULES) {
      const err = rule(entry);
      if (err) {
        if (
          err.startsWith("DOMAIN_PHASE") || err.startsWith("SYMBOL") ||
          err.startsWith("ORIGIN") || err.startsWith("REDIRECT")
        ) report.notes.push(err);
        else report.errors.push(err);
      }
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
