import { assertEquals } from "https://deno.land/std@0.212.0/assert/mod.ts";
import { SwarmNexus } from "../04_noosphere/mod.ts";

Deno.test("Mainnet Bootstrap: Hub Discovery and WebSocket Fallback", async () => {
  // 1. Spawn BOOTSTRAP_HUB as an autonomous process
  const hubProcess = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "network/BOOTSTRAP_HUB.ts", "--port", "9999"],
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();

  // Give Hub 500ms to boot up and listen natively
  await new Promise((r) => setTimeout(r, 500));

  let receivedPayload: Uint8Array | null = null;
  let resolveReceipt: () => void;
  const receiptPromise = new Promise<void>((resolve) => {
    resolveReceipt = resolve;
  });

  // 2. Setup Independent Nodes (0 initial seed connections)
  const nexusA = new SwarmNexus({
    instanceId: 3001,
    seedNodes: [],
    mainnetEnabled: true,
    bootstrapHubUrl: "ws://127.0.0.1:9999",
  });

  const nexusB = new SwarmNexus({
    instanceId: 3002,
    seedNodes: [],
    mainnetEnabled: true,
    bootstrapHubUrl: "ws://127.0.0.1:9999",
  });

  const nexusC = new SwarmNexus({
    instanceId: 3003,
    seedNodes: [],
    mainnetEnabled: true,
    bootstrapHubUrl: "ws://127.0.0.1:9999",
  });

  nexusC.onAtomTransit = (payload: Uint8Array) => {
    receivedPayload = payload;
    resolveReceipt();
  };

  try {
    // 3. Boot Nexuses
    nexusA.start();
    await new Promise((r) => setTimeout(r, 100)); // Node A registers

    nexusB.start();
    nexusC.start();

    // Give the network 1200ms to register with Hub, receive PEER_LIST, and cross-connect
    await new Promise((r) => setTimeout(r, 1200));

    // Asserts: Node B and C discovered each other through Hub
    assertEquals(
      nexusB.connectedPeers.size > 0,
      true,
      "Node B should have discovered peers via Hub",
    );
    assertEquals(
      nexusC.connectedPeers.size > 0,
      true,
      "Node C should have discovered peers via Hub",
    );

    // 4. Fire Transit
    const egressFakePayload = new Uint8Array(256);
    egressFakePayload.fill(0xBB);
    egressFakePayload[0] = 0x88;

    // B routes atom
    // Given routeAtom picks a random peer natively, we will blast it a few times to ensure it hits C.
    for (let i = 0; i < 15; i++) {
      nexusB.routeAtom(egressFakePayload);
    }

    // Await Target Nexus node decoding procedure
    let timerId: number | undefined;
    const timeout = new Promise((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error("Timeout waiting for Atom")),
        2000,
      );
    });
    await Promise.race([receiptPromise, timeout]);
    if (timerId) clearTimeout(timerId);

    // Asserts: Structural Payload consistency checked
    assertEquals(
      receivedPayload !== null,
      true,
      "Payload should be populated upon Network Receipt over Hub-discovered link",
    );
    assertEquals(
      receivedPayload!.length,
      256,
      "Should decode exactly 256 payload bytes from transit",
    );
    assertEquals(receivedPayload![0], 0x88, "Head byte should map correctly");
    assertEquals(
      receivedPayload![255],
      0xBB,
      "Tail byte should maintain identical block alignment across transmission",
    );
  } finally {
    // Reclaim Global states
    nexusA.stop();
    nexusB.stop();
    nexusC.stop();
    try {
      hubProcess.kill("SIGTERM");
      await hubProcess.status;
    } catch (e) {}
  }
});
