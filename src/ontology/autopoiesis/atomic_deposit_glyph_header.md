---
id: atomic_deposit_glyph_header
type: pure_fn
dataType: null
returns: void
level: 1
args:
  baseOffset: usize
  cell: i32
  kind: i32
  amplitude: i32
  payloadPtr: usize
vars:
  - GRID_CELLS
  - GLYPH_HEADER_OFF
  - GLYPH_PAYLOAD_OFF
  - GLYPH_SCRATCH_PAYLOAD_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - unpack_glyph_kind
  - unpack_glyph_amplitude
  - fast_abs
  - pack_glyph_header
description: Auto-recovered atomic_deposit_glyph_header
---

---
---

```rust
unimplemented!()
```

```typescript
if (amplitude == 0 || cell < 0 || cell >= (GRID_CELLS as i32)) return;

const ptr = (baseOffset + (cell << 2)) as usize;

for (let spin = 0; spin < 128; spin++) {
  const current = atomic.load<i32>(ptr);
  const currentKind = unpack_glyph_kind(current);
  const currentAmplitude = unpack_glyph_amplitude(current);

  // Mismatched kind: standard replacement strategy but with absolute power checks
  if (currentKind != 0 && currentKind != kind) {
    if (fast_abs(amplitude) <= fast_abs(currentAmplitude)) return;
    const observed = atomic.cmpxchg<i32>(
      ptr,
      current,
      pack_glyph_header(kind, amplitude),
    );
    if (observed == current) {
      if (kind == 2 && payloadPtr != 0) {
        const payloadBase = baseOffset == GLYPH_HEADER_OFF
          ? GLYPH_PAYLOAD_OFF
          : GLYPH_SCRATCH_PAYLOAD_OFF;
        const dstPtr = payloadBase + (cell << 3) as usize;
        memory.copy(dstPtr, payloadPtr, 8);
      }
      return;
    }
    continue;
  }

  // Matching kind: Optical Wave Interference (Additive)
  let nextAmplitude = currentAmplitude + amplitude;
  if (nextAmplitude > 12000) nextAmplitude = 12000;
  if (nextAmplitude < -12000) nextAmplitude = -12000;

  // If waves perfectly annihilate, clear the glyph entirely
  const nextKind = nextAmplitude == 0 ? 0 : kind;

  const observed = atomic.cmpxchg<i32>(
    ptr,
    current,
    pack_glyph_header(nextKind, nextAmplitude),
  );
  if (observed == current) {
    if (kind == 2 && payloadPtr != 0) {
      // Technically if nextAmplitude is 0, payload is orphaned, but acceptable
      const payloadBase = baseOffset == GLYPH_HEADER_OFF
        ? GLYPH_PAYLOAD_OFF
        : GLYPH_SCRATCH_PAYLOAD_OFF;
      const dstPtr = payloadBase + (cell << 3) as usize;
      memory.copy(dstPtr, payloadPtr, 8);
    }
    return;
  }
}
```

```assemblyscript
if (amplitude == 0 || cell < 0 || cell >= (GRID_CELLS as i32)) return;

const ptr = (baseOffset + (cell << 2)) as usize;

for (let spin = 0; spin < 128; spin++) {
  const current = atomic.load<i32>(ptr);
  const currentKind = unpack_glyph_kind(current);
  const currentAmplitude = unpack_glyph_amplitude(current);

  // Mismatched kind: standard replacement strategy but with absolute power checks
  if (currentKind != 0 && currentKind != kind) {
    if (fast_abs(amplitude) <= fast_abs(currentAmplitude)) return;
    const observed = atomic.cmpxchg<i32>(
      ptr,
      current,
      pack_glyph_header(kind, amplitude),
    );
    if (observed == current) {
      if (kind == 2 && payloadPtr != 0) {
        const payloadBase = baseOffset == GLYPH_HEADER_OFF
          ? GLYPH_PAYLOAD_OFF
          : GLYPH_SCRATCH_PAYLOAD_OFF;
        const dstPtr = payloadBase + (cell << 3) as usize;
        memory.copy(dstPtr, payloadPtr, 8);
      }
      return;
    }
    continue;
  }

  // Matching kind: Optical Wave Interference (Additive)
  let nextAmplitude = currentAmplitude + amplitude;
  if (nextAmplitude > 12000) nextAmplitude = 12000;
  if (nextAmplitude < -12000) nextAmplitude = -12000;

  // If waves perfectly annihilate, clear the glyph entirely
  const nextKind = nextAmplitude == 0 ? 0 : kind;

  const observed = atomic.cmpxchg<i32>(
    ptr,
    current,
    pack_glyph_header(nextKind, nextAmplitude),
  );
  if (observed == current) {
    if (kind == 2 && payloadPtr != 0) {
      // Technically if nextAmplitude is 0, payload is orphaned, but acceptable
      const payloadBase = baseOffset == GLYPH_HEADER_OFF
        ? GLYPH_PAYLOAD_OFF
        : GLYPH_SCRATCH_PAYLOAD_OFF;
      const dstPtr = payloadBase + (cell << 3) as usize;
      memory.copy(dstPtr, payloadPtr, 8);
    }
    return;
  }
}
```
