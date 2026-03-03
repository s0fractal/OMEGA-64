import { LOGGER } from "./LOGGER.ts";

type MutationLane =
  | "internal_oracle"
  | "internal_host"
  | "canonical_gate"
  | "external_ingress";

type MutationEvent = {
  lane: MutationLane;
  kind: string;
  count?: number;
};

const parseBool = (raw: string | undefined, fallback: boolean): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};

const parseBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

const TELEMETRY_ENABLED = parseBool(
  Deno.env.get("OMEGA_MUTATION_TELEMETRY"),
  true,
);
const FLUSH_INTERVAL_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_MUTATION_TELEMETRY_FLUSH_TICKS"),
  25,
  1,
  10_000,
);
const TOP_KINDS = parseBoundedInt(
  Deno.env.get("OMEGA_MUTATION_TELEMETRY_TOP_KINDS"),
  6,
  1,
  32,
);

const laneCounts = new Map<MutationLane, number>();
const kindCounts = new Map<string, number>();
let totalMutations = 0;
let lastFlushTick = -1;
let lastFlushedTotal = 0;

const bump = <K>(target: Map<K, number>, key: K, count: number): void => {
  const prev = target.get(key) ?? 0;
  target.set(key, prev + count);
};

const normalizeCount = (value: number | undefined): number => {
  const n = value ?? 1;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const summarizeTopKinds = (): string =>
  JSON.stringify(
    Array.from(kindCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_KINDS)
      .map(([kind, count]) => ({ kind, count })),
  );

const summarizeLanes = (): string =>
  JSON.stringify(
    Object.fromEntries(
      Array.from(laneCounts.entries()).sort((a, b) => b[1] - a[1]),
    ),
  );

export const MUTATION_TELEMETRY = {
  isEnabled: (): boolean => TELEMETRY_ENABLED,
  record: (event: MutationEvent): void => {
    if (!TELEMETRY_ENABLED) return;
    const count = normalizeCount(event.count);
    if (count <= 0) return;
    if (event.kind.trim().length === 0) return;
    bump(laneCounts, event.lane, count);
    bump(kindCounts, event.kind, count);
    totalMutations += count;
  },
  flushIfDue: (tick: number): void => {
    if (!TELEMETRY_ENABLED) return;
    if (!Number.isFinite(tick) || tick < 0) return;
    if (tick - lastFlushTick < FLUSH_INTERVAL_TICKS) return;
    lastFlushTick = tick;

    if (totalMutations === lastFlushedTotal) return;
    lastFlushedTotal = totalMutations;

    LOGGER.debug(
      `[MUTATION_TELEMETRY] tick=${tick} total=${totalMutations} lanes=${summarizeLanes()} topKinds=${summarizeTopKinds()}`,
    );
  },
  snapshot: () => ({
    enabled: TELEMETRY_ENABLED,
    total: totalMutations,
    lanes: Object.fromEntries(laneCounts.entries()),
    topKinds: Array.from(kindCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_KINDS),
  }),
};
