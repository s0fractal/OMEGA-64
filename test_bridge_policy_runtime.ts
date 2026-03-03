import {
  CANON_CAUSAL_BRIDGE,
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG,
  CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY,
} from "@omega";

const GREEN_REPORT = {
  index_chain_checked: true,
  index_chain_ok: true,
  gate_admission_index_chain_checked: true,
  gate_admission_index_chain_ok: true,
};

const RED_REPORT = {
  index_chain_checked: true,
  index_chain_ok: false,
  index_chain_failures: ["INDEX_CHAIN_PREV_MISMATCH_AT_LINE_2"],
  gate_admission_index_chain_checked: true,
  gate_admission_index_chain_ok: true,
};

async function main() {
  console.log("🧪 [TEST] Bridge+policy runtime");

  const localOnlyOk = CANON_CAUSAL_BRIDGE.verify(
    { bridge_invariant_report: RED_REPORT },
    [{ proposal_id: "p_local", target_path: "LOCAL" }],
  );
  if (!localOnlyOk) {
    throw new Error("local-only proposals must pass bridge verify");
  }

  const canonBlocked = CANON_CAUSAL_BRIDGE.verify(
    { bridge_invariant_report: RED_REPORT },
    [{ proposal_id: "p_canon", target_path: "CANON" }],
  );
  if (canonBlocked) {
    throw new Error("canon proposal must fail in RED mode");
  }

  const canonAllowed = CANON_CAUSAL_BRIDGE.verify(
    { bridge_invariant_report: GREEN_REPORT },
    [{ proposal_id: "p_canon_green", target_path: "CANON" }],
  );
  if (!canonAllowed) {
    throw new Error("canon proposal must pass in GREEN mode");
  }

  const policyHash = await CRYSTALLIZATION_POLICY.hash();
  const verifyByHash = await CRYSTALLIZATION_POLICY.verify(policyHash);
  if (!verifyByHash) {
    throw new Error("policy hash verification failed");
  }

  const verifyByEnvelope = await CRYSTALLIZATION_POLICY.verify({
    policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
    policy_hash: policyHash,
  });
  if (!verifyByEnvelope) {
    throw new Error("policy envelope verification failed");
  }

  const verifyWrongHash = await CRYSTALLIZATION_POLICY.verify({
    policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
    policy_hash: "f".repeat(64),
  });
  if (verifyWrongHash) {
    throw new Error("wrong policy hash must fail");
  }

  const verifyWrongVersion = await CRYSTALLIZATION_POLICY.verify({
    policy_version: "crystallization/v2",
    policy_hash: policyHash,
  });
  if (verifyWrongVersion) {
    throw new Error("wrong policy version must fail");
  }

  console.log("✅ [TEST] Bridge+policy runtime verified.");
}

main().catch((err) => {
  console.error("❌ [TEST]", err);
  Deno.exit(1);
});
