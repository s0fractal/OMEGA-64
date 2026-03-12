/**
 * [e/AUDIT_CODEX.ts]
 * Loads the canonical codex rules registry and reports status counts.
 */

import { parse as parseYaml } from "jsr:@std/yaml";
import { walk } from "jsr:@std/fs";
import { globToRegExp, relative } from "jsr:@std/path";

const RULES_PATH = "./8/2/CODEX_RULES/_.yaml";

type FirewallRule = {
  id: string;
  path: string;
  action: string;
  status: string;
  reason?: string;
  allow?: string[];
  deny?: string[];
};

const rawText = await Deno.readTextFile(RULES_PATH);
const raw = parseYaml(rawText) as {
  rules?: FirewallRule[];
  vector?: string;
  symbol?: string;
};

const rules = Array.isArray(raw?.rules) ? raw.rules : [];

let active = 0;
const counts = new Map<string, number>();
for (const rule of rules) {
  const status = rule?.status ?? "UNKNOWN";
  if (status === "ACTIVE") active++;
  counts.set(status, (counts.get(status) ?? 0) + 1);
}

console.log("CODEX_RULES_LOADED", RULES_PATH);
console.log("VECTOR", raw?.vector ?? "UNKNOWN");
console.log("SYMBOL", raw?.symbol ?? "UNKNOWN");
console.log("TOTAL_RULES", rules.length);
console.log("ACTIVE_RULES", active);
console.log("STATUS_COUNTS");
for (const [status, count] of Array.from(counts.entries()).sort()) {
  console.log(`- ${status}: ${count}`);
}

// Lightweight enforcement for WARNING/ACTIVE rules
const warn: string[] = [];
const fail: string[] = [];

const root = Deno.cwd();
const matchRule = (
  rule: FirewallRule,
  fileRel: string,
  dirRel: string,
): boolean => {
  const re = globToRegExp(rule.path, { extended: true, globstar: true });
  return re.test(fileRel);
};

const requireMdRules = rules.filter((r) =>
  r.action === "REQUIRE_MD" && (r.status === "WARNING" || r.status === "ACTIVE")
);
const denyCommentRules = rules.filter((r) =>
  r.action === "DENY_COMMENTS" &&
  (r.status === "WARNING" || r.status === "ACTIVE")
);
const denyTokenRules = rules.filter((r) =>
  r.action === "DENY_TOKENS" &&
  (r.status === "WARNING" || r.status === "ACTIVE")
);

if (requireMdRules.length || denyCommentRules.length) {
  const atomDirs = new Set<string>();
  for await (const entry of walk(root, { includeDirs: false })) {
    if (!entry.isFile || entry.name !== "_.yaml") continue;
    const rel = relative(root, entry.path).replaceAll("\\", "/");
    const dirRel = rel.replace(/\/_\.yaml$/, "");
    for (const rule of requireMdRules) {
      const mdRel = `${dirRel}/_.md`;
      if (matchRule(rule, mdRel, dirRel)) atomDirs.add(dirRel);
    }
  }

  for (const dirRel of atomDirs) {
    const mdPath = `${root}/${dirRel}/_.md`;
    try {
      await Deno.stat(mdPath);
    } catch {
      for (const rule of requireMdRules) {
        if (!matchRule(rule, `${dirRel}/_.md`, dirRel)) continue;
        const line = `${dirRel}: missing _.md (${rule.id})`;
        if (rule.status === "ACTIVE") fail.push(line);
        else warn.push(line);
      }
    }
  }

  for await (const entry of walk(root, { includeDirs: false })) {
    if (!entry.isFile || entry.name !== "_.ts") continue;
    const rel = relative(root, entry.path).replaceAll("\\", "/");
    const dirRel = rel.replace(/\/_\.ts$/, "");
    const applyComments = denyCommentRules.filter((r) =>
      matchRule(r, rel, dirRel)
    );
    const applyTokens = denyTokenRules.filter((r) => matchRule(r, rel, dirRel));
    if (applyComments.length === 0 && applyTokens.length === 0) continue;
    const content = await Deno.readTextFile(entry.path);
    if (
      applyComments.length && (content.includes("//") || content.includes("/*"))
    ) {
      for (const rule of applyComments) {
        const line = `${dirRel}: comments present (${rule.id})`;
        if (rule.status === "ACTIVE") fail.push(line);
        else warn.push(line);
      }
    }
    if (applyTokens.length) {
      for (const rule of applyTokens) {
        const deny = Array.isArray(rule.deny) ? rule.deny : [];
        for (const token of deny) {
          if (token && content.includes(token)) {
            const line = `${dirRel}: forbidden token ${token} (${rule.id})`;
            if (rule.status === "ACTIVE") fail.push(line);
            else warn.push(line);
          }
        }
      }
    }
  }
}

if (warn.length) {
  console.log("\nWARNINGS");
  for (const w of warn) console.log(`- ${w}`);
}
if (fail.length) {
  console.error("\nVIOLATIONS");
  for (const f of fail) console.error(`- ${f}`);
  Deno.exit(1);
}
