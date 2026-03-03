const CAPTURE_MARKER = "__OMEGA_RESILIENCE_CAPTURE__";
const REPORT_JSON_PATH = "WORKER_RESILIENCE_AUDIT.json";
const DRIFT_JSON_PATH = "WORKER_DRIFT_AUDIT.json";

type WorkerStat = {
  workerIndex: number;
  requests: number;
  completed: number;
  timeouts: number;
  retryWaits: number;
  failures: number;
  consecutiveTimeouts: number;
  lastRequestType: string;
  lastPulseId: number;
  lastError: string;
};

type ScenarioCapture = {
  scenario: string;
  workerCount: number;
  timeoutMs: number;
  retryCount: number;
  retryMs: number;
  totalRetries: number;
  totalFailures: number;
  stats: WorkerStat[];
  [key: string]: unknown;
};

type TimedScenarioCapture = ScenarioCapture & {
  durationMs: number;
};

type DriftAuditJson = {
  generatedAt: string;
  strict: {
    metrics: {
      hashEqual: boolean;
      atomDiffCount: number;
      structureDiffCount: number;
      signalDiffCount: number;
      maxPosDrift: number;
    };
  };
  nonStrict: {
    metrics: {
      hashEqual: boolean;
      atomDiffCount: number;
      structureDiffCount: number;
      signalDiffCount: number;
      maxPosDrift: number;
    };
  };
};

const decode = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);

const runScenarioCapture = async (
  script: string,
): Promise<TimedScenarioCapture> => {
  const startedAt = performance.now();
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", script, "--capture"],
    env: {
      ...Deno.env.toObject(),
    },
    stdout: "piped",
    stderr: "piped",
  });

  const res = await cmd.output();
  const merged = `${decode(res.stdout)}\n${decode(res.stderr)}`;
  if (res.code !== 0) {
    throw new Error(`[AUDIT] Scenario failed: ${script}\n${merged}`);
  }

  const markerLine = merged
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.startsWith(CAPTURE_MARKER));
  if (!markerLine) {
    throw new Error(`[AUDIT] Capture marker missing for ${script}.`);
  }

  const payload = JSON.parse(
    markerLine.slice(CAPTURE_MARKER.length),
  ) as ScenarioCapture;
  return {
    ...payload,
    durationMs: Math.round(performance.now() - startedAt),
  };
};

const runDriftAudit = async (): Promise<
  { drift: DriftAuditJson; durationMs: number }
> => {
  const startedAt = performance.now();
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "test_worker_drift_audit.ts"],
    env: {
      ...Deno.env.toObject(),
    },
    stdout: "piped",
    stderr: "piped",
  });

  const res = await cmd.output();
  const merged = `${decode(res.stdout)}\n${decode(res.stderr)}`;
  if (res.code !== 0) {
    throw new Error(`[AUDIT] Drift audit failed.\n${merged}`);
  }

  const raw = await Deno.readTextFile(DRIFT_JSON_PATH);
  return {
    drift: JSON.parse(raw) as DriftAuditJson,
    durationMs: Math.round(performance.now() - startedAt),
  };
};

async function main() {
  const auditStartedAt = performance.now();
  const scenarioScripts = [
    "test_worker_timeout_retry.ts",
    "test_worker_timeout_retry_multi.ts",
    "test_worker_jitter_resilience.ts",
    "test_spawn_jitter_resilience.ts",
  ];

  const captures: TimedScenarioCapture[] = [];
  for (const script of scenarioScripts) {
    console.log(`AUDIT [worker-resilience] capture ${script}...`);
    captures.push(await runScenarioCapture(script));
  }

  console.log(
    "AUDIT [worker-resilience] capture test_worker_drift_audit.ts...",
  );
  const driftCapture = await runDriftAudit();
  const drift = driftCapture.drift;

  const totalRetries = captures.reduce((acc, c) => acc + c.totalRetries, 0);
  const totalFailures = captures.reduce((acc, c) => acc + c.totalFailures, 0);
  const totalScenarioDurationMs = captures.reduce(
    (acc, c) => acc + c.durationMs,
    0,
  );
  const maxRetriesScenario = captures.reduce((best, c) => {
    if (!best || c.totalRetries > best.totalRetries) return c;
    return best;
  }, null as TimedScenarioCapture | null);
  const maxDurationScenario = captures.reduce((best, c) => {
    if (!best || c.durationMs > best.durationMs) return c;
    return best;
  }, null as TimedScenarioCapture | null);
  const totalAuditDurationMs = Math.round(performance.now() - auditStartedAt);

  const report = {
    generatedAt: new Date().toISOString(),
    scenarios: captures,
    drift,
    summary: {
      scenarioCount: captures.length,
      totalRetries,
      totalFailures,
      totalScenarioDurationMs,
      driftAuditDurationMs: driftCapture.durationMs,
      totalAuditDurationMs,
      strictHashEqual: drift.strict.metrics.hashEqual,
      nonStrictHashEqual: drift.nonStrict.metrics.hashEqual,
      nonStrictMaxPosDrift: drift.nonStrict.metrics.maxPosDrift,
      maxRetriesScenario: maxRetriesScenario?.scenario ?? "",
      maxRetriesValue: maxRetriesScenario?.totalRetries ?? 0,
      maxDurationScenario: maxDurationScenario?.scenario ?? "",
      maxDurationValueMs: maxDurationScenario?.durationMs ?? 0,
    },
  };

  await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));

  console.log(`   scenarios=${captures.length}`);
  console.log(`   totalRetries=${totalRetries}`);
  console.log(`   totalFailures=${totalFailures}`);
  console.log(`   totalScenarioDurationMs=${totalScenarioDurationMs}`);
  console.log(`   driftAuditDurationMs=${driftCapture.durationMs}`);
  console.log(`   totalAuditDurationMs=${totalAuditDurationMs}`);
  console.log(`   strictHashEqual=${drift.strict.metrics.hashEqual}`);
  console.log(`   nonStrictHashEqual=${drift.nonStrict.metrics.hashEqual}`);
  console.log(`   report: ${REPORT_JSON_PATH}`);

  if (totalFailures !== 0) {
    throw new Error("[AUDIT] Worker resilience failures detected.");
  }
  if (!drift.strict.metrics.hashEqual) {
    throw new Error("[AUDIT] Strict drift audit hash mismatch.");
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
