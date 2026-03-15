// test_hologram.ts
// Verification of Era 3.0: The Holographic Face

import { LOOP_LOOP as LOOP } from "@generated";
import { StandardWebSocketClient } from "websocket";

console.log("🎭 TEST HOLOGRAM: Initializing...");

// 1. Ignite the Loop (Headless)
// This starts NERVE on port 8081
LOOP.ignite({ maxTicks: 50, port: 8081 });

// 2. Connect as Client (Simulating Browser)
setTimeout(() => {
  console.log("🔌 CLIENT: Connecting to NERVE...");
  try {
    const ws = new StandardWebSocketClient("ws://localhost:8081");

    ws.on("open", () => {
      console.log("👁️ CLIENT: Connected!");
    });

    ws.on("message", (data: any) => {
      const msg = JSON.parse(data.data);
      if (msg.type === "HOLOGRAM") {
        console.log(
          `🎨 CLIENT: Received Hologram Frame [TICK ${msg.data.tick}]`,
        );
        // Validate structure
        if (msg.data.width === 8 && msg.data.cells) {
          console.log(`✅ FRAME VALID: ${msg.data.cells.length} active cells.`);
          ws.close();
          Deno.exit(0);
        }
      }
    });

    // Simulate Touch
    setTimeout(() => {
      console.log("👆 CLIENT: Sending Simulated Touch...");
      ws.send(JSON.stringify({
        type: "TOUCH",
        payload: { idx: 36, x: 4, y: 4, intent: "TEST" },
      }));
    }, 1000);
  } catch (e) {
    console.error("❌ CLIENT ERROR:", e);
    Deno.exit(1);
  }
}, 2000); // Wait for Loop/Nerve to start
