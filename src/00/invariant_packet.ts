// OMEGA-64 | invariant_packet.ts
// Signed invariant packet trace for invariant bridging

import {
  base64_to_bytes,
  bytes_to_base64,
  bytes_to_hex,
  hex_to_bytes,
  import_hmac,
  sha256_hex,
  stable_stringify,
} from "../_/mod.ts";

export interface INVARIANT_PACKET__08_00_InvariantPacket {
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
  signature_scheme?: "hmac-sha256/v1";
  packet_signature?: string;
}

type InvariantPacketSigningKey = { scheme: "hmac-sha256/v1"; secret: string };

const INVARIANT_PACKET_VERSION = "invariant-packet/v1";
const encoder = new TextEncoder();
const crypto = globalThis.crypto;

const packetSigningSecret = (
  key?: InvariantPacketSigningKey,
): string | undefined => {
  if (key?.scheme === "hmac-sha256/v1" && key.secret.length > 0) {
    return key.secret;
  }
  const envSecret = Deno.env.get("OMEGA_INVARIANT_PACKET_HMAC_SECRET");
  return envSecret && envSecret.length > 0 ? envSecret : undefined;
};

const canonicalInvariantPacket = (
  packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
): INVARIANT_PACKET__08_00_InvariantPacket => {
  const tickAnchor =
    Number.isInteger(packet.tick_anchor) && packet.tick_anchor! >= 0
      ? packet.tick_anchor!
      : 0;
  const normalized: INVARIANT_PACKET__08_00_InvariantPacket = {
    version: INVARIANT_PACKET_VERSION,
    tick_anchor: tickAnchor,
    canon_index_chain_checked: packet.canon_index_chain_checked === true,
    canon_index_chain_ok: packet.canon_index_chain_ok === true,
    gate_admission_index_chain_checked:
      packet.gate_admission_index_chain_checked === true,
    gate_admission_index_chain_ok:
      packet.gate_admission_index_chain_ok === true,
  };
  if (packet.ledger_chain_checked !== undefined) {
    normalized.ledger_chain_checked = packet.ledger_chain_checked === true;
    normalized.ledger_chain_ok = packet.ledger_chain_ok === true;
  }
  if (typeof packet.witness === "string" && packet.witness.trim().length > 0) {
    normalized.witness = packet.witness.trim();
  }
  if (typeof packet.packet_hash === "string" && packet.packet_hash.length > 0) {
    normalized.packet_hash = packet.packet_hash;
  }
  if (
    packet.signature_scheme === "hmac-sha256/v1" &&
    typeof packet.packet_signature === "string"
  ) {
    normalized.signature_scheme = packet.signature_scheme;
    normalized.packet_signature = packet.packet_signature;
  }
  return normalized;
};

const canonicalInvariantPacketPayload = (
  packet: INVARIANT_PACKET__08_00_InvariantPacket,
): string =>
  stable_stringify({
    version: packet.version,
    tick_anchor: packet.tick_anchor,
    canon_index_chain_checked: packet.canon_index_chain_checked,
    canon_index_chain_ok: packet.canon_index_chain_ok,
    gate_admission_index_chain_checked:
      packet.gate_admission_index_chain_checked,
    gate_admission_index_chain_ok: packet.gate_admission_index_chain_ok,
    ledger_chain_checked: packet.ledger_chain_checked,
    ledger_chain_ok: packet.ledger_chain_ok,
    witness: packet.witness,
  });

const signInvariantPacketHash = async (
  packetHash: string,
  secret: string,
): Promise<string> => {
  const key = await import_hmac(secret, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(packetHash));
  return bytes_to_base64(new Uint8Array(sig));
};

const verifyInvariantPacketSignature = async (
  packetHash: string,
  signature: string,
  secret: string,
): Promise<boolean> => {
  const sigBytes = base64_to_bytes(signature);
  if (!sigBytes) return false;
  const key = await import_hmac(secret, ["verify"]);
  return await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes as unknown as BufferSource,
    encoder.encode(packetHash),
  );
};

const invariantPacketFailures = (
  label: string,
  ok: boolean,
): string[] => ok ? [] : [`INVARIANT_PACKET_${label}_FAIL`];

