type Violation = {
  file: string;
  reason: string;
};

const PULSE_PATH = "src/_/04/PULSE.ts";
const SYSTEM_PATH = "src/07/02/SYSTEM_START.ts";

const main = async () => {
  const violations: Violation[] = [];
  const pulse = await Deno.readTextFile(PULSE_PATH);
  const system = await Deno.readTextFile(SYSTEM_PATH);

  if (!pulse.includes("currentPulseId:")) {
    violations.push({
      file: PULSE_PATH,
      reason: "PULSE must expose currentPulseId field",
    });
  }
  if (!pulse.includes("PULSE.currentPulseId = currentTick;")) {
    violations.push({
      file: PULSE_PATH,
      reason: "PULSE tick must refresh currentPulseId from tick clock",
    });
  }
  const tickIdx = pulse.indexOf(
    "const currentTick = Atomics.load(tickCounter, 0);",
  );
  const assignIdx = pulse.indexOf("PULSE.currentPulseId = currentTick;");
  if (tickIdx >= 0 && assignIdx >= 0 && assignIdx < tickIdx) {
    violations.push({
      file: PULSE_PATH,
      reason: "currentPulseId assignment must happen after currentTick read",
    });
  }
  // Check removed: SYSTEM_START no longer needs currentPulseId to seed federated ingress,
  // because the P2P_CODEC unloads direct deterministic values.

  if (violations.length > 0) {
    console.error("[pulse-clock] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[pulse-clock] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
