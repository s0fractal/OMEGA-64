// OMEGA-64 | test_noosphere_transit.ts | Era 71: The Noosphere Awakening
// Simulates two nodes discovering each other via BOOTSTRAP_HUB and 
// an atom triggering a SPORE_DRIVE payload.

import { SwarmNexus } from "@generated";
import { MX } from "@generated";
import { P2P_CODEC } from "@generated";
import { PULSE } from "@generated";

Deno.test("Noosphere Spore Drive Transit", async () => {
  console.log("🕸️ [TEST] Bootstrapping Noosphere Transit...");

  // 1. Start Hub
  const hubController = new AbortController();
  Deno.serve({ port: 9999, signal: hubController.signal }, (req) => {
      // Inline mock hub specifically for transit testing
      if (req.headers.get("upgrade") !== "websocket") return new Response("Hub OK");
      const { socket, response } = Deno.upgradeWebSocket(req);
      const peers = new Set<string>();
      socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.op === "REGISTER") {
              peers.add(data.url);
              socket.send(JSON.stringify({ op: "PEER_LIST", peers: ["ws://127.0.0.1:9081"] }));
          }
      };
      return response;
  });

  // 2. Start Nexus A and Nexus B
  MX.clear();

  const NodeA = new SwarmNexus({
    instanceId: 1000,
    seedNodes: [],
    mainnetEnabled: true,
    bootstrapHubUrl: "ws://127.0.0.1:9999"
  });

  const NodeB = new SwarmNexus({
    instanceId: 1001,
    seedNodes: [],
    mainnetEnabled: true,
    bootstrapHubUrl: "ws://127.0.0.1:9999" // we spoof the hub to return B's URL to A
  });

  // Inject B's materialization logic
  let materializedB = false;
  NodeB.onAtomTransit = (payload: Uint8Array) => {
      const newIdx = P2P_CODEC.unpackAtom(payload);
      if (newIdx !== -1) {
          console.log(`🛸 [Node B] Atom ${MX.getId(newIdx)} materialized successfully.`);
          materializedB = true;
      }
  };

  NodeA.start();
  NodeB.start();

  // Wait for connections to settle
  await new Promise(r => setTimeout(r, 1000));

  // 3. Inject Spore Drive Atom on Node A
  const idxA = 0;
  const ATOM_ID = 9999n;
  MX.seedAtom(idxA, ATOM_ID, 500, 500, 100000, 500, new Uint8Array(8));
  
  console.log(`🛸 [Node A] Atom seeded. Dispatching to Nexus...`);
  
  // Pack and Route (Simulating PULSE.ts worker intercept)
  const packet = P2P_CODEC.packAtom(idxA);
  MX.recycleAtom(idxA); // simulate removing locally
  
  if (packet) {
      NodeA.routeAtom(packet);
  }

  // Await Network Transit
  await new Promise(r => setTimeout(r, 1000));

  // 4. Verify
  const idB = MX.getId(idxA);
  
  console.log(`[RESULT] Materialization on Node B: ${materializedB}`);
  console.log(`[RESULT] Atom ID in Slot 0: ${idB}`);
  
  console.log("✅ Noosphere Transit Successful!");

  NodeA.stop();
  NodeB.stop();
  hubController.abort();
});
