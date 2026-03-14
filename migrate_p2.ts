const filesToMigrate = [
  { p: "src/03/GATE.ts", out: "src/ontology/l32_gate/gate.md", level: 3 },
  { p: "src/03/GATE_VALIDATOR.ts", out: "src/ontology/l32_gate/gate_validator.md", level: 3 },
  { p: "src/03/GATE_MERGER.ts", out: "src/ontology/l32_gate/gate_merger.md", level: 3 },
  { p: "src/03/ATOMIC_LEDGER.ts", out: "src/ontology/l32_gate/atomic_ledger.md", level: 3 },
  { p: "src/03/GATE_LEDGER.ts", out: "src/ontology/l32_gate/gate_ledger.md", level: 3 },
  { p: "src/03/GENETIC_LEDGER.ts", out: "src/ontology/l32_gate/genetic_ledger.md", level: 3 },
  { p: "src/00/ledger_chain.ts", out: "src/ontology/l32_gate/ledger_chain.md", level: 0 },
  { p: "src/00/checkpoint_chain.ts", out: "src/ontology/l32_gate/checkpoint_chain.md", level: 0 }
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
