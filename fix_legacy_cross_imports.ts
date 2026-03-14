import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const findNewPath = (basename: string) => {
  if (basename === "mod.ts") return null;
  for (const dirEntry of Deno.readDirSync("src/_")) {
    if (dirEntry.isDirectory) {
      try {
        for (const f of Deno.readDirSync("src/_/" + dirEntry.name)) {
          if (f.isFile && f.name === basename && f.name !== "mod.ts") {
            return { folder: dirEntry.name, basename };
          }
        }
      } catch (e) {}
    }
  }
  return null;
}

for await (const entry of walk("src", { exts: [".ts"] })) {
  if (entry.isFile && !entry.path.includes("src/_") && !entry.path.includes("src/ontology")) {
    let content = Deno.readTextFileSync(entry.path);
    let changed = false;

    // Matches from "../00/STATE_MATRIX.ts" or "./GATE.ts" or "../../03/FOO.ts" or "@03/FOO.ts"
    const regex = /(from\s*|import\s*['"])(["'])([^"']*\/)?([A-Za-z0-9_]+)\.ts(["'])/g;
    
    content = content.replace(regex, (match, prefix, q1, pathPrefix, basename, q2) => {
      // Is it a file we migrated?
      const migratedTo = findNewPath(basename + ".ts");
      if (migratedTo) {
        // Calculate relative depth from Current File to `src/`
        // e.g. "src/06/AGENT_PROXY.ts" -> path elements = 3. Depth = 1.
        // "src/03/03/test.ts" -> 4 elements. Depth = 2.
        const pathParts = entry.path.replace(/\\/g, "/").split("/");
        const depth = pathParts.length - 2; 
        
        let up = "";
        for(let i=0; i<depth; i++) up += "../";
        
        // If depth happens to be 0 (e.g. src/root.ts), up is "", so `_/...` which is correct from `src/`.
        const newPath = `${up}_/${migratedTo.folder}/${basename}.ts`;
        const replacement = `${prefix}${q1}${newPath}${q2}`;
        if (replacement !== match) {
           changed = true;
           return replacement;
        }
      }
      return match;
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Updated cross exports in", entry.path);
    }
  }
}
