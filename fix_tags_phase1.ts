const paths = [
  "src/ontology/memory/state_matrix.md",
  "src/ontology/memory/atom_access.md",
  "src/ontology/memory/memory_views.md",
  "src/ontology/memory/state_snapshot.md",
  "src/ontology/host/env_parse.md",
  "src/ontology/core/pulse_orchestrator.md",
  "src/ontology/core/pulse_worker.md",
  "src/ontology/core/breath_cycle.md",
  "src/ontology/core/omega_daemon.md"
];

for (const p of paths) {
  try {
    const text = new TextDecoder().decode(Deno.readFileSync(p));
    const fixed = text.replace('tags: ["host"]', 'tags: []');
    Deno.writeFileSync(p, new TextEncoder().encode(fixed));
    console.log(`Fixed tags in ${p}`);
  } catch(e) {
    console.log(`Failed on ${p}: ${e}`);
  }
}
