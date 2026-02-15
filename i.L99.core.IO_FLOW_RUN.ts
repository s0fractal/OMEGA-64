// i.L99.core.IO_FLOW_RUN.ts
// @noncanonical
// OMEGA-64 | Minimal CLI runner for IO_FLOW.

import { IO_FLOW } from "./i.L99.core.IO_FLOW.ts";
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
};

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L99.core.IO_FLOW_RUN.ts --input <input.json> [--output <output.json>] [--state-output <state.json>] [--pretty] [--drain]",
    "  deno run -A i.L99.core.IO_FLOW_RUN.ts < input.json > output.json",
    "",
    "Notes:",
    "  - If stream_path is provided, output_stream will be read from O_STREAM_STORE.",
    "  - --drain removes accepted proposals from stream_path after collapse.",
    "  - --state-output writes the minimal next state snapshot.",
  ].join("\n");

export const IO_FLOW_RUN = async (args: string[]): Promise<void> => {
  const parsed = {
    input: undefined as string | undefined,
    output: undefined as string | undefined,
    stateOutput: undefined as string | undefined,
    pretty: false,
    drain: false,
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
    if (a === "--input") {
      parsed.input = args[++i];
      continue;
    }
    if (a === "--output") {
      parsed.output = args[++i];
      continue;
    }
    if (a === "--state-output") {
      parsed.stateOutput = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }

  if (parsed.help) {
    await Deno.stdout.write(new TextEncoder().encode(`${usage()}\n`));
    return;
  }

  const raw = parsed.input
    ? await Deno.readTextFile(parsed.input)
    : await new Response(Deno.stdin.readable).text();

  if (!raw.trim()) {
    throw new Error("IO_FLOW_RUN: empty input");
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

  const payload: JsonOutput = {
    nextState: {
      tick: output.nextState.tick,
      state_hash: output.nextState.state_hash,
      state_i16: Array.from(output.nextState.state_i16),
    },
    bridge_mode: output.bridge_mode,
    bridge_reason: output.bridge_reason,
    replay_audit: output.replay_audit,
  };

  if (parsed.drain && json.stream_path) {
    const consumed = outputStream.map((proposal) => proposal.proposal_id);
    await O_STREAM_DRAIN(consumed, json.stream_path);
    payload.drained = consumed.length;
  }

  const body = parsed.pretty
    ? `${JSON.stringify(payload, null, 2)}\n`
    : `${JSON.stringify(payload)}\n`;

  if (parsed.stateOutput) {
    const statePayload: JsonStateSnapshot = {
      tick: payload.nextState.tick,
      state_hash: payload.nextState.state_hash,
      state_i16: payload.nextState.state_i16,
    };
    const stateBody = parsed.pretty
      ? `${JSON.stringify(statePayload, null, 2)}\n`
      : `${JSON.stringify(statePayload)}\n`;
    await Deno.writeTextFile(parsed.stateOutput, stateBody);
  }

  if (parsed.output) {
    await Deno.writeTextFile(parsed.output, body);
    return;
  }

  await Deno.stdout.write(new TextEncoder().encode(body));
};

if (import.meta.main) {
  IO_FLOW_RUN(Deno.args);
}
