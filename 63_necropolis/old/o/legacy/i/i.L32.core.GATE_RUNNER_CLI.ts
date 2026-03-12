// i.L32.core.GATE_RUNNER_CLI.ts
// @noncanonical
// OMEGA-64 | CLI wrapper for GATE_RUNNER.step(...)

import { GATE_RUNNER } from "./i.L32.core.GATE_RUNNER.ts";
import { LEDGER } from "./i.L99.core.LEDGER.ts";
import { INVARIANT_PACKET, type InvariantPacket } from "./i.L32.core.INVARIANT_PACKET.ts";
import { I16_CLAMP } from "./i.L00.core.I16_CLAMP.ts";
import type {
  DeltaProposal,
  GateConfig,
  StateSnapshot,
} from "./i.L99.core.STATE_SNAPSHOT.ts";
import type {
  ReplayGenesis,
  ReplayInvariantReport,
} from "./i.L99.core.REPLAY_AUDIT.ts";

interface CliStateSnapshot {
  tick: number;
  state_i16: number[];
  state_hash: string;
}

interface CliReplayGenesis {
  tick: number;
  state_i16: number[];
  state_hash: string;
}

interface CliInput {
  state: CliStateSnapshot;
  proposals: DeltaProposal[];
  config: Omit<GateConfig, "reliability_weight" | "agent_signature_keys"> & {
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
  mode?: "REPLAY_CONTEXT" | "INVARIANT_CONTEXT";
  replayGenesis?: CliReplayGenesis;
  replayAuditOptions?: {
    runs?: number;
    startTick?: number;
    endTick?: number;
    verifyTopologicalSignatures?: boolean;
    verifyLedgerChain?: boolean;
    invariantOnly?: boolean;
  };
  invariantReport?: ReplayInvariantReport;
  invariantPacket?: InvariantPacket;
  witness?: string;
}

interface CliInvariantPacketInput {
  invariantReport: ReplayInvariantReport;
  tick_anchor?: number;
  witness?: string;
}

interface CliInvariantPacketVerifyOutput {
  ok: boolean;
  expected?: string;
  actual?: string;
  reasons: string[];
}

interface CliOutput {
  nextState: {
    tick: number;
    state_hash: string;
    state_i16: number[];
  };
  bridge_mode: "GREEN" | "AMBER" | "RED";
  bridge_reason: string;
  replay_audit?: unknown;
  invariant_packet?: InvariantPacket;
}

const usage = (): string =>
  [
    "Usage:",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --input <input.json> [--output <output.json>] [--ledger <ledger.jsonl>] [--pretty]",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --packet --input <input.json> [--output <output.json>] [--pretty]",
    "  deno run -A i.L32.core.GATE_RUNNER_CLI.ts --verify-packet --input <packet.json> [--output <output.json>] [--pretty]",
    "",
    "Notes:",
    "  - input.json must match CliInput schema (state_i16 as number[]).",
    "  - if --output is omitted, result is printed to stdout.",
    "  - if --ledger is provided, LEDGER.STORAGE_PATH is redirected.",
    "  - replayAuditOptions may include verifyLedgerChain/invariantOnly.",
    "  - invariantPacket can replace invariantReport (hash-verified).",
    "  - --packet emits a sealed invariant packet from invariantReport.",
    "  - --verify-packet validates packet hash and schema.",
  ].join("\n");

const clampI16 = (x: number): number => {
  if (!Number.isFinite(x)) return 0;
  return I16_CLAMP(Math.round(x));
};

const toSnapshot = (src: CliStateSnapshot): StateSnapshot => ({
  tick: src.tick,
  state_hash: src.state_hash,
  state_i16: Int16Array.from(src.state_i16.map(clampI16)),
});

const toReplayGenesis = (src?: CliReplayGenesis): ReplayGenesis | undefined =>
  src
    ? {
      tick: src.tick,
      state_hash: src.state_hash,
      state_i16: Int16Array.from(src.state_i16.map(clampI16)),
    }
    : undefined;

const toConfig = (src: CliInput["config"]): GateConfig => {
  const rw = Array.isArray(src.reliability_weight)
    ? new Map<string, number>(src.reliability_weight)
    : new Map<string, number>(Object.entries(src.reliability_weight));
  const ask = src.agent_signature_keys
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
    max_cost_per_agent: src.max_cost_per_agent,
    reliability_weight: rw,
    dry_run: src.dry_run,
    signature_policy: src.signature_policy,
    agent_signature_keys: ask,
    anti_replay_window_ticks: src.anti_replay_window_ticks,
  };
};

