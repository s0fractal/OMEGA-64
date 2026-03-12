# i.L99.core.TOPOLOGICAL_SIGNATURE_SPEC

Status: Draft\
Layer: L99\
Intent: Define a deterministic topological signature for artifacts, states, and
drift traces.

## 1. Core Statement

A topological signature is not only file integrity metadata.

It is a 3-channel anchor:

1. identity anchor (`artifact_hash`),
2. causal anchor (`causal_refs`, `tick`),
3. projection anchor (`projection_2d_hash`, `thread_1d_hash`).

This allows one artifact to be:

1. an exact portal to material state,
2. a coordinate in a causal graph,
3. a node for deterministic composition into higher abstractions.

## 2. Canonical Signature Object

```json
{
  "artifact_hash": "hex32",
  "state_hash": "hex32",
  "tick": 0,
  "causal_refs": ["hex32"],
  "projection_2d_hash": "hex32",
  "thread_1d_hash": "hex32",
  "projection_version": "topo-signature/v1",
  "witness": "optional_hex32"
}
```

Rules:

1. `artifact_hash` and `state_hash` are SHA-256 hex strings.
2. `tick` is monotonic causal position (no wall-clock requirement).
3. `causal_refs` are parent anchors for lineage/replay.
4. `projection_version` MUST be fixed for reproducible replay.

## 3. Deterministic 2D Projection Rule

Source function: `CHROMO_STATE.encode(state, options)`

Canonical options:

1. `resolution = 256`
2. `deterministic = true`
3. `noiseAmplitude = 20`
4. `noiseAlpha = 50`

Canonical seed: `seed = state.identity` (or `artifact_hash` when identity is
absent)

Process:

1. Build RGBA image via deterministic encoder options.
2. Serialize raw bytes in row-major order.
3. Compute: `projection_2d_hash = SHA-256(image_rgba_bytes)`

## 4. Deterministic 1D Thread Rule

Input: same deterministic 2D image used in Section 3.

Parameters:

1. radial bins: `R = 64`
2. angular bins: `A = 256`
3. thread length: `N = R * A = 16384`

Canonical mapping:

1. For each pixel inside the circle, compute `(rho, theta)` in normalized polar
   space.
2. Map to bin: `r_bin = floor(rho * (R - 1))` `a_bin = floor(theta * (A - 1))`
3. Index: `k = r_bin * A + a_bin`
4. Accumulate signed luminance: `L = round(((r + g + b) / 3) - 127)`
5. Saturating clamp each accumulator to `int16`.

Serialization:

1. Encode thread as Big-Endian `int16[N]`.
2. Compute: `thread_1d_hash = SHA-256(thread_i16_be_bytes)`

## 5. Drift Semantics

For this spec:

1. Raw hash bit-distance alone is not semantic distance.
2. Causal drift is evaluated on graph paths (`causal_refs`, `tick` lineage).
3. Projection drift is evaluated on stable metrics over 2D/1D projections.

Practical interpretation:

1. Hash is identity anchor.
2. Signature tuple is topological coordinate.
3. Coordinate sequence over ticks is trajectory.

## 6. Deterministic Composition Rule

To construct a new anchor from known anchors:

`compose_hash = SHA-256("compose:v1:" + left_hash + ":" + right_hash + ":" + op_id)`

Rules:

1. lexical ordering of fields is mandatory,
2. `op_id` must be explicit and versioned,
3. composed artifact must emit its own full signature object.

## 7. Acceptance Gate

A signature is valid only if:

1. replay reproduces identical `state_hash`,
2. deterministic projection reproduces identical `projection_2d_hash`,
3. deterministic threading reproduces identical `thread_1d_hash`.

Failing any check means:

1. non-determinism leak, or
2. schema/projection version mismatch.
