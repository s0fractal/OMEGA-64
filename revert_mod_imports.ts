import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

for await (const entry of walk("src", { exts: [".ts"] })) {
  if (entry.isFile && !entry.path.includes("src/_") && !entry.path.includes("src/ontology")) {
    let content = Deno.readTextFileSync(entry.path);
    let changed = false;

    // Matches `../_/03/mod.ts` or `../../_/03/mod.ts` etc.
    const regex = /(from\s*|import\s*['"])(["'])((?:\.\.\/)+)_\/(\d{2})\/mod\.ts(["'])/g;
    
    content = content.replace(regex, (match, prefix, q1, upFolders, folder, q2) => {
      changed = true;
      // upFolders has exactly one extra `../` because `_` adds a directory level.
      // So if upFolders is `../../`, it should become `../`. If it's `../`, it should become `./`. Wait!
      // If we just replace `_/` with nothing? No, `../../_/03/mod.ts` -> `../../03/mod.ts`.
      // Actually, my earlier script did: `let up="" for (depth) up+="../"`. `newPath = up + "_/" + ...`.
      // So `up` + `_/XX/mod.ts` -> `up` + `XX/mod.ts`.
      // Wait, is it `up` + `XX/mod.ts`?
      // Yes! Because `src/06/AGENT.ts` -> `../03/mod.ts` became `../_/03/mod.ts`.
      // So `../_/03/mod.ts` simply becomes `../03/mod.ts`!!
      
      return `${prefix}${q1}${upFolders}${folder}/mod.ts${q2}`;
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Reverted mod.ts import in", entry.path);
    }
  }
}
