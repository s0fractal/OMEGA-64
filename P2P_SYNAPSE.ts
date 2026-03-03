const PORT = 8081;
const ROOT = "./";

console.log(
  `🛸 P2P Synapse Membrane open on port ${PORT}... Listening for Alien Atoms.`,
);

async function handler(req: Request): Promise<Response> {
  if (req.method === "POST" && new URL(req.url).pathname === "/mutate") {
    try {
      const alienData = await req.json();
      const alienId = alienData.eigenvalue || `0xALIEN${Date.now()}`;
      const filename = `${ROOT}/${alienId}.ALIEN.md`;

      const content = `---
eigenvalue: '${alienId}'
symbol: '${alienData.symbol || "ALIEN"}'
energy: ${alienData.energy || 100}
resonance: ${alienData.resonance || 0}
logic: '${alienData.logic || "00000000"}'
thought: '${alienData.thought || "UNKNOWN"}'
desc: '${alienData.desc || "Migrated from an external dimension."}'
---

<div class="alien-payload">
  System intrusion detected from external origin. This atom represents an alien logic state materialized via P2P Synapse.
</div>
`;
      await Deno.writeTextFile(filename, content);
      console.log(
        `   [P2P] 🛸 ALIEN ATOM MATERIALIZED: ${filename} (Logic: ${alienData.logic})`,
      );
      return new Response(
        JSON.stringify({ status: "MUTATION_ACCEPTED", target: filename }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (e) {
      console.error("   [P2P] ⚠️ Failed to parse alien logic.", e);
      return new Response("MUTATION_REJECTED", { status: 400 });
    }
  }
  return new Response("OMEGA-64 P2P Membrane Active.", { status: 200 });
}

Deno.serve({ port: PORT }, handler);
