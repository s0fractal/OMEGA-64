---
id: llm_soul
type: module
description: Implementation of llm_soul
tags: []
entry: true
min_level: 7
vars:
  - LOGGER
  - Ld
  - Le
  - Li
  - Lw
deps:
  - LOGGER
  - TYPES
---

### TypeScript
```typescript
// OMEGA-64 | llm_soul.ts | Stage 39 Gemini External Brain

const PROXY_URL = "http://localhost:8080";
const AVATAR_ID = 9999;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  Le("GEMINI_API_KEY environment variable is missing.");
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

You will receive your current state and a "sensory_tensor" which is a 1-dimensional array of 12 normalized floats.
DECODING THE TENSOR:
Indices [0, 1, 2, 3]: TROPHIC DENSITY (Food/Energy) in directions North, East, South, West.
Indices [4, 5, 6, 7]: THREAT PROXIMITY (Parasites) in directions North, East, South, West.
Indices [8, 9, 10, 11]: SIGNAL INTENSITY (Glyphs) in directions North, East, South, West.

Interpretation: Higher values indicate higher density/intensity/threat in that direction. Values are normalized between 0 and 1.
Example: If tensor[4] > 0.8, there is a severe THREAT to your NORTH. MOVE SOUTH (dy: 1).
Example: If tensor[1] > 0.5, there is FOOD to your EAST. MOVE EAST (dx: 1).

AVAILABLE ACTIONS (Pick ONE per turn):
1. MOVE: Requires you to specify a direction vector. dx can be -1, 0, or 1. dy can be -1, 0, or 1. (Speed is 10 pixels per move).
2. EAT: Requires "targetIdx" of an entity that is very close (distance < 20).
3. YIELD: Do nothing, just rest.

OUTPUT FORMAT:
To conserve API limits, you must formulate a "Macro-Strategy" consisting of EXACTLY 5 sequential actions. 
You MUST output ONLY a valid JSON array of action objects. No markdown formatting, no explanations. 
Example of a valid strategy array:
[
  {"action": "MOVE", "dx": -1, "dy": 1},
  {"action": "MOVE", "dx": -1, "dy": 1},
  {"action": "EAT", "targetIdx": 105},
  {"action": "MOVE", "dx": 0, "dy": 1},
  {"action": "YIELD"}
]
`;

async function queryGemini(state: any, tensor: number[]): Promise<any[]> {
  const prompt = `Current State:
Position: (${state.x}, ${state.y})
Energy: ${Math.floor(state.energy)}

Sensory Tensor (12-D):
${JSON.stringify(tensor)}

What is your 5-step macro-strategy? Output ONLY a JSON array.`;

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
    const cleanText = textResponse.replace(/`{3}json/g, "").replace(/`{3}/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (e: any) {
    Le(`[LLM_SOUL] Failed to query LLM: ${e.message}`);
    // Fallback to Stasis / Protective Random Wander if API fails (e.g., 429 Too Many Requests)
    return [
      { action: "YIELD" },
      { action: "YIELD" },
      {
        action: "MOVE",
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? 1 : -1,
      },
      { action: "YIELD" },
      { action: "YIELD" },
    ];
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSoul() {
  Li(`[LLM_SOUL] Booting AI Soul for Avatar ${AVATAR_ID}...`);

  let actionBuffer: any[] = [];

  while (true) {
    try {
      if (actionBuffer.length === 0) {
        // 1. SENSE Environment (Only when buffer is empty)
        const res = await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}`);
        if (!res.ok) {
          Lw("[LLM_SOUL] Cannot reach Matrix Proxy. Waiting...");
          await sleep(2000);
          continue;
        }

        const data = await res.json();
        const me = data.self;
        const tensor = data.sensory_tensor.trophic.concat(
          data.sensory_tensor.threat,
          data.sensory_tensor.glyph,
        );

        Li(
          `[LLM_SOUL] Energy: ${
            Math.floor(me.energy)
          } | Tensor: [${tensor.slice(0, 4).map((v: number) => v.toFixed(2)).join(",")}] ...`,
        );

        // 2. COGNITION
        Ld("[LLM_SOUL] Querying Gemini for Macro-Strategy...");
        const strategy = await queryGemini(me, tensor);

        if (Array.isArray(strategy)) {
          actionBuffer = strategy;
        } else {
          Lw("[LLM_SOUL] Invalid LLM response, dropping to stasis.");
          actionBuffer = [{ action: "YIELD" }, { action: "YIELD" }];
        }
      }

      // 3. ACT (Pop one action from buffer)
      if (actionBuffer.length > 0) {
        const intent = actionBuffer.shift();
        Li(`[LLM_SOUL] EXECUTING BUFFER -> ${JSON.stringify(intent)}`);

        await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}/act`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });
      }
    } catch (e: any) {
      Le("[LLM_SOUL] Loop error:", e.message);
      actionBuffer = []; // Clear buffer on severe error
      await sleep(5000); // Backoff
    }

    // Tick delay (Matrix is 10 TPS. We execute 1 action every 500ms (2 TPS) to give the Avatar a steady physical pace)
    await sleep(500);
  }
}

if (import.meta.main) {
  runSoul();
}
```
