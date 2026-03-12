/**
 * [e/GEN_SCHEMA.ts]
 * Generates a JSON Schema from the Zod Schema.
 * Used for VSCode IntelliSense in YAML files.
 */

import { z } from "npm:zod";
import { zodToJsonSchema } from "npm:zod-to-json-schema";
import { Atom } from "../4/0/SCHEMA/_.ts";

const jsonSchema = zodToJsonSchema(Atom, "OmegaAtom");

await Deno.writeTextFile(
  "omega.schema.json",
  JSON.stringify(jsonSchema, null, 2),
);

console.log("Generated omega.schema.json");
console.log("Add this to .vscode/settings.json:");
console.log(`
"yaml.schemas": {
    "./omega.schema.json": [
        "0/*/*/_.yaml",
        "1/*/*/_.yaml",
        "2/*/*/_.yaml",
        "3/*/*/_.yaml",
        "4/*/*/_.yaml",
        "5/*/*/_.yaml",
        "6/*/*/_.yaml",
        "7/*/*/_.yaml",
        "8/*/*/_.yaml"
    ]
}
`);
