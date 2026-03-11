// OMEGA-64 | avatar_bot.ts | Stage 38 Demonstration
import { LOGGER } from "../00_substrate/mod.ts";

const PROXY_URL = "http://localhost:8080";
const AVATAR_ID = 9999; // Assume an atom seeded with this ID

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAvatar() {
  LOGGER.info(`[AVATAR] Waking up Avatar ID: ${AVATAR_ID}`);

  while (true) {
    try {
      // 1. SENSE Environment
      const res = await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}`);
      if (!res.ok) {
        LOGGER.warn(
          "[AVATAR] Cannot reach Proxy or Avatar is dead. Waiting...",
        );
        await sleep(2000);
        continue;
      }

      const data = await res.json();
      const me = data.self;
      const vision = data.vision;

      LOGGER.info(
        `[AVATAR] Pos: (${me.x}, ${me.y}) | Energy: ${
          Math.floor(me.energy)
        } | Seeing ${vision.length} entities.`,
      );

      // 2. DECIDE (Simulated LLM Policy: Move towards nearest PREY/PRODUCER to eat, or random wander)
      let action = "MOVE";
      let dx = Math.random() > 0.5 ? 1 : -1;
      let dy = Math.random() > 0.5 ? 1 : -1;
      let targetIdx = 0;

      if (vision.length > 0) {
        // Find nearest food (Role 1=Producer, Role 0=Prey)
        const food = vision.find((v: any) => v.role === 1 || v.role === 0);
        if (food) {
          if (food.distance <= 15) {
            action = "EAT";
            targetIdx = food.idx;
            LOGGER.info(
              `[AVATAR] DECISION: EAT target ${targetIdx} at Dist ${
                Math.floor(food.distance)
              }`,
            );
          } else {
            // Move towards food
            dx = Math.sign(food.dx);
            dy = Math.sign(food.dy);
            LOGGER.info(`[AVATAR] DECISION: CHASE target ${food.idx}`);
          }
        }
      }

      // 3. ACT
      await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, dx, dy, targetIdx, amount: 100 }),
      });
    } catch (e: any) {
      LOGGER.error("[AVATAR] Network error:", e.message);
    }

    // Tick delay (Assuming matrix ticks at 10 TPS, we query every 500ms so we don't spam, acting at 2 TPS)
    await sleep(500);
  }
}

if (import.meta.main) {
  runAvatar();
}
