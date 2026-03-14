const filesToMigrate = [
  { p: "src/06/TUI_DASHBOARD.ts", out: "src/ontology/telemetry/tui_dashboard.md", level: 6 },
  { p: "src/06/SERVE_DASHBOARD.ts", out: "src/ontology/telemetry/serve_dashboard.md", level: 6 },
  { p: "src/06/GLYPH_TELEMETRY.ts", out: "src/ontology/telemetry/glyph_telemetry.md", level: 6 },
  { p: "src/06/MUTATION_TELEMETRY.ts", out: "src/ontology/telemetry/mutation_telemetry.md", level: 6 }
];

for (const f of filesToMigrate) {
  try {
    const content = new TextDecoder().decode(Deno.readFileSync(f.p));
    const idName = f.p.split("/").pop()!.replace(".ts", ""); 
    const md = `---
id: ${idName}
type: module
description: "Implementation of ${idName}"
tags: []
min_level: ${f.level}
---

### TypeScript
\`\`\`typescript
${content}
\`\`\`
`;
    Deno.mkdirSync(f.out.substring(0, f.out.lastIndexOf("/")), { recursive: true });
    Deno.writeFileSync(f.out, new TextEncoder().encode(md));
    Deno.removeSync(f.p);
    console.log(`Migrated ${f.p} -> ${f.out}`);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      console.warn(`File not found: ${f.p}`);
    } else {
      console.error(`Skipping ${f.p} (Error: ${err.message})`);
    }
  }
}
