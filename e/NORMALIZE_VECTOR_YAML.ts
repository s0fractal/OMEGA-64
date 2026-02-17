/**
 * Normalize _.yaml vector format to two-digit octal components.
 * Example: 0.0.1 -> 00.00.01
 */

import { walk } from "jsr:@std/fs";

const VECTOR_LINE = /^(\s*vector:\s*)(["']?)(\d+)\.(\d+)\.(\d+)(["']?)\s*$/m;

const pad2 = (value: string) => value.padStart(2, "0");

const shouldScan = (path: string) =>
  /(^|\/)[0-8](\/|$)/.test(path) || /(^|\/)i(\/|$)/.test(path);

const normalizeVector = (text: string): { updated: boolean; next: string } => {
  const match = text.match(VECTOR_LINE);
  if (!match) return { updated: false, next: text };
  const [, prefix, openQuote, a, b, c, closeQuote] = match;
  const nextVector = `${pad2(a)}.${pad2(b)}.${pad2(c)}`;
  const replacement = `${prefix}${openQuote}${nextVector}${closeQuote}`;
  const next = text.replace(VECTOR_LINE, replacement);
  return { updated: next !== text, next };
};

async function main() {
  let touched = 0;
  for await (const entry of walk(".")) {
    if (!entry.isFile || entry.name !== "_.yaml") continue;
    if (!shouldScan(entry.path)) continue;
    const source = await Deno.readTextFile(entry.path);
    const { updated, next } = normalizeVector(source);
    if (updated) {
      await Deno.writeTextFile(entry.path, next);
      touched += 1;
    }
  }
  console.log(`NORMALIZE_VECTOR_YAML: updated ${touched} file(s)`);
}

if (import.meta.main) {
  await main();
}
