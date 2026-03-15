import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX } from "@generated";
import { PULSE } from "@generated";

Deno.test("Isolate 920 bug", async () => {
  MX.clear();
  Atomics.store(MX.syncState, 0, 0);
  Atomics.store(MX.tickCounter, 0, 100);
  await PULSE.initWorkers(1);

  const preyB = 11;
  MX.setId(preyB, 11n);
  MX.setEnergy(preyB, 10000);
  MX.setX(preyB, 30);
  MX.setY(preyB, 20);

  console.log("Prey X before tick 1:", MX.getX(preyB));
  await PULSE.tick();
  console.log("Prey X after tick 1:", MX.getX(preyB));
  await PULSE.tick();
  console.log("Prey X after tick 2:", MX.getX(preyB));

  PULSE.stopWorkers();
});
