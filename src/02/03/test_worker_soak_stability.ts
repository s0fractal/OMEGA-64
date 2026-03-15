import { SPAWN_REQUESTS_OFFSET } from "@generated";
import { loadSoakStabilityConfig } from "@02/03/worker_gate_thresholds.ts";
import {
  assertSeededSwarmWorldInvariants,
  seedSeededSwarmScenario,
  SPAWN_RING_CAPACITY,
} from "@02/03/worker_seeded_swarm.ts";

const {
  timeoutMs,
  retryCount,
  retryMs,
  jitterMinMs,
  jitterMaxMs,
  ticks,
  sampleEvery,
  seed,
  replicators,
  architects,
  backlogMax,
  activeMax,
  rssSlopeMaxBytes,
  heapSlopeMaxBytes,
  backlogSlopeMax,
  retryRateSlopeMax,
  avgTickMsSlopeMax,
  avgTickMsP95Max,
  avgTickMsSpikeMax,
} = loadSoakStabilityConfig();

const REPORT_JSON_PATH = "WORKER_SOAK_STABILITY.json";
const REPORT_MD_PATH = "WORKER_SOAK_STABILITY.md";

type WorkerStat = {
  workerIndex: number;
  requests: number;
  completed: number;
  timeouts: number;
  retryWaits: number;
  failures: number;
};

type Sample = {
  sampleIndex: number;
  tick: number;
  elapsedMs: number;
  windowAvgTickMs: number;
  active: number;
  spawnBacklog: number;
  rss: number;
  heapUsed: number;
  totalRequests: number;
  totalRetries: number;
  totalTimeouts: number;
  totalFailures: number;
  retryRate: number;
  timeoutRate: number;
};

type Check = {
  name: string;
  observed: number | boolean;
  limit: number | boolean;
  ok: boolean;
};

Deno.env.set("OMEGA_PULSE_WORKERS", "4");
Deno.env.set("OMEGA_STRICT_DETERMINISM", "0");
Deno.env.set("OMEGA_STARTUP_SELFTEST", "0");
Deno.env.set("OMEGA_WORKER_RESPONSE_TIMEOUT_MS", String(timeoutMs));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_COUNT", String(retryCount));
Deno.env.set("OMEGA_WORKER_TIMEOUT_RETRY_MS", String(retryMs));

const { PULSE } = await import("../../_/04/PULSE.ts");
const { STATE_MATRIX } = await import("@00");

const slope = (values: number[]): number => {
  const n = values.length;
  if (n < 2) return 0;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
};

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(100, p));
  const rank = (clamped / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sorted[low];
  const weight = rank - low;
  return sorted[low] * (1 - weight) + sorted[high] * weight;
};

const sumFaultStats = (stats: WorkerStat[]) => {
  let totalRequests = 0;
  let totalRetries = 0;
  let totalTimeouts = 0;
  let totalFailures = 0;
  for (const s of stats) {
    totalRequests += s.requests;
    totalRetries += s.retryWaits;
    totalTimeouts += s.timeouts;
    totalFailures += s.failures;
  }
  return { totalRequests, totalRetries, totalTimeouts, totalFailures };
};

const renderMd = (
  generatedAt: string,
  summary: Record<string, unknown>,
  checks: Check[],
): string => {
  const checkRows = checks
    .map((c) =>
      `| ${c.ok ? "PASS" : "FAIL"} | ${c.name} | ${c.observed} | ${c.limit} |`
    )
    .join("\n");

  return `# Worker Soak Stability Report

- generatedAt: ${generatedAt}
- ticks: ${summary.ticks}
- sampleEvery: ${summary.sampleEvery}
- totalDurationMs: ${summary.totalDurationMs}
- initialActive: ${summary.initialActive}
- finalActive: ${summary.finalActive}
- peakActive: ${summary.peakActive}
- maxBacklog: ${summary.maxBacklog}
- p95WindowAvgTickMs: ${summary.p95WindowAvgTickMs}
- maxWindowAvgTickMs: ${summary.maxWindowAvgTickMs}

| status | check | observed | limit |
|---|---|---:|---:|
${checkRows}
`;
};

