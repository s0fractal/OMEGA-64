type Violation = {
  file: string;
  reason: string;
};

const QUEUE_PATH = "src/03/CONTROL_INTENT_QUEUE.ts";
const SYSTEM_PATH = "src/07/02/SYSTEM_START.ts";
const PULSE_PATH = "src/_/04/PULSE.ts";
const POLICY_PATH = "src/03/RUNTIME_POLICY.ts";

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

  const queue = await Deno.readTextFile(QUEUE_PATH);
  const system = await Deno.readTextFile(SYSTEM_PATH);
  const pulse = await Deno.readTextFile(PULSE_PATH);
  const policy = await Deno.readTextFile(POLICY_PATH);

  requireSnippet(
    policy,
    "OMEGA_CONTROL_INTENT_MAX",
    POLICY_PATH,
    "Queue must expose bounded max size control",
    violations,
  );
  requireSnippet(
    policy,
    "OMEGA_CONTROL_INTENT_BUDGET",
    POLICY_PATH,
    "Queue must expose per-tick host-lock budget control",
    violations,
  );
  requireSnippet(
    queue,
    "RUNTIME_POLICY.controlIntent.maxPending",
    QUEUE_PATH,
    "Queue must source max pending from runtime policy",
    violations,
  );
  requireSnippet(
    queue,
    "RUNTIME_POLICY.controlIntent.applyBudgetPerTick",
    QUEUE_PATH,
    "Queue must source host-lock budget from runtime policy",
    violations,
  );
  requireSnippet(
    queue,
    "applyHostLockBudget: async",
    QUEUE_PATH,
    "Queue must expose host-lock apply entrypoint",
    violations,
  );
  requireSnippet(
    queue,
    "P2P_CODEC.unpackAtom(",
    QUEUE_PATH,
    "Queue apply path must own federate state writes (via unpackAtom)",
    violations,
  );
  requireSnippet(
    queue,
    "STATE_MATRIX.setEnergy(",
    QUEUE_PATH,
    "Queue apply path must own mutate state writes",
    violations,
  );

  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE.enqueueCrisis",
    SYSTEM_PATH,
    "System /crisis must enqueue control intents",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE.enqueueFederate",
    SYSTEM_PATH,
    "System /federate must enqueue control intents",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE.enqueueMutate",
    SYSTEM_PATH,
    "System /mutate must enqueue control intents",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE.enqueueAvatar",
    SYSTEM_PATH,
    "System /avatar must enqueue control intents",
    violations,
  );
  requireSnippet(
    system,
    "CONTROL_INTENT_QUEUE.enqueueSnapshotImport",
    SYSTEM_PATH,
    "System /snapshot/import must enqueue control intents",
    violations,
  );

  const mutateBlock = between(
    system,
    'if (url.pathname === "/mutate" && req.method === "POST") {',
    'if (url.pathname === "/avatar" && req.method === "POST") {',
  );
  if (mutateBlock.includes("STATE_MATRIX.setEnergy(")) {
    violations.push({
      file: SYSTEM_PATH,
      reason: "/mutate endpoint must not write STATE_MATRIX directly",
    });
  }
  const federateBlock = between(
    system,
    'if (url.pathname === "/federate" && req.method === "POST") {',
    'if (url.pathname === "/peers") {',
  );
  if (federateBlock.includes("STATE_MATRIX.setId(")) {
    violations.push({
      file: SYSTEM_PATH,
      reason: "/federate endpoint must not write STATE_MATRIX directly",
    });
  }

  requireSnippet(
    pulse,
    "SYNC.HOST_LOCK",
    PULSE_PATH,
    "Pulse must keep host-lock phase for host mutations",
    violations,
  );
  requireSnippet(
    pulse,
    "await CONTROL_INTENT_QUEUE.applyHostLockBudget()",
    PULSE_PATH,
    "Pulse must apply control intents only via host-lock budget drain",
    violations,
  );

  if (violations.length > 0) {
    console.error("[control-intent-serialization] contract violated.");
    for (const v of violations) {
      console.error(` - ${v.file}`);
      console.error(`   reason: ${v.reason}`);
    }
    Deno.exit(1);
  }

  console.log("[control-intent-serialization] contract guard passed.");
};

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
