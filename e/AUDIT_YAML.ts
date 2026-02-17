/**
 * [e/AUDIT_YAML.ts]
 * Scans all YAML files and strictly validates them against the Zod Schema.
 * Reports compliance rate and lists invalid files.
 */

import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";
import { Atom as AtomSchema } from "../i/i.L32.core.SCHEMA.ts";

async function main() {
    console.log("Auditing YAML Files against Platonic Schema...");
    let total = 0;
    let valid = 0;
    const errors: string[] = [];

    for await (const entry of walk("i", { maxDepth: 1 })) {
        if (!entry.isFile || !entry.name.endsWith(".yaml")) continue;
        total++;
        try {
            const content = await Deno.readTextFile(entry.path);
            const raw = parseYaml(content);
            const result = AtomSchema.safeParse(raw);

            if (result.success) {
                valid++;
            } else {
                // Determine checking for minimal validity (just vector) vs strict
                errors.push(`${entry.name}: ${result.error.issues.map(i => i.path.join('.') + " " + i.message).join(', ')}`);
            }
        } catch (e) {
            errors.push(`${entry.name}: Malformed YAML`);
        }
    }

    console.log(`\n--- Audit Results ---`);
    console.log(`Total YAMLs: ${total}`);
    console.log(`Valid Schema: ${valid}`);
    console.log(`Compliance: ${((valid / total) * 100).toFixed(1)}%`);
    
    if (errors.length > 0) {
        console.log(`\n--- Violations (${errors.length}) ---`);
        // Show first 10 violations
        console.log(errors.slice(0, 10).join('\n'));
        if (errors.length > 10) console.log(`... and ${errors.length - 10} more.`);
    }
}

main();
