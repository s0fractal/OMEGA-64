// i.L32.core.INVARIANT_PACKET.ts
// OMEGA-64 | Minimal invariant packet for lightweight bridge exchange.

import type { ReplayInvariantReport } from "./i.L99.core.REPLAY_AUDIT.ts";

export interface InvariantPacket {
  version: string;
  tick_anchor: number;
  canon_index_chain_checked: boolean;
  canon_index_chain_ok: boolean;
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  ledger_chain_checked?: boolean;
  ledger_chain_ok?: boolean;
  witness?: string;
  packet_hash?: string;
}

export interface InvariantPacketVerifyResult {
  ok: boolean;
  expected?: string;
  actual?: string;
  reasons: string[];
}

const PACKET_VERSION = "invariant-packet/v1";

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

const canonicalPayload = (packet: InvariantPacket): string =>
  stableStringify({
    version: packet.version,
    tick_anchor: packet.tick_anchor,
    canon_index_chain_checked: packet.canon_index_chain_checked,
    canon_index_chain_ok: packet.canon_index_chain_ok,
    gate_admission_index_chain_checked: packet.gate_admission_index_chain_checked,
    gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
    ledger_chain_checked: packet.ledger_chain_checked,
    ledger_chain_ok: packet.ledger_chain_ok,
    witness: packet.witness
  });

const toFailures = (label: string, ok: boolean): string[] =>
  ok ? [] : [`INVARIANT_PACKET_${label}_FAIL`];

export const INVARIANT_PACKET = {
  VERSION: PACKET_VERSION,

  hash: async (packet: InvariantPacket): Promise<string> =>
    await sha256Hex(canonicalPayload(packet)),

  seal: async (
    packet: Omit<InvariantPacket, "packet_hash" | "version"> & { version?: string }
  ): Promise<InvariantPacket> => {
    const versioned: InvariantPacket = { ...packet, version: PACKET_VERSION };
    const packet_hash = await INVARIANT_PACKET.hash(versioned);
    return { ...versioned, packet_hash };
  },

  verify: async (packet: InvariantPacket): Promise<InvariantPacketVerifyResult> => {
    const reasons: string[] = [];
    if (packet.version !== PACKET_VERSION) {
      reasons.push("UNSUPPORTED_VERSION");
    }
    if (!Number.isInteger(packet.tick_anchor) || packet.tick_anchor < 0) {
      reasons.push("INVALID_TICK_ANCHOR");
    }
    if (!packet.packet_hash) {
      reasons.push("MISSING_PACKET_HASH");
      return { ok: false, reasons };
    }
    const expected = await INVARIANT_PACKET.hash(packet);
    if (expected !== packet.packet_hash) {
      reasons.push("PACKET_HASH_MISMATCH");
    }
    return {
      ok: reasons.length === 0,
      expected,
      actual: packet.packet_hash,
      reasons
    };
  },

  fromInvariantReport: async (
    invariant: ReplayInvariantReport,
    meta: { tick_anchor: number; witness?: string }
  ): Promise<InvariantPacket> => {
    const packet = {
      version: PACKET_VERSION,
      tick_anchor: meta.tick_anchor,
      canon_index_chain_checked: invariant.index_chain_checked,
      canon_index_chain_ok: invariant.index_chain_ok,
      gate_admission_index_chain_checked: invariant.gate_admission_index_chain_checked ?? false,
      gate_admission_index_chain_ok: invariant.gate_admission_index_chain_ok ?? false,
      ledger_chain_checked: invariant.ledger_chain_checked,
      ledger_chain_ok: invariant.ledger_chain_ok,
      witness: meta.witness
    };
    const packet_hash = await INVARIANT_PACKET.hash(packet);
    return { ...packet, packet_hash };
  },

  toInvariantReport: (packet: InvariantPacket): ReplayInvariantReport => {
    const canonFailures = toFailures("CANON", packet.canon_index_chain_ok);
    const gateFailures = toFailures(
      "GATE_ADMISSION",
      packet.gate_admission_index_chain_ok
    );
    const report: ReplayInvariantReport = {
      index_chain_checked: packet.canon_index_chain_checked,
      index_chain_ok: packet.canon_index_chain_ok,
      index_chain_checked_records: 0,
      index_chain_failures: canonFailures,
      gate_admission_index_chain_checked: packet.gate_admission_index_chain_checked,
      gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
      gate_admission_index_chain_checked_records: 0,
      gate_admission_index_chain_failures: gateFailures
    };
    if (packet.ledger_chain_checked !== undefined) {
      report.ledger_chain_checked = packet.ledger_chain_checked;
      report.ledger_chain_ok = packet.ledger_chain_ok ?? false;
      report.ledger_chain_failures = packet.ledger_chain_checked
        ? toFailures("LEDGER", packet.ledger_chain_ok ?? false)
        : ["INVARIANT_PACKET_LEDGER_UNCHECKED"];
    }
    return report;
  }
};