async function main() {
  console.log(
    `🧪 [TEST] Worker soak stability workers=4 ticks=${ticks} sampleEvery=${sampleEvery} seed=${seed} reps=${replicators} arch=${architects} jitter=[${jitterMinMs},${jitterMaxMs}] timeout=${timeoutMs}/${retryCount}x${retryMs}`,
  );

  const spawnHead = new Int32Array(
    STATE_MATRIX.buffer,
    SPAWN_REQUESTS_OFFSET,
    2,
  );

  try {
    const initialActive = seedSeededSwarmScenario(STATE_MATRIX, {
      seed,
      replicators,
      architects,
    });
    await PULSE.initWorkers();
    await PULSE.setWorkerDebugDelay(0);
    await PULSE.setWorkerDebugJitter(jitterMinMs, jitterMaxMs);

    const samples: Sample[] = [];
    const startedAt = performance.now();
    let peakActive = initialActive;
    let finalActive = initialActive;
    let maxBacklog = 0;
    let maxWindowAvgTickMs = 0;
    let windowTicks = 0;
    let windowDurationMs = 0;

    for (let t = 1; t <= ticks; t++) {
      const tickStarted = performance.now();
      await PULSE.tick();
      const tickDurationMs = performance.now() - tickStarted;
      windowTicks += 1;
      windowDurationMs += tickDurationMs;

      if (t % sampleEvery !== 0 && t !== ticks) {
        continue;
      }

      const active = assertSeededSwarmWorldInvariants(STATE_MATRIX, "[SOAK]");
      finalActive = active;
      peakActive = Math.max(peakActive, active);

      if (active > activeMax) {
        throw new Error(
          `[SOAK] Active population exceeded max: active=${active}, max=${activeMax}`,
        );
      }

      const writeHead = Atomics.load(spawnHead, 0);
      const readHead = Atomics.load(spawnHead, 1);
      const backlog = (writeHead - readHead + SPAWN_RING_CAPACITY) %
        SPAWN_RING_CAPACITY;
      maxBacklog = Math.max(maxBacklog, backlog);

      const stats = PULSE.getWorkerFaultStats() as WorkerStat[];
      const totals = sumFaultStats(stats);
      const mem = Deno.memoryUsage();
      const elapsedMs = Math.round(performance.now() - startedAt);
      const windowAvgTickMs = windowDurationMs / Math.max(1, windowTicks);
      maxWindowAvgTickMs = Math.max(maxWindowAvgTickMs, windowAvgTickMs);

      const sample: Sample = {
        sampleIndex: samples.length,
        tick: t,
        elapsedMs,
        windowAvgTickMs: Number(windowAvgTickMs.toFixed(3)),
        active,
        spawnBacklog: backlog,
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        totalRequests: totals.totalRequests,
        totalRetries: totals.totalRetries,
        totalTimeouts: totals.totalTimeouts,
        totalFailures: totals.totalFailures,
        retryRate: totals.totalRetries / Math.max(1, totals.totalRequests),
        timeoutRate: totals.totalTimeouts / Math.max(1, totals.totalRequests),
      };

      samples.push(sample);
      console.log(
        `   [SAMPLE ${sample.sampleIndex}] tick=${t} active=${active} backlog=${backlog} avgTickMs=${sample.windowAvgTickMs} retryRate=${
          sample.retryRate.toFixed(3)
        } rss=${sample.rss}`,
      );

      windowTicks = 0;
      windowDurationMs = 0;
    }

    const rssSlope = slope(samples.map((s) => s.rss));
    const heapSlope = slope(samples.map((s) => s.heapUsed));
    const backlogSlope = slope(samples.map((s) => s.spawnBacklog));
    const retryRateSlope = slope(samples.map((s) => s.retryRate));
    const avgTickMsSlope = slope(samples.map((s) => s.windowAvgTickMs));
    const p95WindowAvgTickMs = percentile(
      samples.map((s) => s.windowAvgTickMs),
      95,
    );

    const last = samples[samples.length - 1];
    const checks: Check[] = [
      {
        name: "samples.length >= 4",
        observed: samples.length,
        limit: 4,
        ok: samples.length >= 4,
      },
      {
        name: "totalFailures == 0",
        observed: last?.totalFailures ?? -1,
        limit: 0,
        ok: (last?.totalFailures ?? Number.POSITIVE_INFINITY) === 0,
      },
      {
        name: `maxBacklog <= ${backlogMax}`,
        observed: maxBacklog,
        limit: backlogMax,
        ok: maxBacklog <= backlogMax,
      },
      {
        name: `peakActive <= ${activeMax}`,
        observed: peakActive,
        limit: activeMax,
        ok: peakActive <= activeMax,
      },
      {
        name: `rssSlope <= ${rssSlopeMaxBytes}`,
        observed: Math.round(rssSlope),
        limit: rssSlopeMaxBytes,
        ok: rssSlope <= rssSlopeMaxBytes,
      },
      {
        name: `heapSlope <= ${heapSlopeMaxBytes}`,
        observed: Math.round(heapSlope),
        limit: heapSlopeMaxBytes,
        ok: heapSlope <= heapSlopeMaxBytes,
      },
      {
        name: `backlogSlope <= ${backlogSlopeMax}`,
        observed: Number(backlogSlope.toFixed(3)),
        limit: backlogSlopeMax,
        ok: backlogSlope <= backlogSlopeMax,
      },
      {
        name: `retryRateSlope <= ${retryRateSlopeMax}`,
        observed: Number(retryRateSlope.toFixed(6)),
        limit: retryRateSlopeMax,
        ok: retryRateSlope <= retryRateSlopeMax,
      },
      {
        name: `avgTickMsSlope <= ${avgTickMsSlopeMax}`,
        observed: Number(avgTickMsSlope.toFixed(6)),
        limit: avgTickMsSlopeMax,
        ok: avgTickMsSlope <= avgTickMsSlopeMax,
      },
      {
        name: `p95WindowAvgTickMs <= ${avgTickMsP95Max}`,
        observed: Number(p95WindowAvgTickMs.toFixed(3)),
        limit: avgTickMsP95Max,
        ok: p95WindowAvgTickMs <= avgTickMsP95Max,
      },
      {
        name: `maxWindowAvgTickMs <= ${avgTickMsSpikeMax}`,
        observed: Number(maxWindowAvgTickMs.toFixed(3)),
        limit: avgTickMsSpikeMax,
        ok: maxWindowAvgTickMs <= avgTickMsSpikeMax,
      },
    ];

    const failing = checks.filter((c) => !c.ok);
    const summary = {
      ticks,
      sampleEvery,
      samples: samples.length,
      totalDurationMs: Math.round(performance.now() - startedAt),
      initialActive,
      finalActive,
      peakActive,
      maxBacklog,
      p95WindowAvgTickMs: Number(p95WindowAvgTickMs.toFixed(3)),
      maxWindowAvgTickMs: Number(maxWindowAvgTickMs.toFixed(3)),
      slopes: {
        rss: Math.round(rssSlope),
        heapUsed: Math.round(heapSlope),
        backlog: Number(backlogSlope.toFixed(6)),
        retryRate: Number(retryRateSlope.toFixed(8)),
        avgTickMs: Number(avgTickMsSlope.toFixed(8)),
      },
      totals: {
        requests: last?.totalRequests ?? 0,
        retries: last?.totalRetries ?? 0,
        timeouts: last?.totalTimeouts ?? 0,
        failures: last?.totalFailures ?? 0,
      },
    };

    const report = {
      generatedAt: new Date().toISOString(),
      config: {
        timeoutMs,
        retryCount,
        retryMs,
        jitterMinMs,
        jitterMaxMs,
        ticks,
        sampleEvery,
        seed,
        replicators,
        architects,
        backlogMax,
        activeMax,
        rssSlopeMaxBytes,
        heapSlopeMaxBytes,
        backlogSlopeMax,
        retryRateSlopeMax,
        avgTickMsSlopeMax,
        avgTickMsP95Max,
        avgTickMsSpikeMax,
      },
      summary,
      checks,
      samples,
      pass: failing.length === 0,
    };

    await Deno.writeTextFile(REPORT_JSON_PATH, JSON.stringify(report, null, 2));
    await Deno.writeTextFile(
      REPORT_MD_PATH,
      renderMd(report.generatedAt, summary as Record<string, unknown>, checks),
    );

    console.log(`AUDIT [worker-soak-stability] report: ${REPORT_JSON_PATH}`);
    console.log(`AUDIT [worker-soak-stability] reportMd: ${REPORT_MD_PATH}`);
    console.log(`   checks=${checks.length} failed=${failing.length}`);

    if (failing.length > 0) {
      for (const f of failing) {
        console.error(
          `   FAIL ${f.name} observed=${f.observed} limit=${f.limit}`,
        );
      }
      throw new Error("[AUDIT] Worker soak stability gate failed.");
    }

    await PULSE.setWorkerDebugJitter(0, 0);
    console.log("✅ [AUDIT] Worker soak stability gate passed.");
  } finally {
    PULSE.stopWorkers();
  }
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
