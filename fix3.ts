import { walk } from "jsr:@std/fs";

for await (const entry of walk("./src", { exts: [".ts", ".md"] })) {
  let text = await Deno.readTextFile(entry.path);
  let originalText = text;

  text = text.replaceAll('from "../02/PULSE.ts"', 'from "../05/PULSE.ts"');
  text = text.replaceAll('from "../_/02/PULSE.ts"', 'from "../_/05/PULSE.ts"');
  text = text.replaceAll('import("@02/PULSE.ts")', 'import("../../_/05/PULSE.ts")');
  text = text.replaceAll('"src/02/PULSE.ts"', '"src/_/05/PULSE.ts"');
  text = text.replaceAll('"src/02/PULSE_WORKER.ts"', '"src/_/05/PULSE_WORKER.ts"');
  text = text.replaceAll('extractVector("./02/PULSE.ts")', 'extractVector("./05/PULSE.ts")');

  if (text !== originalText) {
    console.log(`Updated ${entry.path}`);
    await Deno.writeTextFile(entry.path, text);
  }
}
