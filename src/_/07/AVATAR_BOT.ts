// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/avatar_bot.md
import { LOGGER, Le, Li, Lw } from "@g06";

// OMEGA-64 | avatar_bot.ts | Stage 38 Demonstration

const PROXY_URL = "http://localhost:8080";
const AVATAR_ID = 9999; // Assume an atom seeded with this ID

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAvatar() {
  Li(`[AVATAR] Waking up Avatar ID: ${AVATAR_ID}`);

  while (true) {
    try {
      // 1. SENSE Environment
      const res = await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}`);
      if (!res.ok) {
        Lw(
          "[AVATAR] Cannot reach Proxy or Avatar is dead. Waiting...",
        );
        await sleep(2000);
        continue;
      }

      const data = await res.json();
      const me = data.self;
      const st = data.sensory_tensor;

      Li(
        `[AVATAR] Pos: (${me.x}, ${me.y}) | Energy: ${
          Math.floor(me.energy)
        } | Trophic: [${st.trophic.map((v: number) => v.toFixed(2)).join(",")}]`,
      );

      // 2. DECIDE (Heuristic Policy based on Gradients)
      let action = "MOVE";
      let dx = 0;
      let dy = 0;
      let targetIdx = 0;

      // 2a. Avoid Threats (Quadrant Logic)
      if (st.threat[0] > 0.3) dy = 1; // Threat North -> Move South
      else if (st.threat[2] > 0.3) dy = -1; // Threat South -> Move North
      
      if (st.threat[3] > 0.3) dx = 1; // Threat West -> Move East
      else if (st.threat[1] > 0.3) dx = -1; // Threat East -> Move West

      // 2b. If no immediate threat, chase food
      if (dx === 0 && dy === 0) {
        if (st.trophic[0] > 0.1) dy = -1; // Food North
        else if (st.trophic[2] > 0.1) dy = 1; // Food South
        
        if (st.trophic[3] > 0.1) dx = -1; // Food West
        else if (st.trophic[1] > 0.1) dx = 1; // Food East
      }

      // 2c. Random wander if still stuck
      if (dx === 0 && dy === 0) {
        dx = Math.random() > 0.5 ? 1 : -1;
        dy = Math.random() > 0.5 ? 1 : -1;
      }

      // 3. ACT
      await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, dx, dy, targetIdx, amount: 100 }),
      });
    } catch (e: any) {
      Le("[AVATAR] Network error:", e.message);
    }

    // Tick delay (Assuming matrix ticks at 10 TPS, we query every 500ms so we don't spam, acting at 2 TPS)
    await sleep(500);
  }
}

if (import.meta.main) {
  runAvatar();
}
