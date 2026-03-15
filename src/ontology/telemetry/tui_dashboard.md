---
id: TUI_DASHBOARD
type: module
description: "Implementation of TUI_DASHBOARD"
tags: []
min_level: 6
---

### TypeScript
```typescript

import { STATE_MATRIX } from "@generated";
import { GRID_W, GRID_H, WORLD_MAX_X, WORLD_MAX_Y, SPATIAL_CELL_SIZE } from "@generated";
import { PULSE } from "@generated";
import { assemble, GENESIS_PREDATOR_SCRIPT } from "../mod.ts";
import { AgentProxy } from "../../06/AGENT_PROXY.ts";
import { LOGGER } from "@generated";

const STARTING_PREY = 500;
const STARTING_PREDATORS = 50;
const STARTING_PRODUCERS = 1000;
const TOTAL_STARTING = STARTING_PREY + STARTING_PREDATORS + STARTING_PRODUCERS;

async function initSimulation() {
  // Turn off logger output to avoid making the TUI messy
  LOGGER.setLevel("error");
  
  STATE_MATRIX.clear();
  Atomics.store((STATE_MATRIX as any).syncState, 0, 0);
  // Optional: We can read tick via tracking our own var or reading `(STATE_MATRIX as any).tickCounter`

  await PULSE.initWorkers(2); // Two workers for faster physics processing

  let idx = 1; // Start at 1

  // Seed Producers
  for (let i = 0; i < STARTING_PRODUCERS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PRODUCER);
    STATE_MATRIX.setEnergy(idx, 20000); // 20k energy base
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    idx++;
  }

  // Seed Prey
  for (let i = 0; i < STARTING_PREY; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_NEUTRAL);
    STATE_MATRIX.setEnergy(idx, 50000);
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    // Give Prey an empty script (just YIELD)
    idx++;
  }

  // Seed Predators
  for (let i = 0; i < STARTING_PREDATORS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PARASITE); // Predator is PARASITE role=4
    STATE_MATRIX.setEnergy(idx, 100000); // Higher energy capacity
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    STATE_MATRIX.setInstructions(idx, new Uint8Array(GENESIS_PREDATOR_SCRIPT));
    idx++;
  }

  // Seed LLM Avatar Atom
  const AVATAR_ID = 9999;
  STATE_MATRIX.setId(AVATAR_ID, BigInt(AVATAR_ID));
  STATE_MATRIX.setRole(AVATAR_ID, STATE_MATRIX.ROLE_GUARDIAN); // Avatar = Guardian
  STATE_MATRIX.setEnergy(AVATAR_ID, 5000000); // 5 million energy buffer
  STATE_MATRIX.setX(AVATAR_ID, 700); // Center
  STATE_MATRIX.setY(AVATAR_ID, 400);

  console.log(`[TUI] Spawned ${idx - 1} atoms. Press Ctrl+C to stop.`);
}

function renderGrid(tick: number) {
  const grid = Array(GRID_H).fill(0).map(() => Array(GRID_W).fill(" "));
  let prods = 0, preys = 0, preds = 0;
  let totalEnergy = 0;

  for (let i = 1; i <= TOTAL_STARTING; i++) { // For an actual dynamic system, we'd check MAX_ATOMS
    if (STATE_MATRIX.getId(i) > 0n && STATE_MATRIX.getEnergy(i) > 0) {
      const x = Math.floor(STATE_MATRIX.getX(i) / SPATIAL_CELL_SIZE);
      const y = Math.floor(STATE_MATRIX.getY(i) / SPATIAL_CELL_SIZE);
      const role = STATE_MATRIX.getRole(i);
      const energy = STATE_MATRIX.getEnergy(i);
      totalEnergy += energy;

      if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
        if (role === STATE_MATRIX.ROLE_PRODUCER) {
          grid[y][x] = "\x1b[32m*\x1b[0m"; // Green *
          prods++;
        } else if (role === STATE_MATRIX.ROLE_PARASITE) {
          grid[y][x] = "\x1b[31mP\x1b[0m"; // Red P
          preds++;
        } else if (role === STATE_MATRIX.ROLE_NEUTRAL) {
          grid[y][x] = "\x1b[36mo\x1b[0m"; // Cyan o
          preys++;
        }

        // Avatar override
        if (i === 9999) {
          grid[y][x] = "\x1b[1;34m@\x1b[0m"; // Bright Blue @ for Avatar
        }
      }
    }
  }

  let out = "\x1b[2J\x1b[H"; // ANSI: clear screen, cursor home
  out += grid.map((r) => r.join("")).join("\n");
  out +=
    `\n[TICK: ${tick}] | PRODUCERS: ${prods} | PREY: ${preys} | PREDATORS: ${preds} | TOTAL ENERGY: ${
      Math.floor(totalEnergy)
    }\n`;
  console.log(out);
}

async function run() {
  await initSimulation();

  // Start the LLM Proxy
  const proxy = new AgentProxy(8080);
  await proxy.start();

  let tick = 0;

  // 100 ms loop = 10 TPS, but must not overlap
  const loop = async () => {
    try {
      await PULSE.tick();
      tick++;
      renderGrid(tick);
      setTimeout(loop, 100);
    } catch (e) {
      console.error(e);
      Deno.exit(1);
    }
  };
  loop();
}

if (import.meta.main) {
  run();
}

```
