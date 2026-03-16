import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { SwarmNexus, P2P_CODEC, MX } from "@generated";

Deno.test({
  name: "P2P Transit: Nexus A routes Atom to Nexus B",
  async fn() {
    // 1. Setup two Nexus nodes
    const nexusA = new SwarmNexus({ instanceId: 10, seedNodes: [] });
    const nexusB = new SwarmNexus({ instanceId: 11, seedNodes: ["ws://127.0.0.1:8090"] });

    // Node A will listen on 8090, Node B will connect to it
    nexusA.start();
    nexusB.start();

    // 2. Wait for handshake
    let connected = false;
    for (let i = 0; i < 50; i++) {
      if (nexusA.connectedPeers.size > 0 && nexusB.connectedPeers.size > 0) {
        connected = true;
        break;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    
    try {
      assertEquals(connected, true, "Nodes failed to connect");

      // 3. Prepare an atom to transit
      // We need a mock MX or just use the current one if it's safe
      const mockAtomIdx = 5;
      MX.seedAtom(mockAtomIdx, 12345n, 100, 200, 1.0, 50, new Uint8Array(8).fill(7));
      
      const egressPacket = P2P_CODEC.packAtom(mockAtomIdx);

      // 4. Setup ingress listener on Node B
      let receivedAtom: Uint8Array | null = null;
      nexusB.onAtomTransit = (payload) => {
        receivedAtom = payload;
      };

      // 5. Route from A to B
      nexusA.routeAtom(egressPacket);

      // 6. Wait for arrival
      for (let i = 0; i < 20; i++) {
        if (receivedAtom) break;
        await new Promise(r => setTimeout(r, 100));
      }

      assertEquals(receivedAtom !== null, true, "Atom failed to arrive at Node B");
      
      // 7. Unpack and verify
      const ingressIdx = P2P_CODEC.unpackAtom(receivedAtom!);
      assertEquals(MX.getId(ingressIdx), 12345n);
      assertEquals(MX.getX(ingressIdx), 100);
      assertEquals(MX.getY(ingressIdx), 200);
      assertEquals(MX.getResonance(ingressIdx), 50);

    } finally {
      nexusA.stop();
      nexusB.stop();
    }
  }
});
