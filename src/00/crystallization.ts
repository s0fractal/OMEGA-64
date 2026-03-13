// OMEGA-64 | crystallization.ts
// Gate Admission & Consensus Crystallization Policy

import { stable_stringify, sha256_hex } from "../_/mod.ts";

const CRY_DATA = {
  policy: "STABLE",
  policyVersion: "crystallization/v1",
  window: 512,
  minSoftPasses: 5,
  defaultRequiredWindows: 3,
  projectionDriftMaxP95: 1024,
  projectionDriftTopLevels: 8,
  gateAdmissionOutOfPhasePressureMaxMean: 1.0,
  gateAdmissionMinCoherenceCoverage: 0.0,
  gateAdmissionTopAgents: 8,
  verifyLedgerChain: true,
};
export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG = Object.assign(
  () => CRY_DATA,
  CRY_DATA,
);

const canonicalCrystallizationPolicyPayload = (): string =>
  stable_stringify({
    policyVersion: CRY_DATA.policyVersion,
    window: CRY_DATA.window,
    minSoftPasses: CRY_DATA.minSoftPasses,
    defaultRequiredWindows: CRY_DATA.defaultRequiredWindows,
    projectionDriftMaxP95: CRY_DATA.projectionDriftMaxP95,
    projectionDriftTopLevels: CRY_DATA.projectionDriftTopLevels,
    gateAdmissionOutOfPhasePressureMaxMean:
      CRY_DATA.gateAdmissionOutOfPhasePressureMaxMean,
    gateAdmissionMinCoherenceCoverage:
      CRY_DATA.gateAdmissionMinCoherenceCoverage,
    gateAdmissionTopAgents: CRY_DATA.gateAdmissionTopAgents,
    verifyLedgerChain: CRY_DATA.verifyLedgerChain,
  });

export const CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY = {
  canonicalPayload: canonicalCrystallizationPolicyPayload,
  hash: async (): Promise<string> =>
    await sha256_hex(canonicalCrystallizationPolicyPayload()),
  verify: async (
    input?:
      | string
      | { policy_hash?: string; policy_version?: string }
      | { policyHash?: string; policyVersion?: string },
  ): Promise<boolean> => {
    const expectedHash = await CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY
      .hash();
    if (typeof input === "undefined") return true;
    if (typeof input === "string") return input === expectedHash;
    const maybeVersion = "policy_version" in input
      ? (input as any).policy_version
      : (input as any).policyVersion;
    const maybeHash = "policy_hash" in input
      ? (input as any).policy_hash
      : (input as any).policyHash;
    if (
      typeof maybeVersion === "string" &&
      maybeVersion !== CRY_DATA.policyVersion
    ) {
      return false;
    }
    if (typeof maybeHash === "string") {
      return maybeHash === expectedHash;
    }
    return true;
  },
};
