import { INVARIANT_PACKET_INVARIANT_PACKET as INVARIANT_PACKET } from "@omega";

const SIGNING_KEY = {
  scheme: "hmac-sha256/v1",
  secret: "omega-test-signing-secret",
} as const;

async function main() {
  console.log("🧪 [TEST] Invariant packet runtime");

  const packet = await INVARIANT_PACKET.seal({
    tick_anchor: 10,
    canon_index_chain_checked: true,
    canon_index_chain_ok: true,
    gate_admission_index_chain_checked: true,
    gate_admission_index_chain_ok: true,
    ledger_chain_checked: true,
    ledger_chain_ok: true,
    witness: "runtime-test",
  });
  const verifyPacket = await INVARIANT_PACKET.verify(packet);
  if (!verifyPacket.ok) {
    throw new Error(
      `expected sealed packet to verify, got=${verifyPacket.reasons.join(",")}`,
    );
  }

  const tampered = { ...packet, canon_index_chain_ok: false };
  const verifyTampered = await INVARIANT_PACKET.verify(tampered);
  if (verifyTampered.ok) {
    throw new Error("tampered packet must fail verification");
  }
  if (!verifyTampered.reasons.includes("PACKET_HASH_MISMATCH")) {
    throw new Error(
      `expected PACKET_HASH_MISMATCH, got=${verifyTampered.reasons.join(",")}`,
    );
  }

  const signedPacket = await INVARIANT_PACKET.seal({
    tick_anchor: 11,
    canon_index_chain_checked: true,
    canon_index_chain_ok: true,
    gate_admission_index_chain_checked: true,
    gate_admission_index_chain_ok: true,
    witness: "runtime-test-signed",
  }, SIGNING_KEY);
  const verifySigned = await INVARIANT_PACKET.verify(signedPacket, SIGNING_KEY);
  if (!verifySigned.ok) {
    throw new Error(
      `signed packet should verify, got=${verifySigned.reasons.join(",")}`,
    );
  }

  const verifyWrongKey = await INVARIANT_PACKET.verify(signedPacket, {
    scheme: "hmac-sha256/v1",
    secret: "wrong-secret",
  });
  if (verifyWrongKey.ok) {
    throw new Error("signed packet must fail with wrong verification key");
  }
  if (!verifyWrongKey.reasons.includes("PACKET_SIGNATURE_INVALID")) {
    throw new Error(
      `expected PACKET_SIGNATURE_INVALID, got=${
        verifyWrongKey.reasons.join(",")
      }`,
    );
  }

  const report = INVARIANT_PACKET.toInvariantReport(packet);
  if (
    report.index_chain_ok !== true ||
    report.gate_admission_index_chain_ok !== true
  ) {
    throw new Error("toInvariantReport lost true invariants");
  }

  console.log("✅ [TEST] Invariant packet runtime verified.");
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
