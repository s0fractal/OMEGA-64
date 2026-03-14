import { walkSync } from "https://deno.land/std@0.224.0/fs/walk.ts";

const dir = new URL("./src/ontology", import.meta.url).pathname;

let updated = 0;
for (const entry of walkSync(dir, { exts: [".md"], includeDirs: false })) {
  const content = Deno.readTextFileSync(entry.path);
  if (content.includes("GRID_METRICS")) {
    const newContent = content.replace(/\bGRID_METRICS\b/g, "SYSTEM_CONSTANTS");
    Deno.writeTextFileSync(entry.path, newContent);
    updated++;
  }
}
console.log(`Updated ${updated} markdown files replacing GRID_METRICS with SYSTEM_CONSTANTS.`);
