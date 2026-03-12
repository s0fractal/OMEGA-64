import { walk } from "jsr:@std/fs";
import { assert } from "jsr:@std/assert";

const LAYERS = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06"
];

Deno.test("topology: architecture guard - strict acyclic descent", async () => {
  const IMPORT_REGEX = /from\s+["']@(\d{2})["']/g;

  for (let i = 0; i < LAYERS.length; i++) {
    const layer = LAYERS[i];
    const allowed = LAYERS.slice(0, i + 1); // Layer can import itself and anything below it

    for await (const entry of walk(layer, { exts: [".ts"] })) {
      const content = await Deno.readTextFile(entry.path);
      let match;
      while ((match = IMPORT_REGEX.exec(content)) !== null) {
        const targetLayer = match[1];
        if (!allowed.includes(targetLayer)) {
          throw new Error(`Topological Breach! ${entry.path} is importing from ${targetLayer}. A layer may only import from layers at or below its own level.`);
        }
      }
    }
  }
});