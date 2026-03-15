// OMEGA-64 | test_agent_proxy.ts | Stage 38 Verification
import { assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { MX, LOGGER, Li } from "@generated";
import { PULSE } from "@02";
import { AgentProxy } from "../../_/06/AGENT_PROXY.ts";

Deno.test("Stage 38: Autonomous Agents (LLM to Atom Gateway)", async () => {
  Li("--- STAGE 38: AGENT PROXY TEST ---");

  MX.clear();
  Atomics.store((MX as any).syncState, 0, 0);
  await PULSE.initWorkers(1);

  // 1. Spawn the proxy on a test-specific port
  const proxy = new AgentProxy(8081);
  await proxy.start();

  // 2. Spawn a test atom
  const atomA = 100;
  MX.setId(atomA, 100n);
  MX.setRole(atomA, MX.ROLE_NEUTRAL);
  MX.setEnergy(atomA, 50000);
  MX.setX(atomA, 50);
  MX.setY(atomA, 50);

  // Let PULSE build the spatial grid
  await PULSE.tick();

  try {
    // 3. Test GET Global Info
    const r1 = await fetch("http://localhost:8081/api/matrix/info");
    const info = await r1.json();
    assertEquals(
      info.population,
      1,
      "There should be 1 atom in the population",
    );

    // 4. Test GET Sensor Data
    const r2 = await fetch(`http://localhost:8081/api/atom/${atomA}`);
    const sensor = await r2.json();
    assertEquals(sensor.self.id, 100, "Should read self ID correctly");
    assertEquals(sensor.self.x, 50, "Should read self X correctly");

    // 4.5. Spawn a target Atom for ATTRACT
    const atomB = 101;
    MX.setId(atomB, 101n);
    MX.setX(atomB, 60); // +10 X relative to atomA
    MX.setY(atomB, 40); // -10 Y relative to atomA

    // 5. Test POST Motor Intent (ATTRACT)
    const initX = MX.getX(atomA);
    const initY = MX.getY(atomA);

    const r3 = await fetch(`http://localhost:8081/api/atom/${atomA}/act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ATTRACT",
        targetIdx: atomB,
        intensity: 1, // Positive intensity -> move towards target
      }),
    });
    const motorRes = await r3.json();
    assertEquals(motorRes.success, true, "Motor intent POST should succeed");

    // LLM intent was flashed to WASM memory. Let's tick the physics VM to execute it.
    await PULSE.tick();

    // 6. Verify Physical Reaction
    const newX = MX.getX(atomA);
    const newY = MX.getY(atomA);

    // dx=10 because SYS_ATTRACT speed is hardcoded to 10 pixels
    assertEquals(
      newX,
      initX + 10,
      "Atom should have moved +10 in X via WASM syscall (Attracted)",
    );
    assertEquals(
      newY,
      initY - 10,
      "Atom should have moved -10 in Y via WASM syscall (Attracted)",
    );
  } finally {
    // 7. Cleanup
    await proxy.stop();
  }
});
