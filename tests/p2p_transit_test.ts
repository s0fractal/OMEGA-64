import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { SwarmNexus } from "../04_noosphere/mod.ts";

Deno.test("P2P Transit: Nexus A routes Atom to Nexus B", async () => {
  let receivedPayload: Uint8Array | null = null;

  let resolveReceipt: () => void;
  const receiptPromise = new Promise<void>((resolve) => {
    resolveReceipt = resolve;
  });

  const nexusA = new SwarmNexus({
    instanceId: 2001, // Calculates to port 10081
    seedNodes: ["ws://127.0.0.1:10082"], // Connecting to B
  });

  const nexusB = new SwarmNexus({
    instanceId: 2002, // Calculates to port 10082
    seedNodes: [],
  });

  nexusB.onAtomTransit = (payload: Uint8Array) => {
    receivedPayload = payload;
    resolveReceipt();
  };

  try {
    // Boot Nexus instances
    nexusB.start();
    nexusA.start();

    // Give WebSockets 150ms to establish Transport connections & Handshake
    await new Promise((r) => setTimeout(r, 150));

    // Construct a deterministically identifiable EgressEvent payload matching 256 boundaries
    const egressFakePayload = new Uint8Array(256);
    egressFakePayload.fill(0xAA);
    egressFakePayload[0] = 0x42;

    // Dispatch onto P2P network plane
    nexusA.routeAtom(egressFakePayload);

    // Await Target Nexus node decoding procedure
    await receiptPromise;

    // Asserts: Structural Payload consistency checked
    assertEquals(
      receivedPayload !== null,
      true,
      "Payload should be populated upon Network Receipt",
    );
    assertEquals(
      receivedPayload!.length,
      256,
      "Should decode exactly 256 payload bytes from transit",
    );
    assertEquals(
      receivedPayload![0],
      0x42,
      "Head byte should map completely across the transit buffer",
    );
    assertEquals(
      receivedPayload![255],
      0xAA,
      "Tail byte should maintain identical block alignment across transmission",
    );
  } finally {
    // Reclaim Global states
    nexusA.stop();
    nexusB.stop();
  }
});
