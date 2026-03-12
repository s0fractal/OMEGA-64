# i.L99.core.SENSE_PROTOCOL.md

# OMEGA-64 | Sense Protocol (Superposition + Context Gate)

Purpose:

- Allow multiple meanings to coexist without averaging.
- Resolve meaning via context, not via static token weight.

Core model:

- CanonicalId: stable node identity (address = essence).
- SenseSet: multiple interpretations bound to the same CanonicalId.
- ContextGate: selects the active sense based on context.
- AmbiguityState: when context is weak, preserve superposition.

Rules:

- Never collapse to the average of senses.
- Collapse only when ContextGate confidence is above threshold.
- If below threshold, return the SenseSet (multi-output).

Mapping:

- Sense is a projection, not an address.
- Address stays stable; sense is context-dependent.
- Context can be lexical, structural, or topological.

Why this is better than static token weights:

- Static embeddings conflate senses into a single vector.
- ContextGate preserves distinct vectors and only selects when justified.

Output:

- If context is strong: single sense.
- If context is weak: ordered list of senses with weights.
