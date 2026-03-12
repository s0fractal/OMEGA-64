/**
 * [e/AUDIT_YAML.ts]
 * Scans all YAML files and strictly validates them against the Zod Schema.
 * Reports compliance rate and lists invalid files.
 */

import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";
import { relative } from "jsr:@std/path";
import { Atom as AtomSchema } from "../4/0/SCHEMA/_.ts";

const VECTOR_00 = /^\d{2}\.\d{2}\.\d{2}$/;
const RULES_PATH = "./8/2/CODEX_RULES/_.yaml";

type FirewallRule = {
  id: string;
  scope: string;
  ext?: string;
  action: string;
  status: string;
};

function ruleActive(rules: FirewallRule[], id: string): boolean {
  return rules.some((r) => r?.id === id && r?.status === "ACTIVE");
}

async function loadRules(): Promise<FirewallRule[]> {
  try {
    const rawText = await Deno.readTextFile(RULES_PATH);
    const raw = parseYaml(rawText) as { rules?: FirewallRule[] };
    return Array.isArray(raw?.rules) ? raw.rules : [];
  } catch {
    return [];
  }
}

async function main() {
  console.log("Auditing YAML Files against Platonic Schema...");
  let total = 0;
  let valid = 0;
  const errors: string[] = [];
  const rules = await loadRules();
  const enforceVector00 = ruleActive(rules, "VECTOR_FORMAT_00");
  const enforceVectorMatchPath = ruleActive(rules, "VECTOR_MATCH_PATH");

  const root = Deno.cwd();
  for await (const entry of walk(root, { includeDirs: false })) {
    if (!entry.isFile || !entry.name.endsWith(".yaml")) continue;
    const rel = relative(root, entry.path).replaceAll("\\", "/");
    if (!/(?:^|\/)[0-8]\/[0-7]\/[^/]+\/_\.yaml$/.test(rel)) continue;
    total++;
    try {
      const content = await Deno.readTextFile(entry.path);
      const raw = parseYaml(content);
      const result = AtomSchema.safeParse(raw);

      if (result.success) {
        const vec = (result.data as { vector?: string }).vector;
        if (enforceVector00 && typeof vec === "string") {
          const v = vec;
          if (!VECTOR_00.test(v)) {
            errors.push(`${rel}: vector must be SS.OO.VV (two-digit segments)`);
            continue;
          }
        }
        if (enforceVectorMatchPath && typeof vec === "string") {
          const match = rel.match(/(?:^|\/)([0-8])\/([0-7])\/[^/]+\/_\.yaml$/);
          if (match) {
            const ss = match[1].padStart(2, "0");
            const oo = match[2].padStart(2, "0");
            if (!vec.startsWith(`${ss}.${oo}.`)) {
              errors.push(
                `${rel}: vector must match path prefix ${ss}.${oo}.*`,
              );
              continue;
            }
          }
        }
        valid++;
      } else {
        // Determine checking for minimal validity (just vector) vs strict
        errors.push(
          `${rel}: ${
            result.error.issues.map((i) => i.path.join(".") + " " + i.message)
              .join(", ")
          }`,
        );
      }
    } catch (e) {
      errors.push(`${rel}: Malformed YAML`);
    }
  }

  console.log(`\n--- Audit Results ---`);
  console.log(`Total YAMLs: ${total}`);
  console.log(`Valid Schema: ${valid}`);
  console.log(`Compliance: ${((valid / total) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log(`\n--- Violations (${errors.length}) ---`);
    // Show first 10 violations
    console.log(errors.slice(0, 10).join("\n"));
    if (errors.length > 10) console.log(`... and ${errors.length - 10} more.`);
  }
}

main();
