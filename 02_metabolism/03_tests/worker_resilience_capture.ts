import {
  RESILIENCE_SCENARIOS,
  type ResilienceScenario,
} from "@02/03_tests/worker_gate_thresholds.ts";

export const RESILIENCE_CAPTURE_MARKER = "__OMEGA_RESILIENCE_CAPTURE__";

export const RESILIENCE_SCENARIO_SCRIPT_BY_ID: Record<
  ResilienceScenario,
  string
> = {
  "worker-timeout-retry": "test_worker_timeout_retry.ts",
  "worker-timeout-retry-multi": "test_worker_timeout_retry_multi.ts",
  "worker-jitter-resilience": "test_worker_jitter_resilience.ts",
  "spawn-jitter-resilience": "test_spawn_jitter_resilience.ts",
};

export const RESILIENCE_SCENARIO_SCRIPT_PAIRS = RESILIENCE_SCENARIOS.map((
  scenario,
) => ({
  scenario,
  script: RESILIENCE_SCENARIO_SCRIPT_BY_ID[scenario],
}));

export type ResilienceWorkerStat = {
  workerIndex: number;
  requests: number;
  completed: number;
  timeouts: number;
  retryWaits: number;
  failures: number;
  consecutiveTimeouts?: number;
  lastRequestType?: string;
  lastPulseId?: number;
  lastError?: string;
};

export type ResilienceCapturePayload = {
  scenario: ResilienceScenario;
  workerCount: number;
  timeoutMs: number;
  retryCount: number;
  retryMs: number;
  totalRetries: number;
  totalFailures: number;
  stats: ResilienceWorkerStat[];
  [key: string]: unknown;
};

const SCENARIO_SET = new Set<string>(RESILIENCE_SCENARIOS);

export const emitResilienceCapture = (
  payload: ResilienceCapturePayload,
): void => {
  console.log(`${RESILIENCE_CAPTURE_MARKER}${JSON.stringify(payload)}`);
};

export const parseResilienceCaptureFromMergedOutput = (
  mergedOutput: string,
  script: string,
): ResilienceCapturePayload => {
  const markerLine = mergedOutput
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.startsWith(RESILIENCE_CAPTURE_MARKER));
  if (!markerLine) {
    throw new Error(`[AUDIT] Capture marker missing for ${script}.`);
  }

  const payload = JSON.parse(
    markerLine.slice(RESILIENCE_CAPTURE_MARKER.length),
  ) as ResilienceCapturePayload;

  if (!SCENARIO_SET.has(String(payload.scenario))) {
    throw new Error(
      `[AUDIT] Invalid resilience scenario in ${script}: ${
        String(payload.scenario)
      }`,
    );
  }

  return payload;
};
