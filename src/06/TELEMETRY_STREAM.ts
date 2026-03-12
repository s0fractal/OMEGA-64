type TelemetrySample = {
  ts: number;
  tick: number;
  population: number;
  avgEnergy: number;
  neuralCoherence: number;
  spatialOverflowRatio: number;
  daemonSafeMode: boolean;
};

type TelemetryMetricName =
  | "population"
  | "avgEnergy"
  | "neuralCoherence"
  | "spatialOverflowRatio";

type TelemetryBucket = {
  from: number;
  to: number;
  count: number;
};

type TelemetryHistogram = {
  metric: TelemetryMetricName;
  windowMs: number;
  count: number;
  min: number;
  max: number;
  buckets: TelemetryBucket[];
};

const HISTORY_LIMIT = 4096;
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_BUCKETS = 12;

const subscribers = new Set<WebSocket>();
const history: TelemetrySample[] = [];

const toFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const metricValue = (
  sample: TelemetrySample,
  metric: TelemetryMetricName,
): number => {
  if (metric === "population") return sample.population;
  if (metric === "avgEnergy") return sample.avgEnergy;
  if (metric === "neuralCoherence") return sample.neuralCoherence;
  return sample.spatialOverflowRatio;
};

const normalizeSample = (
  sample: Partial<TelemetrySample> & { tick: number },
): TelemetrySample => ({
  ts: Math.max(0, Math.floor(toFiniteNumber(sample.ts, Date.now()))),
  tick: Math.max(0, Math.floor(toFiniteNumber(sample.tick, 0))),
  population: Math.max(0, Math.floor(toFiniteNumber(sample.population, 0))),
  avgEnergy: toFiniteNumber(sample.avgEnergy, 0),
  neuralCoherence: toFiniteNumber(sample.neuralCoherence, 0),
  spatialOverflowRatio: clamp(
    toFiniteNumber(sample.spatialOverflowRatio, 0),
    0,
    1,
  ),
  daemonSafeMode: sample.daemonSafeMode === true,
});

const recentSamples = (windowMs: number): TelemetrySample[] => {
  const boundedWindow = Math.max(1, Math.floor(windowMs));
  const now = Date.now();
  return history.filter((sample) => now - sample.ts <= boundedWindow);
};

const broadcast = (payload: unknown): void => {
  const encoded = JSON.stringify(payload);
  for (const socket of subscribers) {
    if (socket.readyState !== WebSocket.OPEN) {
      subscribers.delete(socket);
      continue;
    }
    try {
      socket.send(encoded);
    } catch {
      subscribers.delete(socket);
    }
  }
};

const buildHistogram = (
  metric: TelemetryMetricName,
  windowMs: number,
  bucketCount: number,
): TelemetryHistogram => {
  const samples = recentSamples(windowMs);
  if (samples.length === 0) {
    return {
      metric,
      windowMs,
      count: 0,
      min: 0,
      max: 0,
      buckets: [],
    };
  }

  const values = samples.map((sample) => metricValue(sample, metric));
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 0;

  const boundedBuckets = clamp(Math.floor(bucketCount), 1, 64);
  const span = Math.max(1e-9, max - min);
  const step = span / boundedBuckets;
  const buckets: TelemetryBucket[] = [];
  for (let i = 0; i < boundedBuckets; i++) {
    const from = min + step * i;
    const to = i === boundedBuckets - 1 ? max : min + step * (i + 1);
    buckets.push({ from, to, count: 0 });
  }

  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    let idx = Math.floor((value - min) / step);
    if (idx < 0) idx = 0;
    if (idx >= boundedBuckets) idx = boundedBuckets - 1;
    buckets[idx].count++;
  }

  return {
    metric,
    windowMs,
    count: samples.length,
    min,
    max,
    buckets,
  };
};

export const TELEMETRY_STREAM = {
  emit: (
    sample: Partial<TelemetrySample> & { tick: number },
  ): TelemetrySample => {
    const normalized = normalizeSample(sample);
    history.push(normalized);
    if (history.length > HISTORY_LIMIT) {
      history.splice(0, history.length - HISTORY_LIMIT);
    }
    broadcast({
      type: "telemetry",
      sample: normalized,
    });
    return normalized;
  },
  history: (limit = 128): TelemetrySample[] => {
    const take = clamp(
      Math.floor(toFiniteNumber(limit, 128)),
      1,
      HISTORY_LIMIT,
    );
    return history.slice(-take);
  },
  histogram: (
    metric: TelemetryMetricName,
    windowMs = DEFAULT_WINDOW_MS,
    bucketCount = DEFAULT_BUCKETS,
  ): TelemetryHistogram => {
    const boundedWindow = clamp(
      Math.floor(toFiniteNumber(windowMs, DEFAULT_WINDOW_MS)),
      1_000,
      86_400_000,
    );
    return buildHistogram(metric, boundedWindow, bucketCount);
  },
  metrics: (): TelemetryMetricName[] => [
    "population",
    "avgEnergy",
    "neuralCoherence",
    "spatialOverflowRatio",
  ],
  attach: (socket: WebSocket): void => {
    subscribers.add(socket);
    socket.onclose = () => subscribers.delete(socket);
    socket.onerror = () => subscribers.delete(socket);
    try {
      socket.send(
        JSON.stringify({
          type: "telemetry_sync",
          history: TELEMETRY_STREAM.history(64),
        }),
      );
    } catch {
      subscribers.delete(socket);
    }
  },
};

export type { TelemetryHistogram, TelemetryMetricName, TelemetrySample };
