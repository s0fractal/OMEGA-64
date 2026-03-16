---
id: P2P_FEDERATION
type: module
description: >-
  RESTORED | High-level distributed migration policies and rule-genome
  consistency.
tags:
  - membrane
  - host
min_level: 6
vars:
  - P2pFederationUpwardDelegate
deps:
  - MX
  - PRNG
  - LOGGER
  - RUNTIME_POLICY
  - P2P_CODEC
  - TYPES
---

### TypeScript

```typescript


let delegate: P2pFederationUpwardDelegate | null = null;

const CURRENT_PORT = RUNTIME_POLICY.system.port;
const FEDERATION_ENABLED = RUNTIME_POLICY.federation.enabled;
const CONTROL_TOKEN = RUNTIME_POLICY.federation.controlToken;
const REQUEST_TIMEOUT_MS = RUNTIME_POLICY.federation.timeoutMs;

const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

const RULE_PROFILE_SOURCE = JSON.stringify({
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
});

const RULE_GENOME_SIGNATURE = fnv1a32(RULE_PROFILE_SOURCE).toUpperCase();
const LOCAL_RULE_GENOME = {
  signature: RULE_GENOME_SIGNATURE,
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
  generatedAt: new Date().toISOString(),
};

const peerRuleProfiles = new Map<string, any>();

export const P2P_FEDERATION = {
  setUpwardDelegate: (newDelegate: P2pFederationUpwardDelegate) => {
    delegate = newDelegate;
  },
  peers: new Set<string>(
    CURRENT_PORT === 8000
      ? ["http://localhost:8001"]
      : ["http://localhost:8000"],
  ),
  nodeId: `OMEGA-${CURRENT_PORT}`,
  enabled: FEDERATION_ENABLED,
  localRuleGenome: LOCAL_RULE_GENOME,

  serialize: (idx: number): Uint8Array | null => {
    const id = MX.getId(idx);
    if (!id) return null;
    return P2P_CODEC.packAtom(idx);
  },

  observePeerRuleGenome: (sourceNode: string, rawProfile: any) => {
    if (!rawProfile || !rawProfile.signature) return;
    peerRuleProfiles.set(sourceNode, rawProfile);
  },

  getPeerRuleProfiles: () =>
    Array.from(peerRuleProfiles.entries()).map(([peer, profile]) => ({
      peer,
      profile,
    })),

  migrate: async (idx: number, pulseId: number) => {
    // Deprecated for Era 75: routeAtom is preferred. 
    // Kept for partial compatibility with legacy callers.
  },
};
```
