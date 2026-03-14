import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";

for await (const entry of walk("src/ontology", { exts: [".md"] })) {
  if (entry.isFile) {
    let content = Deno.readTextFileSync(entry.path);
    if (content.includes("../_/")) {
      content = content.replace(/\.\.\/_\//g, "../");
      Deno.writeTextFileSync(entry.path, content);
      console.log("Fixed import in", entry.path);
    }
  }
}
