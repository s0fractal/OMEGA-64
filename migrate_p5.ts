const filesToMigrate = [
  { p: "src/04/SWARM_NEXUS.ts", out: "src/ontology/swarm/swarm_nexus.md", level: 4 },
  { p: "src/04/SWARM_NODE.ts", out: "src/ontology/swarm/swarm_node.md", level: 4 },
  { p: "src/04/P2P_FEDERATION.ts", out: "src/ontology/swarm/federation.md", level: 4 },
  { p: "src/04/P2P_CODEC.ts", out: "src/ontology/swarm/p2p_codec.md", level: 4 }
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
