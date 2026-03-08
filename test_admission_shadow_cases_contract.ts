import {
  ADMISSION_SHADOW_CASES,
  admissionShadowCaseById,
} from "./verification/admission_shadow_cases.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = () => {
  expect(
    ADMISSION_SHADOW_CASES.length === 4,
    "[admission_shadow_cases] expected 4 initial admission shadow cases",
  );

  const ids = new Set(
    ADMISSION_SHADOW_CASES.map((definition) => definition.id),
  );
  expect(
    ids.size === ADMISSION_SHADOW_CASES.length,
    "[admission_shadow_cases] ids must be unique",
  );

  for (const definition of ADMISSION_SHADOW_CASES) {
    expect(
      definition.baselineTraceId === "gt04_plasmid_inject" ||
        definition.baselineTraceId === "gt06_daemon_admission_case" ||
        definition.baselineTraceId === "gt07_daemon_policy_block",
      `[admission_shadow_cases] unexpected baseline anchor for ${definition.id}`,
    );
    expect(
      definition.metrics.population > 0,
      `[admission_shadow_cases] population must be positive for ${definition.id}`,
    );
    expect(
      Number.isFinite(definition.metrics.avgEnergy) &&
        definition.metrics.avgEnergy > 0,
      `[admission_shadow_cases] avgEnergy must be positive for ${definition.id}`,
    );
    if (definition.envelope.action_type === "INJECT_PLASMID") {
      expect(
        typeof definition.envelope.payload.hex_code === "string" &&
          definition.envelope.payload.hex_code.length === 16,
        `[admission_shadow_cases] inject cases must carry 16-char hex for ${definition.id}`,
      );
      expect(
        definition.expected.policyOk !== null,
        `[admission_shadow_cases] inject cases must declare policy expectation for ${definition.id}`,
      );
    } else {
      expect(
        definition.expected.policyOk === null,
        `[admission_shadow_cases] non-plasmid cases must keep policy expectation null for ${definition.id}`,
      );
    }
    if (definition.expected.blocked) {
      expect(
        definition.expected.blockReason !== null,
        `[admission_shadow_cases] blocked cases must declare block reason for ${definition.id}`,
      );
      expect(
        definition.expected.severity === null,
        `[admission_shadow_cases] blocked cases must keep severity null for ${definition.id}`,
      );
    }
  }

  expect(
    admissionShadowCaseById("ac01_gt04_low_risk_accept") !== null,
    "[admission_shadow_cases] ac01 must be addressable by id",
  );
  expect(
    admissionShadowCaseById("ac03_gt06_plasmid_high_degrade") !== null,
    "[admission_shadow_cases] ac03 must be addressable by id",
  );
  expect(
    admissionShadowCaseById("ac04_gt07_plasmid_policy_block") !== null,
    "[admission_shadow_cases] ac04 must be addressable by id",
  );

  console.log(
    `[admission_shadow_cases] contract guard passed. cases=${ADMISSION_SHADOW_CASES.length}`,
  );
};

main();
