import { walk } from "jsr:@std/fs";

for await (const entry of walk("./src", { exts: [".ts", ".md"] })) {
  let text = await Deno.readTextFile(entry.path);
  let originalText = text;

  // Replace imports mapping to deep generation layers with the flat facade root
  text = text.replaceAll('from "../../_/00/mod.ts"', 'from "../../_/mod.ts"');
  text = text.replaceAll('from "../_/00/mod.ts"', 'from "../_/mod.ts"');

  if (text !== originalText) {
    console.log(`Updated ${entry.path}`);
    await Deno.writeTextFile(entry.path, text);
  }
}
