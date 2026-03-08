// i.L99.core.GLIDER_LITE_BREATHE.ts
// @noncanonical
// OMEGA-64 | Glider Lite | Breathe Loop

/// <reference lib="deno.ns" />

import { GLIDER_LITE } from "./i.L99.core.GLIDER_LITE.ts";
import { SIGNAL } from "./i.L64.core.SIGNAL.ts";
import { I16_CLAMP } from "./i.L00.core.I16_CLAMP.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";

type PersistedState = {
  tick: number;
  state_hash: string;
  state_i16: number[];
};

const DEFAULT_STATE_PATH = "GLIDER_BREATHE_STATE.json";
const DEFAULT_INTERVAL = 5000;

const parseArgs = (args: string[]) => {
  const out: {
    statePath: string;
    configPath?: string;
    proposalsPath?: string;
    interval: number;
    once: boolean;
    mutate: boolean;
  } = {
    statePath: DEFAULT_STATE_PATH,
    configPath: undefined,
    proposalsPath: undefined,
    interval: DEFAULT_INTERVAL,
    once: false,
    mutate: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--state") {
      out.statePath = args[i + 1] ?? DEFAULT_STATE_PATH;
      i += 1;
      continue;
    }
    if (arg === "--config") {
      out.configPath = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--proposals") {
      out.proposalsPath = args[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--interval") {
      const value = Number.parseInt(args[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value > 0) out.interval = value;
      i += 1;
      continue;
    }
    if (arg === "--once") {
      out.once = true;
      continue;
    }
    if (arg === "--mutate") {
      out.mutate = true;
      continue;
    }
  }
  return out;
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v !== "undefined")
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const clampI16 = (value: number): number => I16_CLAMP(Math.round(value));

const defaultState = async (): Promise<PersistedState> => {
  const state_i16 = Array.from({ length: 64 }, () => 0);
  const tick = 0;
  const state_hash = await sha256Hex(
    stableStringify({ seed: "GLIDER_BREATHE_GENESIS", tick, state_i16 }),
  );
  return { tick, state_hash, state_i16 };
};

const readState = async (path: string): Promise<PersistedState> => {
  try {
    const raw = await Deno.readTextFile(path);
    const parsed = JSON.parse(raw) as PersistedState;
    if (!Array.isArray(parsed.state_i16)) throw new Error("Invalid state_i16");
    return {
      tick: Number(parsed.tick) || 0,
      state_hash: String(parsed.state_hash || ""),
      state_i16: parsed.state_i16.map((v) => clampI16(Number(v) || 0)),
    };
  } catch {
    return await defaultState();
  }
};

const writeState = async (path: string, snapshot: StateSnapshot) => {
  const payload: PersistedState = {
    tick: snapshot.tick,
    state_hash: snapshot.state_hash,
    state_i16: Array.from(snapshot.state_i16),
  };
  await Deno.writeTextFile(path, JSON.stringify(payload, null, 2));
};

const defaultConfig = (mutate: boolean): GateConfig => ({
  max_abs_delta_per_level: 8,
  max_total_abs_delta_per_tick: 16,
  max_total_cost_per_tick: 1000,
  max_cost_per_agent: 1000,
  reliability_weight: new Map([["GLIDER_LITE", 1]]),
  reliability_mode: "STATIC",
  dry_run: !mutate,
  signature_policy: "DISABLED",
  anti_replay_window_ticks: 0,
});

const defaultProposal = (state: PersistedState): DeltaProposal => ({
  proposal_id: `pulse_${state.tick}`,
  tick: state.tick,
  base_state_hash: state.state_hash,
  agent_id: "GLIDER_LITE",
  intent: "BREATHE_PULSE",
  confidence: 1,
  delta: [{ level: 32, value: 1 }],
  cost_estimate: 1,
  artifact_hash: state.state_hash,
  semantic_fingerprint: state.state_hash,
  target_path: "LOCAL",
});

const loadConfig = async (
  path: string | undefined,
  mutate: boolean,
): Promise<GateConfig> => {
  if (!path) return defaultConfig(mutate);
  const raw = await Deno.readTextFile(path);
  const parsed = JSON.parse(raw);
  const reliability = parsed.reliability_weight ?? {};
  const reliability_weight = new Map(
    Array.isArray(reliability) ? reliability : Object.entries(reliability),
  );
  return {
    max_abs_delta_per_level: parsed.max_abs_delta_per_level ?? 8,
    max_total_abs_delta_per_tick: parsed.max_total_abs_delta_per_tick ?? 16,
    max_total_cost_per_tick: parsed.max_total_cost_per_tick ?? 1000,
    max_cost_per_agent: parsed.max_cost_per_agent ?? 1000,
    reliability_weight,
    reliability_mode: parsed.reliability_mode ?? "STATIC",
    reliability_floor: parsed.reliability_floor,
    dry_run: parsed.dry_run ?? !mutate,
    signature_policy: parsed.signature_policy ?? "DISABLED",
    agent_signature_keys: undefined,
    anti_replay_window_ticks: parsed.anti_replay_window_ticks ?? 0,
  };
};

const loadProposals = async (
  path: string | undefined,
  state: PersistedState,
): Promise<DeltaProposal[]> => {
  if (!path) return [defaultProposal(state)];
  const raw = await Deno.readTextFile(path);
  const parsed = JSON.parse(raw) as DeltaProposal[];
  return parsed.map((proposal) => ({
    ...proposal,
    tick: state.tick,
    base_state_hash: state.state_hash,
  }));
};

const toSnapshot = (state: PersistedState): StateSnapshot => ({
  tick: state.tick,
  state_hash: state.state_hash,
  state_i16: Int16Array.from(state.state_i16.map(clampI16)),
});

const breatheOnce = async (
  statePath: string,
  configPath: string | undefined,
  proposalsPath: string | undefined,
  mutate: boolean,
) => {
  const state = await readState(statePath);
  const config = await loadConfig(configPath, mutate);
  const proposals = await loadProposals(proposalsPath, state);
  const snapshot = toSnapshot(state);

  const output = await GLIDER_LITE({
    state: snapshot,
    proposals,
    config,
  });

  await writeState(statePath, output.nextState);

  await SIGNAL.emit("INFO", {
    source: "GLIDER_LITE_BREATHE",
    message: `Pulse tick=${output.nextState.tick} bridge=${output.bridge_mode}`,
    context: {
      tick: output.nextState.tick,
      bridge_mode: output.bridge_mode,
      bridge_reason: output.bridge_reason,
      dry_run: config.dry_run,
    },
  });
};

const main = async () => {
  const args = parseArgs(Deno.args);
  if (args.once) {
    await breatheOnce(
      args.statePath,
      args.configPath,
      args.proposalsPath,
      args.mutate,
    );
    return;
  }

  while (true) {
    await breatheOnce(
      args.statePath,
      args.configPath,
      args.proposalsPath,
      args.mutate,
    );
    await new Promise((resolve) => setTimeout(resolve, args.interval));
  }
};

if (import.meta.main) {
  await main();
}
