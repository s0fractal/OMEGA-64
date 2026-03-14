import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";

Deno.test("Isolate 920 bug", async () => {
  STATE_MATRIX.clear();
  Atomics.store(STATE_MATRIX.syncState, 0, 0);
  Atomics.store(STATE_MATRIX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  const preyB = 11;
  STATE_MATRIX.setId(preyB, 11n);
  STATE_MATRIX.setEnergy(preyB, 10000);
  STATE_MATRIX.setX(preyB, 30);
  STATE_MATRIX.setY(preyB, 20);

  console.log("Prey X before tick 1:", STATE_MATRIX.getX(preyB));
  await PULSE.tick();
  console.log("Prey X after tick 1:", STATE_MATRIX.getX(preyB));
  await PULSE.tick();
  console.log("Prey X after tick 2:", STATE_MATRIX.getX(preyB));

  PULSE.stopWorkers();
});
