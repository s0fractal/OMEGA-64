// i.L99.core.O_STREAM_TAG_POLICY.ts
// OMEGA-64 | O_STREAM_TAG_POLICY (Allowed Tags)

export type TagPolicy = {
  version: string;
  allow: string[];
};

export const O_STREAM_TAG_POLICY = (): TagPolicy => ({
  version: "0.1.0",
  allow: [
    "core",
    "canon",
    "local",
    "ts",
    "rs",
    "md",
    "sh",
    "lean",
    "ui",
    "audit",
    "test",
    "visual",
    "signal",
    "energy",
    "drift",
    "policy",
  ],
});