const parseArgs = (
  args: string[],
): {
  input?: string;
  output?: string;
  ledger?: string;
  pretty: boolean;
  help: boolean;
  packet: boolean;
  verifyPacket: boolean;
} => {
  const out: {
    input?: string;
    output?: string;
    ledger?: string;
    pretty: boolean;
    help: boolean;
    packet: boolean;
    verifyPacket: boolean;
  } = {
    pretty: false,
    help: false,
    packet: false,
    verifyPacket: false,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--packet") {
      out.packet = true;
      continue;
    }
    if (a === "--verify-packet") {
      out.verifyPacket = true;
      continue;
    }
    if (a === "--pretty") {
      out.pretty = true;
      continue;
    }
    if (a === "--input") {
      out.input = args[++i];
      continue;
    }
    if (a === "--output") {
      out.output = args[++i];
      continue;
    }
    if (a === "--ledger") {
      out.ledger = args[++i];
      continue;
    }
    throw new Error(`Unknown arg: ${a}`);
  }
  return out;
};

const ENCODER = new TextEncoder();

const run = async (): Promise<void> => {
  const parsed = parseArgs(Deno.args);
  if (parsed.help) {
    await Deno.stdout.write(ENCODER.encode(`${usage()}\n`));
    return;
  }
  if (!parsed.input) {
    throw new Error(`Missing --input\n\n${usage()}`);
  }
  if (parsed.packet && parsed.verifyPacket) {
    throw new Error(`--packet and --verify-packet are mutually exclusive\n\n${usage()}`);
  }

  if (parsed.ledger) {
    LEDGER.STORAGE_PATH = parsed.ledger;
  }

  const raw = await Deno.readTextFile(parsed.input);
  if (parsed.packet) {
    const packetInput = JSON.parse(raw) as CliInvariantPacketInput;
    if (!packetInput.invariantReport) {
      throw new Error("Missing invariantReport for --packet mode");
    }
    const packet = await INVARIANT_PACKET.fromInvariantReport(
      packetInput.invariantReport,
      {
        tick_anchor: packetInput.tick_anchor ?? 0,
        witness: packetInput.witness,
      },
    );
    const body = JSON.stringify(packet, null, parsed.pretty ? 2 : undefined);
    if (parsed.output) {
      await Deno.writeTextFile(parsed.output, body);
    } else {
      await Deno.stdout.write(ENCODER.encode(`${body}\n`));
    }
    return;
  }
  if (parsed.verifyPacket) {
    const packet = JSON.parse(raw) as InvariantPacket;
    const verified = await INVARIANT_PACKET.verify(packet);
    const output: CliInvariantPacketVerifyOutput = {
      ok: verified.ok,
      expected: verified.expected,
      actual: verified.actual,
      reasons: verified.reasons,
    };
    const body = JSON.stringify(output, null, parsed.pretty ? 2 : undefined);
    if (parsed.output) {
      await Deno.writeTextFile(parsed.output, body);
    } else {
      await Deno.stdout.write(ENCODER.encode(`${body}\n`));
    }
    return;
  }

  const input = JSON.parse(raw) as CliInput;
  let invariantReport = input.invariantReport;
  if (!invariantReport && input.invariantPacket) {
    const verified = await INVARIANT_PACKET.verify(input.invariantPacket);
    if (!verified.ok) {
      throw new Error(
        `Invalid invariantPacket: ${verified.reasons.join("|")}`,
      );
    }
    invariantReport = INVARIANT_PACKET.toInvariantReport(input.invariantPacket);
  }

  const result = await GATE_RUNNER.step({
    state: toSnapshot(input.state),
    proposals: input.proposals,
    config: toConfig(input.config),
    mode: input.mode,
    replayGenesis: toReplayGenesis(input.replayGenesis),
    replayAuditOptions: input.replayAuditOptions,
    invariantReport,
    witness: input.witness,
  });

  const derivedPacket = !input.invariantPacket && input.invariantReport
    ? await INVARIANT_PACKET.fromInvariantReport(
      input.invariantReport,
      { tick_anchor: input.state.tick, witness: input.witness },
    )
    : undefined;

  const output: CliOutput = {
    nextState: {
      tick: result.nextState.tick,
      state_hash: result.nextState.state_hash,
      state_i16: Array.from(result.nextState.state_i16),
    },
    bridge_mode: result.bridge_mode,
    bridge_reason: result.bridge_reason,
    replay_audit: result.replay_audit,
    invariant_packet: result.replay_audit?.invariantPacket ??
      input.invariantPacket ??
      derivedPacket,
  };

  const body = JSON.stringify(output, null, parsed.pretty ? 2 : undefined);
  if (parsed.output) {
    await Deno.writeTextFile(parsed.output, body);
  } else {
    await Deno.stdout.write(ENCODER.encode(`${body}\n`));
  }
};

if (import.meta.main) {
  await run();
}
