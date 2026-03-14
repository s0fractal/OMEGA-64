import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

for await (const entry of walk("src/ontology", { exts: [".md"] })) {
  if (entry.isFile) {
    let content = Deno.readTextFileSync(entry.path);
    let changed = false;

    // Match @03/GATE.ts
    const regex = /"@(\d{2})\/([A-Za-z0-9_]+)\.ts"/g;
    content = content.replace(regex, (match, folder, basename) => {
      // Check in src/_/ first
      try {
        Deno.statSync(`src/_/${folder}/${basename}.ts`);
        changed = true;
        return `"../${folder}/${basename}.ts"`;
      } catch (e) {
        // Doesn't exist in _, check in src/
        try {
          Deno.statSync(`src/${folder}/${basename}.ts`);
          changed = true;
          return `"../../${folder}/${basename}.ts"`;
        } catch (e2) {
          return match;
        }
      }
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Fixed alias imports in", entry.path);
    }
  }
}
