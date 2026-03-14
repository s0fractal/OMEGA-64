import { walk } from "jsr:@std/fs";

for await (const entry of walk("./src", { exts: [".ts", ".md"] })) {
  let text = await Deno.readTextFile(entry.path);
  let changed = false;

  const replacements = [
    { from: /from "\.\.\/02\/PULSE\.ts"/g, to: 'from "../05/PULSE.ts"' },
    { from: /from "\.\.\/_\/02\/PULSE\.ts"/g, to: 'from "../_/05/PULSE.ts"' },
    { from: /import\("@02\/PULSE\.ts"\)/g, to: 'import("../../_/05/PULSE.ts")' },
    { from: /"src\/02\/PULSE\.ts"/g, to: '"src/_/05/PULSE.ts"' },
    { from: /"src\/02\/PULSE_WORKER\.ts"/g, to: '"src/_/05/PULSE_WORKER.ts"' },
    { from: /extractVector\("\.\/02\/PULSE\.ts"\)/g, to: 'extractVector("./05/PULSE.ts")' }
  ];

  for (const { from, to } of replacements) {
    if (from.test(text)) {
      text = text.replace(from, to);
      changed = true;
    }
  }

  if (changed) {
    console.log(`Updated ${entry.path}`);
    await Deno.writeTextFile(entry.path, text);
  }
}
