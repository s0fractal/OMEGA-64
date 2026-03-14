import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const findNewPath = (basename: string) => {
  for (const dirEntry of Deno.readDirSync("src/_")) {
    if (dirEntry.isDirectory) {
      try {
        for (const f of Deno.readDirSync("src/_/" + dirEntry.name)) {
          if (f.isFile && f.name === basename) {
            return "../_/" + dirEntry.name + "/" + f.name;
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

    // e.g. export * from "./GATE_LEDGER.ts";
    // or export { foo } from "@03/PULSE.ts";
    const regex = /(from\s*|import\s*['"])"?(?:\.\/|@\d{2}\/)?([A-Za-z0-9_]+)\.ts"/g;
    
    content = content.replace(regex, (match, prefix, basename) => {
      // Check if original exists
      const folder = entry.path.split("/").slice(0, -1).join("/");
      try {
        Deno.statSync(`${folder}/${basename}.ts`);
        return match; // exists, keep it
      } catch (e) {
        // Doesn't exist
        const newPath = findNewPath(basename + ".ts");
        if (newPath) {
          changed = true;
          return `${prefix}"${newPath}"`;
        }
        return match;
      }
    });

    if (changed) {
      Deno.writeTextFileSync(entry.path, content);
      console.log("Updated paths in", entry.path);
    }
  }
}
