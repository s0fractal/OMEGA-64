// OMEGA-64 | nightly_soak.ts | Stage 42 Golden Master Validation
import { RISC, STATE_MATRIX, SYS } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { assembleScript, SIMPLE_PREDATOR_SCRIPT } from "./GENOMES.ts";
import { AgentProxy } from "./AGENT_PROXY.ts";
import { LOGGER } from "./LOGGER.ts";

const STARTING_PREY = 500;
const STARTING_PREDATORS = 50;
const STARTING_PRODUCERS = 1000;

// Set logger to warn to avoid huge log files over 12 hours
LOGGER.setLevel("warn");

async function initSimulation() {
  STATE_MATRIX.clear();
  Atomics.store((STATE_MATRIX as any).syncState, 0, 0);

  console.log("[SOAK] Initializing WASM VMs...");
  await PULSE.initWorkers(1);

  let idx = 1;

  // 1. Seed Producers
  for (let i = 0; i < STARTING_PRODUCERS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PRODUCER);
    STATE_MATRIX.setEnergy(idx, 10000);
    STATE_MATRIX.setX(idx, Math.random() * 1399);
    STATE_MATRIX.setY(idx, Math.random() * 799);
    idx++;
  }

  // 2. Seed Prey
  for (let i = 0; i < STARTING_PREY; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_NEUTRAL);
    STATE_MATRIX.setEnergy(idx, 20000);
    STATE_MATRIX.setX(idx, Math.random() * 1399);
    STATE_MATRIX.setY(idx, Math.random() * 799);
    // Simple prey behavior: mostly random wander
    const preyScript = assembleScript([
      RISC.OP_SET,
      1,
      Math.random() > 0.5 ? 1 : -1,
      RISC.OP_SET,
      2,
      Math.random() > 0.5 ? 1 : -1,
      RISC.OP_SET,
      0,
      SYS.MOVE,
      RISC.OP_SYSCALL,
    ]);
    STATE_MATRIX.setInstructions(idx, preyScript);
    idx++;
  }

  // 3. Seed Predators
  for (let i = 0; i < STARTING_PREDATORS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PARASITE);
    STATE_MATRIX.setEnergy(idx, 50000);
    STATE_MATRIX.setX(idx, Math.random() * 1399);
    STATE_MATRIX.setY(idx, Math.random() * 799);
    STATE_MATRIX.setInstructions(idx, SIMPLE_PREDATOR_SCRIPT);
    idx++;
  }

  // 4. Seed Automated Avatar (Heuristic Bot)
  const AVATAR_ID = 9999;
  STATE_MATRIX.setId(AVATAR_ID, BigInt(AVATAR_ID));
  STATE_MATRIX.setRole(AVATAR_ID, STATE_MATRIX.ROLE_GUARDIAN);
  STATE_MATRIX.setEnergy(AVATAR_ID, 5000000);
  STATE_MATRIX.setX(AVATAR_ID, 700);
  STATE_MATRIX.setY(AVATAR_ID, 400);

  console.log(`[SOAK] Seeded ${idx - 1} atoms. Matrices locked and loaded.`);
}

async function runAvatarBot() {
  // Non-LLM basic heuristic bot to keep querying the proxy
  // and stressing the network/memory systems over 12 hours
  while (true) {
    try {
      const res = await fetch(`http://localhost:8080/api/atom/9999`);
      if (res.ok) {
        const data = await res.json();
        const vision = data.vision.filter((v: any) =>
          v.role === 0 || v.role === 4
        );
        let intent = {
          action: "MOVE",
          dx: Math.random() > 0.5 ? 1 : -1,
          dy: Math.random() > 0.5 ? 1 : -1,
        };

        if (vision.length > 0) {
          const nearest = vision[0];
          if (nearest.role === 4) {
            intent = {
              action: "MOVE",
              dx: -Math.sign(nearest.dx),
              dy: -Math.sign(nearest.dy),
            }; // RUN
          } else if (nearest.role === 0) {
            if (nearest.distance < 15) {
              intent = {
                action: "EAT",
                targetIdx: nearest.idx,
                dx: 0,
                dy: 0,
              } as any;
            } else {
              intent = {
                action: "MOVE",
                dx: Math.sign(nearest.dx),
                dy: Math.sign(nearest.dy),
              }; // CHASE
            }
          }
        }

        await fetch(`http://localhost:8080/api/atom/9999/act`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });
      }
    } catch (e) {
      // Silence
    }
    await new Promise((r) => setTimeout(r, 500));
  }
}

function writeLog(tick: number, energy: number, pop: number) {
  const timestamp = new Date().toISOString();
  const line =
    `[${timestamp}] TICK: ${tick} | POP: ${pop} | TOTAL_ENERGY: ${energy}\n`;
  Deno.writeTextFileSync("nightly_soak.log", line, { append: true });
}

async function run() {
  await initSimulation();

  // Start the Proxy
  const proxy = new AgentProxy(8080);
  await proxy.start();

  // Start the dummy client
  runAvatarBot();

  console.log("[SOAK] Matrix heartbeat started at 10 TPS.");
  console.log("[SOAK] Logging stats to nightly_soak.log every 1000 ticks...");

  let tick = 0;

  setInterval(async () => {
    try {
      await PULSE.tick();
      tick++;

      // Every 1000 ticks (~ 100 seconds), log system health
      if (tick % 1000 === 0) {
        let pop = 0;
        let totalEnergy = 0;
        for (let i = 1; i <= 10000; i++) {
          const id = Number(STATE_MATRIX.getId(i));
          const energy = STATE_MATRIX.getEnergy(i);
          if (id > 0 && energy > 0) {
            pop++;
            totalEnergy += energy;
          }
        }
        writeLog(tick, totalEnergy, pop);
        console.log(`[SOAK] Tick ${tick} passed. Health written to log.`);
      }
    } catch (e) {
      console.error("[SOAK] FATAL TICK ERROR:", e);
      Deno.exit(1);
    }
  }, 100);
}

if (import.meta.main) {
  run();
}
