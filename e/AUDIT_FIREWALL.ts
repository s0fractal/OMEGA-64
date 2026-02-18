/**
 * [e/AUDIT_FIREWALL.ts]
 * Loads the canonical firewall rules registry and reports status counts.
 */

import { parse as parseYaml } from "jsr:@std/yaml";

const RULES_PATH = "./8/2/FIREWALL_RULES/_.yaml";

type FirewallRule = {
  id: string;
  scope: string;
  ext: string;
  action: string;
  status: string;
  reason?: string;
};

const rawText = await Deno.readTextFile(RULES_PATH);
const raw = parseYaml(rawText) as { rules?: FirewallRule[]; vector?: string; symbol?: string };

const rules = Array.isArray(raw?.rules) ? raw.rules : [];

let active = 0;
const counts = new Map<string, number>();
for (const rule of rules) {
  const status = rule?.status ?? "UNKNOWN";
  if (status === "ACTIVE") active++;
  counts.set(status, (counts.get(status) ?? 0) + 1);
}

console.log("FIREWALL_RULES_LOADED", RULES_PATH);
console.log("VECTOR", raw?.vector ?? "UNKNOWN");
console.log("SYMBOL", raw?.symbol ?? "UNKNOWN");
console.log("TOTAL_RULES", rules.length);
console.log("ACTIVE_RULES", active);
console.log("STATUS_COUNTS");
for (const [status, count] of Array.from(counts.entries()).sort()) {
  console.log(`- ${status}: ${count}`);
}