export const INVARIANT_PACKET_INVARIANT_PACKET = {
  VERSION: INVARIANT_PACKET_VERSION,

  hash: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket> | string,
  ): Promise<string> => {
    if (typeof packet === "string") {
      return await sha256_hex(stable_stringify(packet));
    }
    const normalized = canonicalInvariantPacket(packet);
    return await sha256_hex(canonicalInvariantPacketPayload(normalized));
  },

  seal: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
    signingKey?: InvariantPacketSigningKey,
  ): Promise<INVARIANT_PACKET__08_00_InvariantPacket> => {
    const normalized = canonicalInvariantPacket(packet);
    const packetHash = await INVARIANT_PACKET_INVARIANT_PACKET.hash(normalized);
    const sealed: INVARIANT_PACKET__08_00_InvariantPacket = {
      ...normalized,
      packet_hash: packetHash,
    };
    const secret = packetSigningSecret(signingKey);
    if (secret) {
      sealed.signature_scheme = "hmac-sha256/v1";
      sealed.packet_signature = await signInvariantPacketHash(
        packetHash,
        secret,
      );
    }
    return sealed;
  },

  verify: async (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
    verifyKey?: InvariantPacketSigningKey,
  ): Promise<{
    ok: boolean;
    expected?: string;
    actual?: string;
    reasons: string[];
    failures: string[];
  }> => {
    const normalized = canonicalInvariantPacket(packet);
    const reasons: string[] = [];

    if (
      packet.version !== undefined &&
      packet.version !== INVARIANT_PACKET_VERSION
    ) {
      reasons.push("UNSUPPORTED_VERSION");
    }
    if (
      !Number.isInteger(packet.tick_anchor) || (packet.tick_anchor ?? -1) < 0
    ) {
      reasons.push("INVALID_TICK_ANCHOR");
    }
    if (
      typeof packet.packet_hash !== "string" || packet.packet_hash.length === 0
    ) {
      reasons.push("MISSING_PACKET_HASH");
      return {
        ok: false,
        reasons,
        failures: [...reasons],
      };
    }

    const expected = await INVARIANT_PACKET_INVARIANT_PACKET.hash(normalized);
    if (expected !== packet.packet_hash) {
      reasons.push("PACKET_HASH_MISMATCH");
    }

    const hasSignature = typeof packet.packet_signature === "string" &&
      packet.packet_signature.length > 0;
    if (
      packet.signature_scheme && packet.signature_scheme !== "hmac-sha256/v1"
    ) {
      reasons.push("UNSUPPORTED_SIGNATURE_SCHEME");
    } else if (hasSignature) {
      const secret = packetSigningSecret(verifyKey);
      if (!secret) {
        reasons.push("SIGNATURE_KEY_MISSING");
      } else {
        const verified = await verifyInvariantPacketSignature(
          packet.packet_hash,
          packet.packet_signature!,
          secret,
        );
        if (!verified) {
          reasons.push("PACKET_SIGNATURE_INVALID");
        }
      }
    } else if (packet.signature_scheme === "hmac-sha256/v1") {
      reasons.push("MISSING_PACKET_SIGNATURE");
    }

    return {
      ok: reasons.length === 0,
      expected,
      actual: packet.packet_hash,
      reasons,
      failures: [...reasons],
    };
  },

  fromInvariantReport: async (
    report: any, // Use `any` to break circular dependency with SHIMS.ts ReplayInvariantReport type
    opts: { tick_anchor: number; witness?: string } = { tick_anchor: 0 },
  ): Promise<INVARIANT_PACKET__08_00_InvariantPacket> =>
    await INVARIANT_PACKET_INVARIANT_PACKET.seal({
      tick_anchor: opts.tick_anchor,
      witness: opts.witness,
      canon_index_chain_checked: report?.index_chain_checked === true,
      canon_index_chain_ok: report?.index_chain_ok !== false,
      gate_admission_index_chain_checked:
        report?.gate_admission_index_chain_checked === true,
      gate_admission_index_chain_ok:
        report?.gate_admission_index_chain_ok !== false,
      ledger_chain_checked: report?.ledger_chain_checked === true,
      ledger_chain_ok: report?.ledger_chain_ok === true,
    }),

  toInvariantReport: (
    packet: Partial<INVARIANT_PACKET__08_00_InvariantPacket>,
  ): any => {
    const p = canonicalInvariantPacket(packet);
    const out: Record<string, unknown> = {
      index_chain_checked: p.canon_index_chain_checked,
      index_chain_ok: p.canon_index_chain_ok,
      index_chain_checked_records: 0,
      index_chain_failures: invariantPacketFailures(
        "CANON",
        p.canon_index_chain_ok,
      ),
      gate_admission_index_chain_checked: p.gate_admission_index_chain_checked,
      gate_admission_index_chain_ok: p.gate_admission_index_chain_ok,
      gate_admission_index_chain_checked_records: 0,
      gate_admission_index_chain_failures: invariantPacketFailures(
        "GATE_ADMISSION",
        p.gate_admission_index_chain_ok,
      ),
    };
    if (p.ledger_chain_checked !== undefined) {
      out.ledger_chain_checked = p.ledger_chain_checked;
      out.ledger_chain_ok = p.ledger_chain_ok === true;
      out.ledger_chain_failures = p.ledger_chain_checked
        ? invariantPacketFailures("LEDGER", p.ledger_chain_ok === true)
        : ["INVARIANT_PACKET_LEDGER_UNCHECKED"];
    }
    return out;
  },
};
