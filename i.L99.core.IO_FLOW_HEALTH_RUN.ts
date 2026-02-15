// i.L99.core.IO_FLOW_HEALTH_RUN.ts
// @noncanonical
// OMEGA-64 | Run IO_FLOW and emit health before/after.

import { IO_FLOW } from "./i.L99.core.IO_FLOW.ts";
import { IO_FLOW_HEALTH } from "./i.L99.core.IO_FLOW_HEALTH.ts";
import { O_STREAM_STORE } from "./i.L99.core.O_STREAM_STORE.ts";
import { O_STREAM_ADAPTER } from "./i.L99.core.O_STREAM_ADAPTER.ts";
import { O_STREAM_DRAIN } from "./i.L99.core.O_STREAM_DRAIN.ts";
import { I16_CLAMP } from "./i.L00.core.I16_CLAMP.ts";
import type { GateRunnerTickOutput } from "./i.L32.core.GATE_RUNNER.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
  ReplayAuditOptions,
  ReplayGenesis,
  ReplayInvariantReport,
} from "./i.L99.core.REPLAY_AUDIT.ts";

type JsonStateSnapshot = {
  tick: number;
  state_i16: number[];
  state_hash: string;
  phase_u16?: number[];
  stability_q15?: number[];
  entropy_i16?: number[];
};

type JsonReplayGenesis = {
  tick: number;
  state_i16: number[];
  state_hash: string;
};

type JsonGateConfig = Omit<GateConfig, "reliability_weight" | "agent_signature_keys"> & {
  reliability_weight: Record<string, number> | Array<[string, number]>;
  agent_signature_keys?:
    | Record<
      string,
      | { scheme: "ed25519/v1"; public_key_b64: string }
      | { scheme: "hmac-sha256/v1"; secret: string }
    >
    | Array<
      [
        string,
        { scheme: "ed25519/v1"; public_key_b64: string } | {
          scheme: "hmac-sha256/v1";
          secret: string;
        },
      ]
    >;
};

type JsonInput = {
  state: JsonStateSnapshot;
  output_stream?: DeltaProposal[];
  stream_path?: string;
  config: JsonGateConfig;
  mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
  replayGenesis?: JsonReplayGenesis;
  replayAuditOptions?: ReplayAuditOptions;
  invariantReport?: ReplayInvariantReport;
  witness?: string;
};

type JsonOutput = {
  nextState: {
    tick: number;
    state_hash: string;
    state_i16: number[];
  };
  bridge_mode: GateRunnerTickOutput["bridge_mode"];
  bridge_reason: string;
  replay_audit?: GateRunnerTickOutput["replay_audit"];
  drained?: number;
  health: Awaited<ReturnType<typeof IO_FLOW_HEALTH>>;
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_HEALTH_RUN.ts --input <input.json> [--pretty] [--drain] [--safe-window]",
  ].join("\n");

