/**
 * [e/GEN_SCHEMA.ts]
 * Generates a JSON Schema from the Zod Schema.
 * Used for VSCode IntelliSense in YAML files.
 */

import { z } from "npm:zod";
import { zodToJsonSchema } from "npm:zod-to-json-schema";
import { Atom } from "../i/i.L32.core.SCHEMA.ts";

const jsonSchema = zodToJsonSchema(Atom, "OmegaAtom");

await Deno.writeTextFile("omega.schema.json", JSON.stringify(jsonSchema, null, 2));

console.log("Generated omega.schema.json");
console.log("Add this to .vscode/settings.json:");
console.log(`
"yaml.schemas": {
    "./omega.schema.json": "i/*.yaml"
}
`);
