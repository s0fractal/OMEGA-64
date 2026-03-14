import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

const testFiles = [];
for await (const entry of walk("src", { exts: [".ts"], skip: [/src\/_\//, /src\/ontology\//] })) {
  if (entry.isFile && (entry.name.startsWith("test_") || entry.name.endsWith("_guard.ts") || entry.name.endsWith("_runtime.ts") || entry.name.endsWith("_contract.ts"))) {
    testFiles.push(entry.path);
  }
}

const findNewPath = (basename: string) => {
  for (const dirEntry of Deno.readDirSync("src/_")) {
    if (dirEntry.isDirectory) {
      try {
        for (const f of Deno.readDirSync("src/_/" + dirEntry.name)) {
          if (f.isFile && f.name === basename) {
            return "src/_/" + dirEntry.name + "/" + f.name;
          }
        }
      } catch (e) {}
    }
  }
  return null;
}

for (const tf of testFiles) {
  let content = Deno.readTextFileSync(tf);
  let changed = false;

  const regex = /"src\/\d{2}\/([a-zA-Z0-9_]+)\.ts"/g;
  content = content.replace(regex, (match, basename) => {
    // Check if original exists
    try {
      Deno.statSync(match.substring(1, match.length - 1));
      return match; // exists, keep it
    } catch (e) {
      // Doesn't exist, search in src/_/
      const newPath = findNewPath(basename + ".ts");
      if (newPath) {
        changed = true;
        return '"' + newPath + '"';
      }
      return match;
    }
  });

  if (changed) {
    Deno.writeTextFileSync(tf, content);
    console.log("Updated paths in", tf);
  }
}
