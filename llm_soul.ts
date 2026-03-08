// OMEGA-64 | llm_soul.ts | Stage 39 Gemini External Brain
import { LOGGER } from "./LOGGER.ts";

const PROXY_URL = "http://localhost:8080";
const AVATAR_ID = 9999;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  LOGGER.error("GEMINI_API_KEY environment variable is missing.");
  Deno.exit(1);
}

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  `You are a biological atom named "Avatar" (ID 9999) surviving in a 2D Artificial Life matrix (the OMEGA-64 Sandbox).
Your goal is to survive as long as possible. Your energy slowly drains over time.

GRID: 1400x800

ROLES: 
- 0: Prey (Neutral). They are food. Chase them.
- 1: Producer. They are background vegetation.
- 2: Guardian (Your Role). 
- 4: Predator (Parasite). They want to eat you. RUN AWAY from them!

You will receive your current state and a "vision" array showing nearby entities.
Vision entities have "dx" and "dy" which are relative to you. (e.g. if dx is 20, the entity is 20 pixels to your Right).
Distance is Euclidean distance.

AVAILABLE ACTIONS (You must pick ONE per turn):
1. MOVE: Requires you to specify a direction vector. dx can be -1, 0, or 1. dy can be -1, 0, or 1. (Speed is 10 pixels per move).
2. EAT: Requires "targetIdx" of an entity that is very close (distance < 20).
3. YIELD: Do nothing, just rest.

OUTPUT FORMAT:
You MUST output ONLY a valid JSON object representing your action. No markdown formatting, no explanations. 
Examples:
{"action": "MOVE", "dx": -1, "dy": 1}
{"action": "EAT", "targetIdx": 105}
{"action": "YIELD"}
`;

async function queryGemini(state: any, vision: any[]): Promise<any> {
  const prompt = `Current State:\nPosition: (${state.x}, ${state.y})\nEnergy: ${
    Math.floor(state.energy)
  }\n\nVision (sorted by distance):\n${
    JSON.stringify(vision, null, 2)
  }\n\nWhat is your action? Output ONLY JSON.`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: {
      temperature: 0.2,
    },
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) throw new Error("Empty response from Gemini");

    // Cleanup potential markdown fences
    const cleanText = textResponse.replace(/```json/g, "").replace(/```/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (e: any) {
    LOGGER.error(`[LLM_SOUL] Failed to query LLM: ${e.message}`);
    // Fallback to random wander if API fails
    return {
      action: "MOVE",
      dx: Math.random() > 0.5 ? 1 : -1,
      dy: Math.random() > 0.5 ? 1 : -1,
    };
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSoul() {
  LOGGER.info(`[LLM_SOUL] Booting AI Soul for Avatar ${AVATAR_ID}...`);

  while (true) {
    try {
      // 1. SENSE Environment
      const res = await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}`);
      if (!res.ok) {
        LOGGER.warn("[LLM_SOUL] Cannot reach Matrix Proxy. Waiting...");
        await sleep(2000);
        continue;
      }

      const data = await res.json();
      const me = data.self;
      // Filter out producers to save tokens, only care about predators (4) and prey (0)
      const vision = data.vision.filter((v: any) =>
        v.role === 0 || v.role === 4
      ).slice(0, 10); // Max 10 entities

      LOGGER.info(
        `[LLM_SOUL] Energy: ${
          Math.floor(me.energy)
        } | Seeing ${vision.length} threats/food.`,
      );

      // 2. COGNITION
      LOGGER.debug("[LLM_SOUL] Querying Gemini...");
      const intent = await queryGemini(me, vision);

      LOGGER.info(`[LLM_SOUL] DECISION -> ${JSON.stringify(intent)}`);

      // 3. ACT
      await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}/act`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intent),
      });
    } catch (e: any) {
      LOGGER.error("[LLM_SOUL] Loop error:", e.message);
    }

    // Call LLM every 2.5 seconds to avoid extreme rate limits and give the matrix time to advance
    await sleep(2500);
  }
}

if (import.meta.main) {
  runSoul();
}
