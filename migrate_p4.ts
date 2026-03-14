const filesToMigrate = [
  { p: "src/05/SEMANTIC_MEMBRANE.ts", out: "src/ontology/semantic/semantic_membrane.md", level: 5 },
  { p: "src/05/llm_soul.ts", out: "src/ontology/semantic/llm_soul.md", level: 5 },
  { p: "src/05/AVATAR_ENGINE.ts", out: "src/ontology/semantic/avatar_engine.md", level: 5 },
  { p: "src/05/SOVEREIGN_ORACLE.ts", out: "src/ontology/semantic/sovereign_oracle.md", level: 5 }
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
