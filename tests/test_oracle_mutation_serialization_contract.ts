type Violation = {
  file: string;
  reason: string;
};

const PULSE_PATH = "02_metabolism/PULSE.ts";
const ORACLE_PATH = "05_exocortex/SOVEREIGN_ORACLE.ts";

const between = (source: string, start: string, end: string): string => {
  const startIdx = source.indexOf(start);
  if (startIdx < 0) return "";
  const endIdx = source.indexOf(end, startIdx + start.length);
  if (endIdx < 0) return source.slice(startIdx);
  return source.slice(startIdx, endIdx);
};

const requireSnippet = (
  source: string,
  snippet: string,
  file: string,
  reason: string,
  out: Violation[],
) => {
  if (!source.includes(snippet)) {
    out.push({ file, reason: `${reason} (missing: ${snippet})` });
  }
};

const main = async () => {
  const violations: Violation[] = [];

  const pulse = await Deno.readTextFile(PULSE_PATH);
  const oracle = await Deno.readTextFile(ORACLE_PATH);

  requireSnippet(
    pulse,
    "SYNC.HOST_LOCK",
    PULSE_PATH,
    "PULSE must transition to HOST_LOCK phase",
    violations,
  );
  requireSnippet(
    pulse,
    "oracleDelegate?.drainPendingMutations()",
    PULSE_PATH,
    "PULSE must drain queued oracle mutations",
    violations,
  );

  const hostLockIdx = pulse.indexOf("SYNC.HOST_LOCK");
  const drainIdx = pulse.indexOf("oracleDelegate?.drainPendingMutations()");
  if (hostLockIdx >= 0 && drainIdx >= 0 && drainIdx < hostLockIdx) {
    violations.push({
      file: PULSE_PATH,
      reason: "Oracle drain must execute after HOST_LOCK transition",
    });
  }

  requireSnippet(
    oracle,
    "pendingMutations:",
    ORACLE_PATH,
    "Oracle must keep pending mutation queue",
    violations,
  );
  requireSnippet(
    oracle,
    "queueMutation:",
    ORACLE_PATH,
    "Oracle must enqueue async mutations",
    violations,
  );
  requireSnippet(
    oracle,
    "drainPendingMutations:",
    ORACLE_PATH,
    "Oracle must expose host-lock drain",
    violations,
  );

  const consultBlock = between(oracle, "consultOracle:", "broadcastWhisper:");
  if (consultBlock.includes("STATE_MATRIX.setInstructions(")) {
    violations.push({
      file: ORACLE_PATH,
      reason:
        "consultOracle must not apply setInstructions directly (queue instead)",
    });
  }
  if (consultBlock.includes("STATE_MATRIX.setLogic(")) {
    violations.push({
      file: ORACLE_PATH,
      reason: "consultOracle must not apply setLogic directly (queue instead)",
    });
  }
  if (consultBlock.includes("STATE_MATRIX.memoryGrid")) {
    violations.push({
      file: ORACLE_PATH,
      reason:
        "consultOracle must not write memoryGrid directly (queue instead)",
    });
  }

  const whisperBlock = between(
    oracle,
    "broadcastWhisper:",
    "pollNeuralCoherence:",
  );
  if (whisperBlock.includes("STATE_MATRIX.memoryGrid")) {
    violations.push({
      file: ORACLE_PATH,
      reason:
        "broadcastWhisper must not write memoryGrid directly (queue instead)",
    });
  }

  const drainBlock = between(
    oracle,
    "drainPendingMutations:",
    "consultOracle:",
  );
  if (
    !drainBlock.includes("STATE_MATRIX.setInstructions(") ||
    !drainBlock.includes("STATE_MATRIX.memoryGrid")
  ) {
    violations.push({
      file: ORACLE_PATH,
      reason:
        "drainPendingMutations must be the centralized write path for queued oracle mutations",
    });
  }

  if (violations.length > 0) {
    console.error("[oracle-serialization] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[oracle-serialization] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
