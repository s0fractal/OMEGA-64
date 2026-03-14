import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

for await (const entry of walk("src/ontology", { exts: [".md"] })) {
  if (entry.isFile) {
    let content = Deno.readTextFileSync(entry.path);
    let changed = false;

    // Matches e.g. ../00/PRNG.ts or ../../04/P2P_CODEC.ts
    const regex = /(["'])(?:(?:\.\.\/)+)(\d{2})\/([A-Za-z0-9_]+)\.ts(["'])/g;
    content = content.replace(regex, (match, q1, folder, basename, q2) => {
      // Check in src/_/ first
      try {
        Deno.statSync(`src/_/${folder}/${basename}.ts`);
        const newStr = `${q1}../${folder}/${basename}.ts${q2}`;
        if (match !== newStr) changed = true;
        return newStr;
      } catch (e) {
        // Doesn't exist in _, check in src/
        try {
          Deno.statSync(`src/${folder}/${basename}.ts`);
          const newStr = `${q1}../../${folder}/${basename}.ts${q2}`;
          if (match !== newStr) changed = true;
          return newStr;
        } catch (e2) {
          return match;
        }
      }
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Fixed relative imports in", entry.path);
    }
  }
}