export const IO_FLOW_HEALTH_RUN = async (
  args: string[],
): Promise<JsonOutput> => {
  const parsed = {
    input: undefined as string | undefined,
    pretty: false,
    drain: false,
    safeWindow: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      parsed.help = true;
      continue;
    }
    if (a === "--pretty") {
      parsed.pretty = true;
      continue;
    }
    if (a === "--drain") {
      parsed.drain = true;
      continue;
    }
    if (a === "--safe-window") {
      parsed.safeWindow = true;
      continue;
    }
    if (a === "--input") {
      parsed.input = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return {
      nextState: { tick: 0, state_hash: "", state_i16: [] },
      bridge_mode: "AMBER",
      bridge_reason: "HELP_ONLY",
      health: await IO_FLOW_HEALTH([], [], "AMBER", { include_safe_window: parsed.safeWindow }),
    };
  }

  if (!parsed.input) {
    throw new Error("IO_FLOW_HEALTH_RUN: --input is required");
  }

  const raw = await Deno.readTextFile(parsed.input);
  if (!raw.trim()) {
    throw new Error("IO_FLOW_HEALTH_RUN: empty input");
  }

  const json = JSON.parse(raw) as JsonInput;

  const clampI16 = (value: number): number => {
    if (!Number.isFinite(value)) return 0;
    return I16_CLAMP(Math.round(value));
  };

  const toState = (src: JsonStateSnapshot): StateSnapshot => ({
    tick: src.tick,
    state_hash: src.state_hash,
    state_i16: Int16Array.from(src.state_i16.map(clampI16)),
    phase_u16: src.phase_u16 ? Uint16Array.from(src.phase_u16.map((value) => {
      if (!Number.isFinite(value)) return 0;
      const v = Math.round(value);
      if (v < 0) return 0;
      if (v > 65535) return 65535;
      return v;
    })) : undefined,
    stability_q15: src.stability_q15
      ? Float32Array.from(src.stability_q15.map((value) => {
        if (!Number.isFinite(value)) return 0;
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
      }))
      : undefined,
    entropy_i16: src.entropy_i16 ? Int16Array.from(src.entropy_i16.map(clampI16)) : undefined,
  });

  const toReplayGenesis = (src?: JsonReplayGenesis): ReplayGenesis | undefined =>
    src
      ? {
        tick: src.tick,
        state_hash: src.state_hash,
        state_i16: Int16Array.from(src.state_i16.map(clampI16)),
      }
      : undefined;

  const toConfig = (src: JsonGateConfig): GateConfig => {
    const reliability_weight = Array.isArray(src.reliability_weight)
      ? new Map<string, number>(src.reliability_weight)
      : new Map<string, number>(Object.entries(src.reliability_weight));
    const agent_signature_keys = src.agent_signature_keys
      ? (Array.isArray(src.agent_signature_keys)
        ? new Map<
          string,
          { scheme: "ed25519/v1"; public_key_b64: string } | {
            scheme: "hmac-sha256/v1";
            secret: string;
          }
        >(src.agent_signature_keys)
        : new Map<
          string,
          { scheme: "ed25519/v1"; public_key_b64: string } | {
            scheme: "hmac-sha256/v1";
            secret: string;
          }
        >(Object.entries(src.agent_signature_keys)))
      : undefined;
    return {
      max_abs_delta_per_level: src.max_abs_delta_per_level,
      max_total_abs_delta_per_tick: src.max_total_abs_delta_per_tick,
      max_total_cost_per_tick: src.max_total_cost_per_tick,
      max_cost_per_agent: src.max_cost_per_agent,
      reliability_weight,
      reliability_mode: src.reliability_mode,
      reliability_floor: src.reliability_floor,
      dry_run: src.dry_run,
      signature_policy: src.signature_policy,
      agent_signature_keys,
      anti_replay_window_ticks: src.anti_replay_window_ticks,
    };
  };

  const toStream = (proposals: DeltaProposal[]): DeltaProposal[] =>
    proposals.map((proposal) => ({
      ...proposal,
      delta: proposal.delta.map((entry) => ({
        level: entry.level,
        value: clampI16(entry.value),
      })),
    }));

  const outputStream = json.stream_path
    ? O_STREAM_ADAPTER(await O_STREAM_STORE.read(json.stream_path))
    : toStream(json.output_stream ?? []);

  const beforeHealth = outputStream;

  const output = await IO_FLOW({
    state: toState(json.state),
    output_stream: outputStream,
    config: toConfig(json.config),
    mode: json.mode,
    replayGenesis: toReplayGenesis(json.replayGenesis),
    replayAuditOptions: json.replayAuditOptions,
    invariantReport: json.invariantReport,
    witness: json.witness,
  });

  let drained: number | undefined;
  if (parsed.drain && json.stream_path) {
    const consumed = outputStream.map((proposal) => proposal.proposal_id);
    await O_STREAM_DRAIN(consumed, json.stream_path);
    drained = consumed.length;
  }

  const afterStream = json.stream_path
    ? O_STREAM_ADAPTER(await O_STREAM_STORE.read(json.stream_path))
    : [];

  const health = await IO_FLOW_HEALTH(beforeHealth, afterStream, output.bridge_mode, { include_safe_window: parsed.safeWindow });

  const payload: JsonOutput = {
    nextState: {
      tick: output.nextState.tick,
      state_hash: output.nextState.state_hash,
      state_i16: Array.from(output.nextState.state_i16),
    },
    bridge_mode: output.bridge_mode,
    bridge_reason: output.bridge_reason,
    replay_audit: output.replay_audit,
    drained,
    health,
  };

  const body = parsed.pretty
    ? `${JSON.stringify(payload, null, 2)}\n`
    : `${JSON.stringify(payload)}\n`;

  await Deno.stdout.write(new TextEncoder().encode(body));
  return payload;
};

if (import.meta.main) {
  IO_FLOW_HEALTH_RUN(Deno.args);
}
