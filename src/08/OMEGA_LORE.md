# OMEGA-64 | ARCHITECTURE LORE (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-13T15:41:28.821Z*
*Exported Files in Category: 121*
*Total Exported Files: 507*
*Runtime Roots: 10*
*Runtime Closure Files: 318*
*Non-Runtime Code Files: 68*
*Runtime-Support Code Files: 10*
*Experimental Code Files: 58*
*Manifest SHA256: 39b9ee6963a688da2ecdc24e66b2f51b41a8b035978a4bc3a418688653156c74*
*Export Set SHA256: 1195bde2bb124a617253afa4d3ade8414b7ad212de57c355b4230e24d39b455f*
*Export Content SHA256: 6db052e48ef8b3ff59b98af14516d05736a6202a6337f09e01072f7d9f92f75b*
*Git Commit: 43142f83b3d3*

---

## FILE: src/ontology/autopoiesis/accumulate_metabolism_stats.md

```markdown
---
id: accumulate_metabolism_stats
type: pure_fn
dataType: null
returns: void
level: 1
args:
  startIdx: i32
  endIdx: i32
vars:
  - IDS_OFFSET
  - METABOLISM_SCRATCH_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - genome_key16
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const key = genome_key16(i);
    // Atomic add to genome frequency map in scratch space
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (key << 2), 1);
    // Atomic add to global population counter (scratch end)
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4), 1);
  }
```

```

---

## FILE: src/ontology/autopoiesis/apply_metabolism_kernel.md

```markdown
---
id: apply_metabolism_kernel
type: pure_fn
dataType: null
returns: void
level: 1
args:
  startIdx: i32
  endIdx: i32
  noveltySigned: i32
  symbiosisSigned: i32
  baseTax: i32
  targetEnergy: i32
  homeostasisBand: i32
  homeostasisMaxDelta: i32
  overflowThreshold: i32
  spatialOverflowRatio: i32
  starvationFloor: i32
  subsidyEnabled: i32
vars:
  - METABOLISM_SCRATCH_OFFSET
  - IDS_OFFSET
  - ROLES_OFFSET
  - RESONANCE_OFFSET
  - CONTEXT_OFFSET
  - XS_OFFSET
  - YS_OFFSET
  - SPATIAL_CELL_SIZE
  - GRID_W
  - STRUCTURE_GRID_OFF
  - MEMORY_GRID_OFF
  - MAX_ATOMS
  - ENERGY_OFFSET
  - BONDS_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - get_energy
  - set_energy
  - genome_key16
  - fast_abs
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  const population = atomic.load<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4) as usize);
  if (population == 0) return;

  const overflowActive = spatialOverflowRatio >= overflowThreshold;
  const bandStep = i32(Math.max(1, Math.floor(homeostasisBand / 2)));
  const bondPolarity = symbiosisSigned >= 0 ? 1 : -1;

  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const current = get_energy(i);

    // --- PHASE 43: FOSSILIZATION & NECROPOLIS ---
    // If atom is dead (energy <= 0), fossilize it before skipping metabolism
    if (current <= 0) {
      let resonance = atomic.load<i32>(RESONANCE_OFFSET + (i << 2) as usize);
      let roleRaw = atomic.load<u8>(ROLES_OFFSET + i as usize);
      let role = roleRaw & 0x7F; // Strip metazoan flag
      
      let ctx13 = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 13) << 2) as usize);
      let ctx14 = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 14) << 2) as usize);
      let hasImmunity = ctx13 != 0 || ctx14 != 0;

      let cx = atomic.load<i16>(XS_OFFSET + (i << 1) as usize) as i32;
      let cy = atomic.load<i16>(YS_OFFSET + (i << 1) as usize) as i32;
      let gx = cx / SPATIAL_CELL_SIZE;
      let gy = cy / SPATIAL_CELL_SIZE;
      let cellIdx = gy * GRID_W + gx;

      // Only attempt fossilization if it has a qualifying property
      // 2 = ROLE_GUARDIAN, 3 = ROLE_ARCHITECT
      if (resonance > 100 || role == 2 || role == 3 || hasImmunity) {

        let structVal: i32 = 0;
        if (role == 2) {
            structVal = 1 | (150 << 16); // STR_WIRE = 1
        } else if (role == 3) {
            structVal = 1 | (100 << 16);
        }

        if (structVal != 0) {
            atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2) as usize, structVal);
        }

        // Epigenetic memory spillage
        let memOff = MEMORY_GRID_OFF + (cellIdx << 3) as usize;
        
        // Spilled CRISPR Hash (Reg 13) into bytes 4,5,6,7 in Big-Endian for test
        atomic.store<u8>(memOff + 4, (ctx13 >>> 24) as u8);
        atomic.store<u8>(memOff + 5, (ctx13 >>> 16) as u8);
        atomic.store<u8>(memOff + 6, (ctx13 >>> 8) as u8);
        atomic.store<u8>(memOff + 7, (ctx13) as u8);
        
        // Bootstrapping memory charge for Plasmid decay (bytes 0,1,2 in Little-Endian for test)
        let bootCharge = 100;
        atomic.store<u8>(memOff + 0, (bootCharge & 0xFF) as u8);
        atomic.store<u8>(memOff + 1, ((bootCharge >>> 8) & 0xFF) as u8);
        atomic.store<u8>(memOff + 2, ((bootCharge >>> 16) & 0xFF) as u8);

        // Neutralize resonance and role so IMMUNE.ts phagocyte immediately purges this necrotic corpse
        atomic.store<i32>(RESONANCE_OFFSET + (i << 2) as usize, 0);
        atomic.store<u8>(ROLES_OFFSET + i as usize, 0);
        atomic.store<i32>(CONTEXT_OFFSET + ((i * 16 + 13) << 2) as usize, 0);
        atomic.store<i32>(CONTEXT_OFFSET + ((i * 16 + 14) << 2) as usize, 0);
      }
      continue;
    }

    // --- PHASE 44: ENDOSYMBIOSIS ---
    let roleRaw = atomic.load<u8>(ROLES_OFFSET + i as usize);
    let role = roleRaw & 0x7F; // Strip metazoan flag
    if (role == 5) { // ROLE_MITOCHONDRIA
      let hostId = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 12) << 2) as usize);
      if (hostId > 0 && hostId < MAX_ATOMS && atomic.load<i64>(IDS_OFFSET + (hostId << 3) as usize) != 0) {
        // Enforce Coordinate Lock
        let hx = atomic.load<i16>(XS_OFFSET + (hostId << 1) as usize);
        let hy = atomic.load<i16>(YS_OFFSET + (hostId << 1) as usize);
        atomic.store<i16>(XS_OFFSET + (i << 1) as usize, hx);
        atomic.store<i16>(YS_OFFSET + (i << 1) as usize, hy);

        // Pay up 90% of excess energy to Host
        if (current > starvationFloor) {
          let transfer = i32(Math.floor(f64(current - starvationFloor) * 0.9));
          if (transfer > 0) {
            atomic.add<i32>(ENERGY_OFFSET + (hostId << 2) as usize, transfer);
            set_energy(i, current - transfer);
          }
        }
      } else {
        // Host died. Mitochondria perishes.
        set_energy(i, 0);
        atomic.store<i64>(IDS_OFFSET + (i << 3) as usize, 0);
      }
      continue; // Skip entropy tax and standard homeostasis
    }

    const key = genome_key16(i);
    const sameGenomeCount = atomic.load<i32>(
      METABOLISM_SCRATCH_OFFSET + (key << 2) as usize,
    );

    let delta: i32 = 0;

    // Pass 1: Evolution Pressure (Novelty + Symbiosis)
    if (noveltySigned != 0) {
      let noveltyTerm = (noveltySigned * (population - (sameGenomeCount * 2))) /
        population;
      delta += noveltyTerm;
    }

    if (symbiosisSigned != 0) {
      const base = i * 4;
      let crossGenomeBonds = 0;
      for (let slot = 0; slot < 4; slot++) {
        const target = atomic.load<i32>(
          BONDS_OFFSET + ((base + slot) << 2) as usize,
        );
        if (target <= 0 || target >= MAX_ATOMS) continue;
        if (atomic.load<i64>(IDS_OFFSET + (target << 3) as usize) == 0) {
          continue;
        }
        if (genome_key16(target) != key) crossGenomeBonds++;
      }
      delta += crossGenomeBonds > 0
        ? symbiosisSigned * crossGenomeBonds
        : bondPolarity * -symbiosisSigned;
    }

    // 2. Homeostasis
    // Match sequential logic: Homeostasis sees energy AFTER evolution pressure
    const interimEnergy = i32(Math.max(0.0, f64(current) + f64(delta)));

    if (baseTax > 0 && interimEnergy > starvationFloor) {
      let tax = Math.min(baseTax as f64, interimEnergy as f64) as i32;
      delta -= tax;
    }

    const deviation = interimEnergy - targetEnergy;
    const absDeviation = fast_abs(deviation);

    if (absDeviation > homeostasisBand) {
      const gradient = absDeviation - homeostasisBand;
      const step = i32(Math.min(
        homeostasisMaxDelta,
        1 + Math.floor(gradient / bandStep),
      ));

      if (deviation > 0) {
        delta -= step;
        if (overflowActive) delta -= 1;
      } else if (subsidyEnabled) {
        let subsidy = step;
        if (overflowActive) {
          subsidy = i32(Math.max(1, Math.floor(f32(subsidy) * 0.6)));
        }
        delta += subsidy;
      }
    }

    // Starvation Floor Guard (using interim energy for sequential match)
    if (interimEnergy <= starvationFloor && delta < 0) {
      // If we are at or below floor after evolution pressure,
      // block any further downward delta from homeostasis/tax.
      // But we should subtract what was already added in Pass 1 if it was negative?
      // Legacy logic in test: if (current <= starvationFloor && delta < 0) delta = 0;
      // where current is energy after Pass 1.
      // This means Pass 2 delta becomes 0.

      // To match exactly:
      const pass2Delta = delta - (interimEnergy - current);
      if (pass2Delta < 0) {
        delta = interimEnergy - current;
      }
    }

    if (delta != 0) {
      let next = i32(Math.max(0.0, f64(current) + f64(delta)));
      if (next != current) {
        set_energy(i, next);
        // Track stats for telemetry
        atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4) + 4 as usize, 1);
        atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4) + 8 as usize, delta);
      }
    }
  }
```

```

---

## FILE: src/ontology/autopoiesis/atomic_deposit_glyph_header.md

```markdown
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

```

---

## FILE: src/ontology/autopoiesis/clear_metabolism_stats.md

```markdown
---
id: clear_metabolism_stats
type: pure_fn
dataType: null
returns: void
level: 1
args: {}
vars:
  - METABOLISM_SCRATCH_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  // Clear genome count scratch (65536 * 4 bytes = 256KB)
  // and generic stats (population, noveltyDelta, symbiosisDelta, etc)
  memory.fill(METABOLISM_SCRATCH_OFFSET, 0, (65536 * 4) + 64);
```

```

---

## FILE: src/ontology/autopoiesis/clear_secretion_stats.md

```markdown
---
id: clear_secretion_stats
type: pure_fn
dataType: null
returns: void
level: 1
args: {}
vars:
  - SECRETION_STATS_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  memory.fill(SECRETION_STATS_OFF, 0, 48); // Ensure we clear all 12 I32 slots
```

```

---

## FILE: src/ontology/autopoiesis/decay_for_kind.md

```markdown
---
id: decay_for_kind
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  kind: i32
  amplitude: i32
vars:
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - fast_abs
description: Auto-recovered decay_for_kind
---

---
---

```rust
unimplemented!()
```

```typescript
const absAmp = fast_abs(amplitude);
let decayAmt = 0;
if (kind == 2) { // PLASMID
  decayAmt = absAmp > 256 ? 3 : 1;
} else if (kind == 1) { // PHEROMONE
  decayAmt = absAmp > 64 ? 8 : 4;
} else {
  decayAmt = absAmp; // Fallback
}
return amplitude > 0 ? decayAmt : -decayAmt;
```

```assemblyscript
const absAmp = fast_abs(amplitude);
let decayAmt = 0;
if (kind == 2) { // PLASMID
  decayAmt = absAmp > 256 ? 3 : 1;
} else if (kind == 1) { // PHEROMONE
  decayAmt = absAmp > 64 ? 8 : 4;
} else {
  decayAmt = absAmp; // Fallback
}
return amplitude > 0 ? decayAmt : -decayAmt;
```

```

---

## FILE: src/ontology/autopoiesis/diffuse_viral_semantics.md

```markdown
---
id: diffuse_viral_semantics
type: pure_fn
dataType: null
returns: void
level: 1
args:
  pulseId: i32
vars:
  - GRID_H
  - GRID_W
  - SIGNAL_GRID_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - in_grid
  - prng_next
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  let state = pulseId as u32;

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const idx = (y * GRID_W + x) * 9;
      const targetOff = SIGNAL_GRID_OFF + (idx as usize);
      const intensity = atomic.load<u8>(targetOff + 8 as usize);
      if (intensity == 0) continue;

      // 1. DECAY
      const nextIntensity = intensity > 2 ? intensity - 2 : 0;
      atomic.store<u8>(targetOff + 8 as usize, nextIntensity);

      // 2. DIFFUSE (Deterministic chance to spread logic to neighbors)
      state = prng_next(state);
      const v1 = (state as f32) / (0xFFFFFFFF as f32);

      if (intensity > 150 && v1 < 0.1) {
        state = prng_next(state);
        const v2 = (state as f32) / (0xFFFFFFFF as f32);
        state = prng_next(state);
        const v3 = (state as f32) / (0xFFFFFFFF as f32);

        const nx = x + (v2 > 0.5 ? 1 : -1);
        const ny = y + (v3 > 0.5 ? 1 : -1);

        if (in_grid(nx, ny)) {
          const nIdx = (ny * GRID_W + nx) * 9;
          const nTargetOff = SIGNAL_GRID_OFF + (nIdx as usize);
          const nIntensity = atomic.load<u8>(nTargetOff + 8 as usize);

          if (nIntensity < (intensity >> 1)) {
            // Copy logic and part of intensity
            for (let b: usize = 0; b < 8; b++) {
              const logicByte = atomic.load<u8>(targetOff + b as usize);
              atomic.store<u8>(nTargetOff + b as usize, logicByte);
            }
            atomic.store<u8>(nTargetOff + 8 as usize, (intensity >> 1) as u8);
          }
        }
      }
    }
  }
```

```

---

## FILE: src/ontology/autopoiesis/diffusion_share_for_kind.md

```markdown
---
id: diffusion_share_for_kind
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  kind: i32
  amplitude: i32
vars:
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - fast_abs
description: Auto-recovered diffusion_share_for_kind
---

---
---

```rust
unimplemented!()
```

```typescript
const absAmp = fast_abs(amplitude);
let shareAmt = 0;
if (kind == 2) { // PLASMID
  shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
} else if (kind == 1) { // PHEROMONE
  shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
}
return amplitude > 0 ? shareAmt : -shareAmt;
```

```assemblyscript
const absAmp = fast_abs(amplitude);
let shareAmt = 0;
if (kind == 2) { // PLASMID
  shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
} else if (kind == 1) { // PHEROMONE
  shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
}
return amplitude > 0 ? shareAmt : -shareAmt;
```

```

---

## FILE: src/ontology/autopoiesis/drain_spawn_requests.md

```markdown
---
id: drain_spawn_requests
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  tick: i32
vars:
  - SPAWN_HEAD_OFF
  - SPAWN_DATA_OFF
  - SPAWN_MAX
  - SPAWN_SLOT
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - find_next_free_slot
  - seed_atom
description: Auto-recovered drain_spawn_requests
---

---
---

```rust
unimplemented!()
```

```typescript
const writeHead = atomic.load<i32>(SPAWN_HEAD_OFF);
const readHead = atomic.load<i32>(SPAWN_HEAD_OFF + 4);

let cursor = readHead;
const writeCursor = writeHead; // Don't modulo here, we modulo access
let spawned: i32 = 0;
let freeSearchCursor: i32 = 0;

while (cursor != writeCursor && spawned < 64) {
  const slotOff = SPAWN_DATA_OFF +
    ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;
  const gLo = load<i32>(slotOff);
  if (gLo != 0) {
    const cx = load<i16>(slotOff + 8) as i32;
    const cy = load<i16>(slotOff + 10) as i32;
    const energyScaled = load<i32>(slotOff + 12);

    const freeIdx = find_next_free_slot(freeSearchCursor);
    if (freeIdx != -1) {
      const childId = (tick as i64) << 32 | (freeIdx as i64);
      seed_atom(
        freeIdx,
        childId,
        cx,
        cy,
        energyScaled,
        100,
        slotOff,
        slotOff + 16,
      );
      freeSearchCursor = (freeIdx + 1) % MAX_ATOMS;
    }
  }
  cursor++;
  spawned++;
}

atomic.store<i32>(SPAWN_HEAD_OFF + 4, cursor);
return spawned;
```

```assemblyscript
const writeHead = atomic.load<i32>(SPAWN_HEAD_OFF);
const readHead = atomic.load<i32>(SPAWN_HEAD_OFF + 4);

let cursor = readHead;
const writeCursor = writeHead; // Don't modulo here, we modulo access
let spawned: i32 = 0;
let freeSearchCursor: i32 = 0;

while (cursor != writeCursor && spawned < 64) {
  const slotOff = SPAWN_DATA_OFF +
    ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;
  const gLo = load<i32>(slotOff);
  if (gLo != 0) {
    const cx = load<i16>(slotOff + 8) as i32;
    const cy = load<i16>(slotOff + 10) as i32;
    const energyScaled = load<i32>(slotOff + 12);

    const freeIdx = find_next_free_slot(freeSearchCursor);
    if (freeIdx != -1) {
      const childId = (tick as i64) << 32 | (freeIdx as i64);
      seed_atom(
        freeIdx,
        childId,
        cx,
        cy,
        energyScaled,
        100,
        slotOff,
        slotOff + 16,
      );
      freeSearchCursor = (freeIdx + 1) % MAX_ATOMS;
    }
  }
  cursor++;
  spawned++;
}

atomic.store<i32>(SPAWN_HEAD_OFF + 4, cursor);
return spawned;
```

```

---

## FILE: src/ontology/autopoiesis/find_next_free_slot.md

```markdown
---
id: find_next_free_slot
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  start: i32
vars:
  - MAX_ATOMS
  - IDS_OFFSET
description: Auto-recovered find_next_free_slot
deps:
  - SYSTEM_CONSTANTS
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
for (let i = 0; i < MAX_ATOMS; i++) {
  const idx = (start + i) % MAX_ATOMS;
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  if (load<i64>(idPtr) == 0) return idx;
}
return -1;
```

```assemblyscript
for (let i = 0; i < MAX_ATOMS; i++) {
  const idx = (start + i) % MAX_ATOMS;
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  if (load<i64>(idPtr) == 0) return idx;
}
return -1;
```

```

---

## FILE: src/ontology/autopoiesis/get_neural_coherence.md

```markdown
---
id: get_neural_coherence
type: pure_fn
dataType: i32
returns: i32
level: 1
args: {}
vars:
  - GRID_CELLS
  - STRUCTURE_GRID_OFF
  - MEMORY_GRID_OFF
  - COHERENCE_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - trace_atom
  - GRID_METRICS
---

---
---

```rust
unimplemented!()
```

```typescript
// Unimplemented TS mock for standalone build
return 0;
```

```assemblyscript
  // Crystal type constants
  const CRYSTAL_OSCILLATOR: i32 = 5;

  let totalAmplitude: i32 = 0;
  let oscillatorCount: i32 = 0;

  for (let i = 0; i < (GRID_CELLS as i32); i++) {
    const cVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2) as usize);
    const cType = cVal & 0xFF;
    if (cType == CRYSTAL_OSCILLATOR) {
      // Read amplitude counter from memoryGrid (low 32 bits)
      const ampOff: usize = MEMORY_GRID_OFF + (i << 3) as usize;
      const amp = load<u32>(ampOff);
      totalAmplitude += amp as i32;
      oscillatorCount++;
    }
  }

  // Coherence = average amplitude across all oscillators (capped at 2000)
  let oscCoherence: i32 = 0;
  if (oscillatorCount > 0) {
    oscCoherence = totalAmplitude / oscillatorCount;
    if (oscCoherence > 2000) oscCoherence = 2000;
  }

  // Vector 10: Unify with OP_SIGNAL accumulator
  let signalSignals = atomic.load<i32>(COHERENCE_OFF as usize);
  trace_atom(8888, 111, signalSignals, 0, 0);

  return oscCoherence + signalSignals;
```

```

---

## FILE: src/ontology/autopoiesis/glyph_transport.md

```markdown
---
id: glyph_transport
type: pure_fn
dataType: null
returns: void
level: 1
args:
  tick: i32
vars:
  - GRID_CELLS
  - GLYPH_HEADER_OFF
  - GLYPH_PAYLOAD_OFF
  - GLYPH_SCRATCH_PAYLOAD_OFF
  - GLYPH_SCRATCH_HEADER_OFF
  - GRID_W
  - SIGNAL_GRID_OFF
  - SECRETION_STATS_OFF
  - MEMORY_GRID_OFF
deps:
  - atomic_deposit_glyph_header
  - diffusion_share_for_kind
  - decay_for_kind
  - pack_glyph_header
  - unpack_glyph_amplitude
  - unpack_glyph_kind
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - fast_abs
  - fast_max
  - fast_min
  - in_grid
description: Auto-recovered glyph_transport
---

---
---

```rust
unimplemented!()
```

```typescript

// Sampling grid for internal reflection (Stage 5.1/5.2)
  memory.fill(GLYPH_SCRATCH_HEADER_OFF, 0, (GRID_CELLS) << 2);

  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  for (let cell = 0; cell < (GRID_CELLS as i32); cell++) {
    const header = load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
    if (header == 0) continue;

    const kind = unpack_glyph_kind(header);
    const amp = unpack_glyph_amplitude(header);
    if (amp == 0) continue;

    const decay = decay_for_kind(kind, amp);

    // Bidirectional Decay (pull towards zero)
    let retained = 0;
    if (amp > 0) {
      retained = amp - decay;
      retained = fast_max(retained, 0);
    } else {
      retained = amp - decay; // decay is negative when amp is negative
      retained = fast_min(retained, 0);
    }

    if (fast_abs(retained) > 0) {
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, kind, retained, 0);
      if (kind == 2) { // PLASMID payload persistence
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (cell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }

    const share = diffusion_share_for_kind(kind, amp);
    if (fast_abs(share) > 0) {
      const gx = cell % GRID_W;
      const gy = cell / GRID_W;

      for (let i = 0; i < 4; i++) {
        let nx = gx + dx[i];
        let ny = gy + dy[i];
        if (in_grid(nx, ny)) {
          const nextCell = ny * GRID_W + nx;
          atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, nextCell, kind, share, 0);

          if (share >= 128 || share <= -128) {
            const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
            const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (nextCell << 3) as usize;
            memory.copy(dstPtr, srcPtr, 8);
          }
        }
      }
    }
  }

  // 2. Seeding: Internal Reflection (Signal -> Pheromone)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const signal = atomic.load<i32>(SIGNAL_GRID_OFF + (cell << 2) as usize);
    const absSignal = fast_abs(signal);
    if (absSignal >= 1) {
      let amp = absSignal >> 1;
      if (amp < 16) amp = 16;
      if (amp > 512) amp = 512;
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, 1, amp, 0);
      // Quantification (Stage 5.1/5.2) - sample-based to avoid overflow
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 40, 1); // Signal leak counter
      }
    }
  }

  // 3. Seeding: Internal Reflection (Memory -> Plasmid)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const memOffset = MEMORY_GRID_OFF + (cell << 3) as usize;
    const memoryLo = atomic.load<u32>(memOffset);
    const charge = memoryLo & 0xFFFFFF; // 24-bit charge

    if (charge >= 1) {
      let amp = charge >> 2;
      if (amp < 24) amp = 24;
      if (amp > 384) amp = 384;
      atomic_deposit_glyph_header(
        GLYPH_SCRATCH_HEADER_OFF,
        cell,
        2,
        amp,
        memOffset,
      );
      // Quantification
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 44, 1); // Memory leak counter
      }
    }
  }

  memory.copy(GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, GRID_CELLS << 3);
  memory.copy(GLYPH_HEADER_OFF, GLYPH_SCRATCH_HEADER_OFF, GRID_CELLS << 2);
```

```assemblyscript

// Sampling grid for internal reflection (Stage 5.1/5.2)
  memory.fill(GLYPH_SCRATCH_HEADER_OFF, 0, (GRID_CELLS) << 2);

  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  for (let cell = 0; cell < (GRID_CELLS as i32); cell++) {
    const header = load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
    if (header == 0) continue;

    const kind = unpack_glyph_kind(header);
    const amp = unpack_glyph_amplitude(header);
    if (amp == 0) continue;

    const decay = decay_for_kind(kind, amp);

    // Bidirectional Decay (pull towards zero)
    let retained = 0;
    if (amp > 0) {
      retained = amp - decay;
      retained = fast_max(retained, 0);
    } else {
      retained = amp - decay; // decay is negative when amp is negative
      retained = fast_min(retained, 0);
    }

    if (fast_abs(retained) > 0) {
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, kind, retained, 0);
      if (kind == 2) { // PLASMID payload persistence
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (cell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }

    const share = diffusion_share_for_kind(kind, amp);
    if (fast_abs(share) > 0) {
      const gx = cell % GRID_W;
      const gy = cell / GRID_W;

      for (let i = 0; i < 4; i++) {
        let nx = gx + dx[i];
        let ny = gy + dy[i];
        if (in_grid(nx, ny)) {
          const nextCell = ny * GRID_W + nx;
          atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, nextCell, kind, share, 0);

          if (share >= 128 || share <= -128) {
            const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
            const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (nextCell << 3) as usize;
            memory.copy(dstPtr, srcPtr, 8);
          }
        }
      }
    }
  }

  // 2. Seeding: Internal Reflection (Signal -> Pheromone)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const signal = atomic.load<i32>(SIGNAL_GRID_OFF + (cell << 2) as usize);
    const absSignal = fast_abs(signal);
    if (absSignal >= 1) {
      let amp = absSignal >> 1;
      if (amp < 16) amp = 16;
      if (amp > 512) amp = 512;
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, 1, amp, 0);
      // Quantification (Stage 5.1/5.2) - sample-based to avoid overflow
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 40, 1); // Signal leak counter
      }
    }
  }

  // 3. Seeding: Internal Reflection (Memory -> Plasmid)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const memOffset = MEMORY_GRID_OFF + (cell << 3) as usize;
    const memoryLo = atomic.load<u32>(memOffset);
    const charge = memoryLo & 0xFFFFFF; // 24-bit charge

    if (charge >= 1) {
      let amp = charge >> 2;
      if (amp < 24) amp = 24;
      if (amp > 384) amp = 384;
      atomic_deposit_glyph_header(
        GLYPH_SCRATCH_HEADER_OFF,
        cell,
        2,
        amp,
        memOffset,
      );
      // Quantification
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 44, 1); // Memory leak counter
      }
    }
  }

  memory.copy(GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, GRID_CELLS << 3);
  memory.copy(GLYPH_HEADER_OFF, GLYPH_SCRATCH_HEADER_OFF, GRID_CELLS << 2);
```

```

---

## FILE: src/ontology/autopoiesis/pack_glyph_header.md

```markdown
---
id: pack_glyph_header
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  kind: i32
  amplitude: i32
description: Auto-recovered pack_glyph_header
---

---
---

```rust
unimplemented!()
```

```typescript
if (amplitude < -12000) amplitude = -12000;
if (amplitude > 12000) amplitude = 12000;
return (amplitude << 8) | (kind & 0xFF);
```

```assemblyscript
if (amplitude < -12000) amplitude = -12000;
if (amplitude > 12000) amplitude = 12000;
return (amplitude << 8) | (kind & 0xFF);
```

```

---

## FILE: src/ontology/autopoiesis/reset_neural_coherence.md

```markdown
---
id: reset_neural_coherence
type: pure_fn
dataType: null
returns: void
level: 1
args: {}
vars:
  - COHERENCE_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  atomic.store<i32>(COHERENCE_OFF as usize, 0); // Reset accumulator
```

```

---

## FILE: src/ontology/autopoiesis/secrete_glyph.md

```markdown
---
id: secrete_glyph
type: pure_fn
dataType: null
returns: void
level: 1
args:
  atomIdx: i32
  x: i32
  y: i32
  kind: u8
  role: u8
  intensity: i32
vars:
  - SPATIAL_CELL_SIZE
  - GRID_W
  - GRID_H
  - SECRETION_STATS_OFF
  - PHEROMONE_COST_BASE
  - PLASMID_COST_BASE
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_energy
  - set_energy
description: Auto-recovered secrete_glyph
---

---
---

```rust
unimplemented!()
```

```typescript
if (intensity <= 0) return;
  const gx = x / SPATIAL_CELL_SIZE;
  const gy = y / SPATIAL_CELL_SIZE;
  if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return;

  const cell = gy * GRID_W + gx;

  // Telemetry: increment role-based atomic counter
  if (kind >= 1 && kind <= 2 && role <= 4) {
    const statPtr = SECRETION_STATS_OFF +
      (((kind - 1) * 5 + (role as i32)) << 2) as usize;
    atomic.add<i32>(statPtr, 1);
  }

  // Energy Cost
  if (atomIdx >= 0) {
    let cost: i32 = 0;
    if (kind == 1) cost = PHEROMONE_COST_BASE + (intensity >> 3);
    else if (kind == 2) cost = PLASMID_COST_BASE + (intensity >> 2);

    if (cost > 0) {
      const currentEnergy = get_energy(atomIdx);
      set_energy(atomIdx, currentEnergy - cost);
    }
  }

  // Role-based Phase Imprinting (Parasite = Destructive, Sys/Prod = Constructive)
  const isDestructive = role == 4;
  const phaseIntensity = isDestructive ? -intensity : intensity;

  // Requires atomicDepositGlyphHeader from glyph_transport
  // build_ontology currently groups all under the same AS/TS file per level, 
  // but let's export it uniquely from glyph_transport or ensure it's inline.
  // We'll rely on the facade exposing `atomicDepositGlyphHeader` if we extract it,
  // or we need to inline it. Since AssemblyScript doesn't perfectly hoist internal non-exported fns across modules unless exported,
  // we either export `atomicDepositGlyphHeader` from glyph_transport or we write it directly here.
  // Actually, wait, `atomicDepositGlyphHeader` was placed inside `glyph_transport.md` but un-exported.
  // I will just use `glyph_transport` functions from the facade if we export `atomicDepositGlyphHeader`
```

```assemblyscript
if (intensity <= 0) return;
  const gx = x / SPATIAL_CELL_SIZE;
  const gy = y / SPATIAL_CELL_SIZE;
  if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return;

  const cell = gy * GRID_W + gx;

  // Telemetry: increment role-based atomic counter
  if (kind >= 1 && kind <= 2 && role <= 4) {
    const statPtr = SECRETION_STATS_OFF +
      (((kind - 1) * 5 + (role as i32)) << 2) as usize;
    atomic.add<i32>(statPtr, 1);
  }

  // Energy Cost
  if (atomIdx >= 0) {
    let cost: i32 = 0;
    if (kind == 1) cost = PHEROMONE_COST_BASE + (intensity >> 3);
    else if (kind == 2) cost = PLASMID_COST_BASE + (intensity >> 2);

    if (cost > 0) {
      const currentEnergy = get_energy(atomIdx);
      set_energy(atomIdx, currentEnergy - cost);
    }
  }

  // Role-based Phase Imprinting (Parasite = Destructive, Sys/Prod = Constructive)
  const isDestructive = role == 4;
  const phaseIntensity = isDestructive ? -intensity : intensity;

  // Requires atomicDepositGlyphHeader from glyph_transport
  // build_ontology currently groups all under the same AS/TS file per level, 
  // but let's export it uniquely from glyph_transport or ensure it's inline.
  // We'll rely on the facade exposing `atomicDepositGlyphHeader` if we extract it,
  // or we need to inline it. Since AssemblyScript doesn't perfectly hoist internal non-exported fns across modules unless exported,
  // we either export `atomicDepositGlyphHeader` from glyph_transport or we write it directly here.
  // Actually, wait, `atomicDepositGlyphHeader` was placed inside `glyph_transport.md` but un-exported.
  // I will just use `glyph_transport` functions from the facade if we export `atomicDepositGlyphHeader`
```

```

---

## FILE: src/ontology/autopoiesis/seed_atom.md

```markdown
---
id: seed_atom
type: pure_fn
dataType: null
returns: void
level: 1
args:
  idx: i32
  id: i64
  x: i32
  y: i32
  energy: i32
  resonance: i32
  genomePtr: usize
  lineagePtr: usize
vars:
  - IDS_OFFSET
  - XS_OFFSET
  - YS_OFFSET
  - ENERGY_OFFSET
  - RESONANCE_OFFSET
  - PHASE_OFFSET
  - ROLES_OFFSET
  - LOGIC_OFFSET
  - LINEAGE_OFFSET
  - INSTRUCTIONS_OFFSET
  - CONTEXT_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
description: Auto-recovered seed_atom
---

---
---

```rust
unimplemented!()
```

```typescript
const idPtr = IDS_OFFSET + (idx << 3) as usize;
store<i64>(idPtr, id);

const xPtr = XS_OFFSET + (idx << 1) as usize;
store<i16>(xPtr, x as i16);

const yPtr = YS_OFFSET + (idx << 1) as usize;
store<i16>(yPtr, y as i16);

store<i32>(ENERGY_OFFSET + (idx << 2) as usize, energy);
store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, resonance);
store<i32>(PHASE_OFFSET + (idx << 2) as usize, 0);
store<u8>(ROLES_OFFSET + (idx as usize), 0);

const logicPtr = LOGIC_OFFSET + (idx << 3) as usize;
if (genomePtr != 0) {
  memory.copy(logicPtr, genomePtr, 8);
} else {
  for (let b = 0; b < 8; b++) store<u8>(logicPtr + b, 0);
}

const linOff = LINEAGE_OFFSET + (idx << 3) as usize;
if (lineagePtr != 0) {
  memory.copy(linOff, lineagePtr, 8);
} else {
  store<i64>(linOff, 0);
}

// Clear instructions and context
const instPtr = INSTRUCTIONS_OFFSET + (idx << 6) as usize;
const ctxPtr = CONTEXT_OFFSET + (idx << 6) as usize;
for (let b = 0; b < 64; b++) {
  store<u8>(instPtr + b, 0);
  store<u8>(ctxPtr + b, 0);
}
```

```assemblyscript
const idPtr = IDS_OFFSET + (idx << 3) as usize;
store<i64>(idPtr, id);

const xPtr = XS_OFFSET + (idx << 1) as usize;
store<i16>(xPtr, x as i16);

const yPtr = YS_OFFSET + (idx << 1) as usize;
store<i16>(yPtr, y as i16);

store<i32>(ENERGY_OFFSET + (idx << 2) as usize, energy);
store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, resonance);
store<i32>(PHASE_OFFSET + (idx << 2) as usize, 0);
store<u8>(ROLES_OFFSET + (idx as usize), 0);

const logicPtr = LOGIC_OFFSET + (idx << 3) as usize;
if (genomePtr != 0) {
  memory.copy(logicPtr, genomePtr, 8);
} else {
  for (let b = 0; b < 8; b++) store<u8>(logicPtr + b, 0);
}

const linOff = LINEAGE_OFFSET + (idx << 3) as usize;
if (lineagePtr != 0) {
  memory.copy(linOff, lineagePtr, 8);
} else {
  store<i64>(linOff, 0);
}

// Clear instructions and context
const instPtr = INSTRUCTIONS_OFFSET + (idx << 6) as usize;
const ctxPtr = CONTEXT_OFFSET + (idx << 6) as usize;
for (let b = 0; b < 64; b++) {
  store<u8>(instPtr + b, 0);
  store<u8>(ctxPtr + b, 0);
}
```

```

---

## FILE: src/ontology/autopoiesis/set_neural_coherence.md

```markdown
---
id: set_neural_coherence
type: pure_fn
dataType: null
returns: void
level: 1
args:
  value: i32
vars:
  - NEURAL_COHERENCE_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  atomic.store<i32>(NEURAL_COHERENCE_OFF as usize, value);
```

```

---

## FILE: src/ontology/autopoiesis/tick_membrane_physics.md

```markdown
---
id: tick_membrane_physics
type: substrate_module
dataType: null
returns: void
level: 3
args:
vars:
  - MAX_ATOMS
  - IDS_OFFSET
  - ROLES_OFFSET
  - EVOLUTION_OFFSET
  - BONDS_OFFSET
  - RESONANCE_OFFSET
deps:
  - get_energy
  - set_energy
description: Membrane physics and tissue differentiation for Topography analysis
---

```rust
unimplemented!()
```

```typescript
const membraneVisited = new StaticArray<u8>(MAX_ATOMS);

function dfsMembrane(
  current: i32,
  start: i32,
  depth: i32,
  pathNodes: StaticArray<i32>,
  pathLen: i32
): i32 {
  if (depth >= 8) return 0;
  
  for (let b_slot = 0; b_slot < 4; b_slot++) {
    const target = atomic.load<i32>(
      BONDS_OFFSET + (((current << 2) + b_slot) << 2) as usize
    );
    if (target > 0 && target < MAX_ATOMS && atomic.load<i64>(IDS_OFFSET + (target << 3) as usize) != 0) {
      if (target == start && depth >= 2) {
        return pathLen;
      }
      if (target < start) continue;
      
      let contains = false;
      for (let i = 0; i < pathLen; i++) {
        if (unchecked(pathNodes[i]) == target) {
          contains = true;
          break;
        }
      }
      if (!contains) {
        unchecked(pathNodes[pathLen] = target);
        const finalLen = dfsMembrane(target, start, depth + 1, pathNodes, pathLen + 1);
        if (finalLen > 0) {
          return finalLen;
        }
      }
    }
  }
  return 0;
}

export function tick_membrane_physics(): void {
  for (let i = 1; i < MAX_ATOMS; i++) {
    const id = atomic.load<i64>(IDS_OFFSET + (i << 3) as usize);
    if (id != 0) {
      const roleOff = ROLES_OFFSET + i;
      const role = atomic.load<u8>(roleOff as usize);
      atomic.store<u8>(roleOff as usize, role & ~0x80);
      atomic.store<i32>(EVOLUTION_OFFSET + (i << 2) as usize, 0);
      unchecked(membraneVisited[i] = 0);
    }
  }

  const pathNodes = new StaticArray<i32>(8);

  for (let i = 1; i < MAX_ATOMS; i++) {
    if (atomic.load<i64>(IDS_OFFSET + (i << 3) as usize) == 0 || membraneVisited[i] == 1) {
      continue;
    }

    unchecked(pathNodes[0] = i);
    const ringLen = dfsMembrane(i, i, 0, pathNodes, 1);
    
    if (ringLen > 0) {
      // Phase 41: Morphogenesis BFS Component Expansion
      const componentNodes = new StaticArray<i32>(64);
      let head = 0;
      let tail = 0;

      // Initialize component with the detected Membrane ring
      for (let k = 0; k < ringLen; k++) {
        const node = unchecked(pathNodes[k]);
        unchecked(membraneVisited[node] = 1);
        unchecked(componentNodes[tail++] = node);
      }

      // BFS to expand the Metazoan tissue mask to all connected edges
      while (head < tail && tail < 64) {
        const curr = unchecked(componentNodes[head++]);
        
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((curr << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Only absorb if it hasn't mapped to a membrane component yet
            if (membraneVisited[neighbor] == 0 && tail < 64) {
              unchecked(membraneVisited[neighbor] = 1);
              unchecked(componentNodes[tail++] = neighbor);
            }
          }
        }
      }

      // 1. Calculate the Resource Pool over the ENTIRE tissue
      let sumEnergy: i64 = 0;
      let sumResonance: i64 = 0;

      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        sumEnergy += get_energy(node);
        sumResonance += atomic.load<i32>(RESONANCE_OFFSET + (node << 2) as usize);
      }

      const avgEnergy = i32(sumEnergy / tail);
      const avgResonance = i32(sumResonance / tail);
      const totalResonance = i32(sumResonance);

      // 2. Distribute pool & Differentiate Organelles (Morphogenesis)
      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        set_energy(node, avgEnergy);
        atomic.store<i32>(RESONANCE_OFFSET + (node << 2) as usize, avgResonance);
        atomic.store<i32>(EVOLUTION_OFFSET + (node << 2) as usize, totalResonance);
        
        // Count internal bonds to figure out topological layer (Surface vs Core)
        let internalBonds = 0;
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((node << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Verify if neighbor is part of this exact tissue component
            let isInternal = false;
            for (let c = 0; c < tail; c++) {
              if (unchecked(componentNodes[c]) == neighbor) {
                isInternal = true;
                break;
              }
            }
            if (isInternal) {
              internalBonds++;
            }
          }
        }

        // Morphological Differentiation
        const roleOff = ROLES_OFFSET + node;
        let role = atomic.load<u8>(roleOff as usize);
        
        // Clear underlying lower 7 bits for differentiation
        role = role & 0x80;

        // Apply topological epigenetics
        if (internalBonds >= 3) {
          // Core / Architect (Protected Processor)
          role = role | 3; // ROLE_ARCHITECT is 3 in STATE_MATRIX.ts
        } else {
          // Surface / Guardian (Radar & Armor)
          role = role | 2; // ROLE_GUARDIAN is 2 in STATE_MATRIX.ts
        }
        
        // Ensure Metazoan flag exists
        role = role | 0x80;

        atomic.store<u8>(roleOff as usize, role);
      }
      
      for (let k = 0; k < 8; k++) unchecked(pathNodes[k] = 0);
    }
  }
}
```

```assemblyscript
const membraneVisited = new StaticArray<u8>(MAX_ATOMS);

function dfsMembrane(
  current: i32,
  start: i32,
  depth: i32,
  pathNodes: StaticArray<i32>,
  pathLen: i32
): i32 {
  if (depth >= 8) return 0;
  
  for (let b_slot = 0; b_slot < 4; b_slot++) {
    const target = atomic.load<i32>(
      BONDS_OFFSET + (((current << 2) + b_slot) << 2) as usize
    );
    if (target > 0 && target < MAX_ATOMS && atomic.load<i64>(IDS_OFFSET + (target << 3) as usize) != 0) {
      if (target == start && depth >= 2) {
        return pathLen;
      }
      if (target < start) continue;
      
      let contains = false;
      for (let i = 0; i < pathLen; i++) {
        if (unchecked(pathNodes[i]) == target) {
          contains = true;
          break;
        }
      }
      if (!contains) {
        unchecked(pathNodes[pathLen] = target);
        const finalLen = dfsMembrane(target, start, depth + 1, pathNodes, pathLen + 1);
        if (finalLen > 0) {
          return finalLen;
        }
      }
    }
  }
  return 0;
}

export function tick_membrane_physics(): void {
  for (let i = 1; i < MAX_ATOMS; i++) {
    const id = atomic.load<i64>(IDS_OFFSET + (i << 3) as usize);
    if (id != 0) {
      const roleOff = ROLES_OFFSET + i;
      const role = atomic.load<u8>(roleOff as usize);
      atomic.store<u8>(roleOff as usize, role & ~0x80);
      atomic.store<i32>(EVOLUTION_OFFSET + (i << 2) as usize, 0);
      unchecked(membraneVisited[i] = 0);
    }
  }

  const pathNodes = new StaticArray<i32>(8);

  for (let i = 1; i < MAX_ATOMS; i++) {
    if (atomic.load<i64>(IDS_OFFSET + (i << 3) as usize) == 0 || membraneVisited[i] == 1) {
      continue;
    }

    unchecked(pathNodes[0] = i);
    const ringLen = dfsMembrane(i, i, 0, pathNodes, 1);
    
    if (ringLen > 0) {
      // Phase 41: Morphogenesis BFS Component Expansion
      const componentNodes = new StaticArray<i32>(64);
      let head = 0;
      let tail = 0;

      // Initialize component with the detected Membrane ring
      for (let k = 0; k < ringLen; k++) {
        const node = unchecked(pathNodes[k]);
        unchecked(membraneVisited[node] = 1);
        unchecked(componentNodes[tail++] = node);
      }

      // BFS to expand the Metazoan tissue mask to all connected edges
      while (head < tail && tail < 64) {
        const curr = unchecked(componentNodes[head++]);
        
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((curr << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Only absorb if it hasn't mapped to a membrane component yet
            if (membraneVisited[neighbor] == 0 && tail < 64) {
              unchecked(membraneVisited[neighbor] = 1);
              unchecked(componentNodes[tail++] = neighbor);
            }
          }
        }
      }

      // 1. Calculate the Resource Pool over the ENTIRE tissue
      let sumEnergy: i64 = 0;
      let sumResonance: i64 = 0;

      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        sumEnergy += get_energy(node);
        sumResonance += atomic.load<i32>(RESONANCE_OFFSET + (node << 2) as usize);
      }

      const avgEnergy = i32(sumEnergy / tail);
      const avgResonance = i32(sumResonance / tail);
      const totalResonance = i32(sumResonance);

      // 2. Distribute pool & Differentiate Organelles (Morphogenesis)
      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        set_energy(node, avgEnergy);
        atomic.store<i32>(RESONANCE_OFFSET + (node << 2) as usize, avgResonance);
        atomic.store<i32>(EVOLUTION_OFFSET + (node << 2) as usize, totalResonance);
        
        // Count internal bonds to figure out topological layer (Surface vs Core)
        let internalBonds = 0;
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((node << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Verify if neighbor is part of this exact tissue component
            let isInternal = false;
            for (let c = 0; c < tail; c++) {
              if (unchecked(componentNodes[c]) == neighbor) {
                isInternal = true;
                break;
              }
            }
            if (isInternal) {
              internalBonds++;
            }
          }
        }

        // Morphological Differentiation
        const roleOff = ROLES_OFFSET + node;
        let role = atomic.load<u8>(roleOff as usize);
        
        // Clear underlying lower 7 bits for differentiation
        role = role & 0x80;

        // Apply topological epigenetics
        if (internalBonds >= 3) {
          // Core / Architect (Protected Processor)
          role = role | 3; // ROLE_ARCHITECT is 3 in STATE_MATRIX.ts
        } else {
          // Surface / Guardian (Radar & Armor)
          role = role | 2; // ROLE_GUARDIAN is 2 in STATE_MATRIX.ts
        }
        
        // Ensure Metazoan flag exists
        role = role | 0x80;

        atomic.store<u8>(roleOff as usize, role);
      }
      
      for (let k = 0; k < 8; k++) unchecked(pathNodes[k] = 0);
    }
  }
}
```

```

---

## FILE: src/ontology/autopoiesis/unpack_glyph_amplitude.md

```markdown
---
id: unpack_glyph_amplitude
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  header: i32
description: Auto-recovered unpack_glyph_amplitude
---

---
---

```rust
unimplemented!()
```

```typescript
return header >> 8;
```

```assemblyscript
return header >> 8;
```

```

---

## FILE: src/ontology/autopoiesis/unpack_glyph_kind.md

```markdown
---
id: unpack_glyph_kind
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  header: i32
description: Auto-recovered unpack_glyph_kind
---

---
---

```rust
unimplemented!()
```

```typescript
return header & 0xFF;
```

```assemblyscript
return header & 0xFF;
```

```

---

## FILE: src/ontology/core/build_spatial_hash.md

```markdown
---
id: build_spatial_hash
type: pure_fn
dataType: null
returns: i64
level: 3
args:
vars:
  - MAX_ATOMS
  - GRID_CELLS
  - GRID_W
  - WORLD_MAX_X
  - WORLD_MAX_Y
  - SPATIAL_CELL_SIZE
  - SPATIAL_GRID_OFFSET
  - QUORUM_OFFSET
  - IDS_OFFSET
deps:
  - get_x
  - get_y
  - get_phase
  - get_role
description: Distributes atoms into a spatial hash grid for O(1) proximity lookups, tracks overflow, and returns a packed i64 tuple of (hashMaxCellCount | hashOverflowCount).
---

```rust
unimplemented!()
```

```typescript
const CELL_CAPACITY: i32 = 31;
const MAX_ATOM_SLOTS: i32 = CELL_CAPACITY - 1;

let spatialHashOverflowCount = 0;
let spatialHashMaxCellCount = 0;

// 1. Clear Grid and Quorum
for (let i = 0; i < (GRID_CELLS as i32); i++) {
  atomic.store<i32>(SPATIAL_GRID_OFFSET + (i << 7) as usize, 0);
  // Clear Quorum (8 roles)
  let qOff = QUORUM_OFFSET + (i << 5) as usize;
  store<u64>(qOff, 0);
  store<u64>(qOff + 8, 0);
  store<u64>(qOff + 16, 0);
  store<u64>(qOff + 24, 0);
}

// 2. Bin Atoms
for (let idx = 0; idx < MAX_ATOMS; idx++) {
  let id = load<u64>(IDS_OFFSET + (idx << 3) as usize);
  if (id == 0) continue;

  let x = (get_x(idx) as i32) / 100;
  let y = (get_y(idx) as i32) / 100;

  // Clamp
  if (x < 0) x = 0;
  if (x > WORLD_MAX_X) x = WORLD_MAX_X;
  if (y < 0) y = 0;
  if (y > WORLD_MAX_Y) y = WORLD_MAX_Y;

  let cellX = x / SPATIAL_CELL_SIZE;
  let cellY = y / SPATIAL_CELL_SIZE;
  let cellIdx = cellY * GRID_W + cellX;
  let offset = SPATIAL_GRID_OFFSET + (cellIdx << 7);

  // Atomic update of count
  let nextSlot = atomic.add<i32>(offset as usize, 1) + 1;
  if (nextSlot <= MAX_ATOM_SLOTS) {
    store<i32>((offset + (nextSlot << 2)) as usize, idx);

    // Phase tracking (Era 50)
    let myPhase = get_phase(idx);
    atomic.add<i32>((offset + (CELL_CAPACITY << 2)) as usize, myPhase);

    // Role quorum (Era 55)
    let role = get_role(idx);
    let safeRole = role > 7 ? 7 : role;
    atomic.add<i32>(
      QUORUM_OFFSET + (cellIdx << 5) + (safeRole << 2) as usize,
      1,
    );
    if (nextSlot > spatialHashMaxCellCount) {
      spatialHashMaxCellCount = nextSlot;
    }
  } else {
    // Overflow: roll back count so the cell occupancy stays bounded.
    atomic.sub<i32>(offset as usize, 1);
    spatialHashOverflowCount += 1;
  }
}

// 3. Finalize Phase Averages
for (let i = 0; i < (GRID_CELLS as i32); i++) {
  let offset = SPATIAL_GRID_OFFSET + (i << 7);
  let count = atomic.load<i32>(offset as usize);
  if (count > 0) {
    let sum = atomic.load<i32>((offset + (CELL_CAPACITY << 2)) as usize);
    // We reuse slot 31 (CELL_CAPACITY) for the average after clearing the sum
    atomic.store<i32>((offset + (CELL_CAPACITY << 2)) as usize, sum / count);
  }
}

return ((spatialHashMaxCellCount as i64) << 32) | ((spatialHashOverflowCount as i64) & 0xFFFFFFFF);
```

```assemblyscript
const CELL_CAPACITY: i32 = 31;
const MAX_ATOM_SLOTS: i32 = CELL_CAPACITY - 1;

let spatialHashOverflowCount = 0;
let spatialHashMaxCellCount = 0;

// 1. Clear Grid and Quorum
for (let i = 0; i < (GRID_CELLS as i32); i++) {
  atomic.store<i32>(SPATIAL_GRID_OFFSET + (i << 7) as usize, 0);
  // Clear Quorum (8 roles)
  let qOff = QUORUM_OFFSET + (i << 5) as usize;
  store<u64>(qOff, 0);
  store<u64>(qOff + 8, 0);
  store<u64>(qOff + 16, 0);
  store<u64>(qOff + 24, 0);
}

// 2. Bin Atoms
for (let idx = 0; idx < MAX_ATOMS; idx++) {
  let id = load<u64>(IDS_OFFSET + (idx << 3) as usize);
  if (id == 0) continue;

  let x = (get_x(idx) as i32) / 100;
  let y = (get_y(idx) as i32) / 100;

  // Clamp
  if (x < 0) x = 0;
  if (x > WORLD_MAX_X) x = WORLD_MAX_X;
  if (y < 0) y = 0;
  if (y > WORLD_MAX_Y) y = WORLD_MAX_Y;

  let cellX = x / SPATIAL_CELL_SIZE;
  let cellY = y / SPATIAL_CELL_SIZE;
  let cellIdx = cellY * GRID_W + cellX;
  let offset = SPATIAL_GRID_OFFSET + (cellIdx << 7);

  // Atomic update of count
  let nextSlot = atomic.add<i32>(offset as usize, 1) + 1;
  if (nextSlot <= MAX_ATOM_SLOTS) {
    store<i32>((offset + (nextSlot << 2)) as usize, idx);

    // Phase tracking (Era 50)
    let myPhase = get_phase(idx);
    atomic.add<i32>((offset + (CELL_CAPACITY << 2)) as usize, myPhase);

    // Role quorum (Era 55)
    let role = get_role(idx);
    let safeRole = role > 7 ? 7 : role;
    atomic.add<i32>(
      QUORUM_OFFSET + (cellIdx << 5) + (safeRole << 2) as usize,
      1,
    );
    if (nextSlot > spatialHashMaxCellCount) {
      spatialHashMaxCellCount = nextSlot;
    }
  } else {
    // Overflow: roll back count so the cell occupancy stays bounded.
    atomic.sub<i32>(offset as usize, 1);
    spatialHashOverflowCount += 1;
  }
}

// 3. Finalize Phase Averages
for (let i = 0; i < (GRID_CELLS as i32); i++) {
  let offset = SPATIAL_GRID_OFFSET + (i << 7);
  let count = atomic.load<i32>(offset as usize);
  if (count > 0) {
    let sum = atomic.load<i32>((offset + (CELL_CAPACITY << 2)) as usize);
    // We reuse slot 31 (CELL_CAPACITY) for the average after clearing the sum
    atomic.store<i32>((offset + (CELL_CAPACITY << 2)) as usize, sum / count);
  }
}

return ((spatialHashMaxCellCount as i64) << 32) | ((spatialHashOverflowCount as i64) & 0xFFFFFFFF);
```

```

---

## FILE: src/ontology/core/evaluate_opcodes.md

```markdown
---
id: evaluate_opcodes
type: pure_fn
dataType: i32
returns: i32
level: 1
args:
  atomIndex: i32
  energy: i32
  resonance: i32
  mass: i32
vars:
  - INSTRUCTIONS_OFFSET
  - MAX_ATOMS
  - GRID_W
  - NEURAL_COHERENCE_OFF
  - MEMORY_GRID_OFF
  - OP_NOP
  - OP_SET
  - OP_GET
  - OP_PUT
  - OP_ADD
  - OP_SUB
  - OP_JNZ
  - OP_JMP
  - OP_SYSCALL
  - OP_RESOLVE
  - OP_RESONATE_KURAMOTO
  - OP_SPORE_DRIVE
  - OP_SENSE_AS
  - PROP_ENERGY
  - PROP_RESONANCE
  - PROP_X
  - PROP_Y
  - PROP_PHASE
  - PROP_GRID_CHARGE
  - PROP_QUORUM
  - PROP_NEURAL_COHERENCE
  - PROP_MEMORY
  - PROP_CONSENSUS
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - VmOpcodes
  - VmProps
  - get_p_c
  - set_p_c
  - get_x
  - get_y
  - get_phase
  - set_phase
  - get_reg
  - set_reg
  - get_spatial_grid_count
  - get_spatial_grid_atom
  - get_hormone
  - set_energy
  - set_resonance
  - set_pending_syscall
  - in_grid
  - read_structure_charge
  - math_sin
  - math_cos
---

---
---

```rust
unimplemented!()
```

```typescript
// unimplemented since user requested pure AssemblyScript isolation for VM evaluation
return 0;
```

```assemblyscript
  let pc = get_p_c(atomIndex);
  const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

  let gasUsed: i32 = 0;
  // Hard cap to prevent WASM thread lockup, bounded by physical energy
  let baseLimit: i32 = energy < 100 ? energy : 100;
  let gasLimit: i32 = baseLimit / mass;
  if (gasLimit < 1) gasLimit = 1;

  while (gasUsed < gasLimit) {
    const op = load<u8>(instr_base + (pc as usize));
    if (op == OP_NOP) {
      gasUsed += 1;
      break;
    }

    switch (op) {
      case OP_SET: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let imm = load<i8>(instr_base + (pc + 2) as usize);
        set_reg(atomIndex, reg as i32, imm as i32);
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_GET: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val: i32 = 0;
        if (prop == PROP_ENERGY) val = energy;
        else if (prop == PROP_RESONANCE) val = resonance;
        else if (prop == PROP_X) val = get_x(atomIndex) as i32;
        else if (prop == PROP_Y) val = get_y(atomIndex) as i32;
        else if (prop == PROP_PHASE) val = get_phase(atomIndex);
        else if (prop == PROP_GRID_CHARGE) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = read_structure_charge(gy * GRID_W + gx);
          }
        } else if (prop == PROP_QUORUM) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = get_spatial_grid_count(gx, gy);
          }
        } else if (prop == PROP_NEURAL_COHERENCE) {
          val = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
        } else if (prop == PROP_MEMORY) {
          let rx = get_x(atomIndex) as i32;
          let ry = get_y(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (in_grid(gx, gy)) {
            val = load<u8>(MEMORY_GRID_OFF + ((gy * GRID_W + gx) << 3)) as i32;
          }
        } else if (prop == PROP_CONSENSUS) {
          val = get_hormone(6) as i32;
        }
        set_reg(atomIndex, reg as i32, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_PUT: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val = get_reg(atomIndex, reg as i32);
        if (prop == PROP_ENERGY) {
          energy = val;
          set_energy(atomIndex, val);
        } else if (prop == PROP_RESONANCE) {
          if (val > resonance) {
            let diff = val - resonance;
            let cost = diff * 1000; // Energy is stored in thousandths
            if (energy >= cost) {
              energy -= cost;
              resonance = val;
            } else {
              resonance += energy / 1000;
              energy = 0;
            }
          } else {
            // Free stealth drop
            resonance = val;
          }
          set_resonance(atomIndex, resonance);
          set_energy(atomIndex, energy);
        } else if (prop == PROP_PHASE) set_phase(atomIndex, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_ADD: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        set_reg(
          atomIndex,
          r1 as i32,
          get_reg(atomIndex, r1 as i32) + get_reg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_SUB: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        set_reg(
          atomIndex,
          r1 as i32,
          get_reg(atomIndex, r1 as i32) - get_reg(atomIndex, r2 as i32),
        );
        pc += 3;
        gasUsed += 1;
        break;
      }
      case OP_JNZ: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let target = load<u8>(instr_base + (pc + 2) as usize);
        if (get_reg(atomIndex, reg as i32) != 0) pc = target;
        else pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_JMP: {
        pc = load<u8>(instr_base + (pc + 1) as usize);
        gasUsed += 2;
        break;
      }
      case OP_SYSCALL: {
        set_pending_syscall(atomIndex, 1);
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_RESOLVE: {
        let destReg = load<u8>(instr_base + ((pc + 1) as usize));
        let angleReg = load<u8>(instr_base + ((pc + 2) as usize));
        let modeReg = load<u8>(instr_base + ((pc + 3) as usize));

        let angle = get_reg(atomIndex, angleReg as i32);
        let modeVal = get_reg(atomIndex, modeReg as i32);

        // modeVal decoding:
        // 0: Sin Direct  (1 Gas)
        // 1: Sin LERP    (5 Gas)
        // 2: Cos Direct  (1 Gas)
        // 3: Cos LERP    (5 Gas)
        // 4: Sin Taylor2 (10 Gas - Reserved)

        let val = 0;
        let cost = 1;
        let highRes = 0;

        if (modeVal == 1 || modeVal == 3) {
          highRes = 1;
          cost = 5;
        } else if (modeVal == 4 || modeVal == 5) {
          highRes = 2; // Reserved for Taylor2
          cost = 10;
        }

        if (modeVal == 0 || modeVal == 1 || modeVal == 4) {
          val = math_sin(angle, highRes);
        } else {
          val = math_cos(angle, highRes);
        }

        set_reg(atomIndex, destReg as i32, val);
        pc += 4;
        gasUsed += cost;
        break;
      }
      case OP_RESONATE_KURAMOTO: {
        let gx = (get_x(atomIndex) / 1000) as i32;
        let gy = (get_y(atomIndex) / 1000) as i32;
        let sumSin = 0;
        let currentPhase = get_phase(atomIndex);
        let neighborCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = gx + dx;
            let ny = gy + dy;
            if (in_grid(nx, ny)) {
              let count = get_spatial_grid_count(nx, ny);
              for (let i = 0; i < count; i++) {
                let neighborId = get_spatial_grid_atom(nx, ny, i);
                if (
                  neighborId > 0 && neighborId != atomIndex &&
                  neighborId < MAX_ATOMS
                ) {
                  let neighborPhase = get_phase(neighborId);
                  let diff = (neighborPhase - currentPhase) & 255;
                  sumSin += math_sin(diff, 0); // Direct lookup for density scaling
                  neighborCount++;
                }
              }
            }
          }
        }

        let coh = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
        let K = 5 + (coh / 100);
        if (K > 128) K = 128;

        if (neighborCount > 0) {
          let d_theta = (K * sumSin) >> 15;
          let theta_next = (currentPhase + d_theta) & 255;
          set_phase(atomIndex, theta_next as u8);
        }

        pc += 1;
        gasUsed += 5 + neighborCount * 2;
        break;
      }
      case OP_SPORE_DRIVE: {
        set_pending_syscall(atomIndex, 20); // 20 = SYS_SPORE_DRIVE in JS Host
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_SENSE_AS: {
        set_pending_syscall(atomIndex, 21); // 21 = SYS_SENSE_PHASE
        pc += 1;
        gasUsed += 2;
        gasLimit = 0; // force yield to host
        break;
      }
      default: {
        pc = 0; // Reset or stop
        gasUsed += 1;
        gasLimit = 0; // stop execution on invalid opcode
        break;
      }
    }
    if (pc >= 64) pc = 0;
  }
  set_p_c(atomIndex, pc);
  
  // We mutated resonance and energy inside OP_PUT, return them if we had multiple returns, but here we expect caller to just fetch them again. Yes! So we just return gasUsed!
  return gasUsed;
```

```

---

## FILE: src/ontology/core/execute_atom.md

```markdown
---
id: execute_atom
type: pure_fn
dataType: null
returns: void
level: 1
args:
  atomIndex: i32
vars:
  - IDS_OFFSET
  - INSTRUCTIONS_OFFSET
  - BONDS_OFFSET
  - MAX_ATOMS
  - NEURAL_COHERENCE_OFF
deps:
  - evaluate_opcodes
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_p_c
  - get_read_energy
  - get_read_resonance
  - get_hormone
  - get_phase
  - set_phase
  - set_resonance
  - fire_signal
  - get_energy
  - get_resonance
  - set_energy
description: Auto-recovered execute_atom
---

---
---

```rust
unimplemented!()
```

```typescript
let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
if (id == 0) return;

let pc = get_p_c(atomIndex);
let energy = get_read_energy(atomIndex);
let resonance = get_read_resonance(atomIndex);
const instrBase: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

// Bounded Reduction - Gas Accounting Economy
let mass: i32 = 1;
const bondBase = BONDS_OFFSET + (atomIndex << 4) as usize;
for (let b = 0; b < 4; b++) {
  const target = load<i32>(bondBase + (b << 2) as usize);
  if (target > 0 && target < MAX_ATOMS) mass++;
}

let gasUsed = evaluate_opcodes(atomIndex, energy, resonance, mass);

// HORMONE 0: entropy_pressure scales metabolic cost (range 0..2048 → +0..+4 per executed step)
let entropyH: i32 = get_hormone(0) as i32;
// HORMONE 5: mutation_friction adds a metabolic floor (range 0..2048 → +0..+8 per execute)
let frictionH: i32 = get_hormone(5) as i32;

// --- [x] Stage 11.1: Neural Synthesis (The Global Coherence)
let coherenceVal = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
// Coherence discount: if global coherence is high (>100 signals), reduce cost
let discount: i32 = coherenceVal > 1000 ? 2 : (coherenceVal > 100 ? 1 : 0);

let baseComputeCost = gasUsed >> discount;
let metabolicCost = 1 + baseComputeCost +
  ((gasUsed * entropyH) >> (12 + discount)) + (frictionH >> 8);

// --- STAGE 11.1: PHASE SYNCHRONIZATION ---
if (coherenceVal > 500) {
  // Neural Field Resonance: pull atomic phase towards harmonic threshold (128)
  let curPhase: i32 = get_phase(atomIndex) as i32;
  if (curPhase < 128) curPhase += 2;
  else if (curPhase > 128) curPhase -= 1;
  set_phase(atomIndex, curPhase as u8);
}

// Auto-Firing Action Potential
if (resonance > 300) {
  if (energy > 200) {
    energy -= 200;
    set_resonance(atomIndex, 0);
    set_phase(atomIndex, 5);
    fire_signal(atomIndex);
  } else {
    set_resonance(atomIndex, 280);
  }
}

// HORMONE 4: repair_drive slows resonance decay (range 0..2048; >1024 halves decay)
let repairH: i32 = get_hormone(4) as i32;
let resonanceDecay: i32 = repairH > 1024 ? 1 : 2;
// Re-fetch energy and resonance because asynchronous Syscalls (e.g. SYS_TRANSFER) might have mutated the host buffer
let finalEnergy: i32 = get_energy(atomIndex) as i32;
let finalResonance: i32 = get_resonance(atomIndex) as i32;

if (finalResonance > 0) {
  set_resonance(atomIndex, finalResonance - resonanceDecay);
}
set_energy(
  atomIndex,
  finalEnergy > metabolicCost ? finalEnergy - metabolicCost : 0,
);
```

```assemblyscript
let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
if (id == 0) return;

let pc = get_p_c(atomIndex);
let energy = get_read_energy(atomIndex);
let resonance = get_read_resonance(atomIndex);
const instrBase: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

// Bounded Reduction - Gas Accounting Economy
let mass: i32 = 1;
const bondBase = BONDS_OFFSET + (atomIndex << 4) as usize;
for (let b = 0; b < 4; b++) {
  const target = load<i32>(bondBase + (b << 2) as usize);
  if (target > 0 && target < MAX_ATOMS) mass++;
}

let gasUsed = evaluate_opcodes(atomIndex, energy, resonance, mass);

// HORMONE 0: entropy_pressure scales metabolic cost (range 0..2048 → +0..+4 per executed step)
let entropyH: i32 = get_hormone(0) as i32;
// HORMONE 5: mutation_friction adds a metabolic floor (range 0..2048 → +0..+8 per execute)
let frictionH: i32 = get_hormone(5) as i32;

// --- [x] Stage 11.1: Neural Synthesis (The Global Coherence)
let coherenceVal = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
// Coherence discount: if global coherence is high (>100 signals), reduce cost
let discount: i32 = coherenceVal > 1000 ? 2 : (coherenceVal > 100 ? 1 : 0);

let baseComputeCost = gasUsed >> discount;
let metabolicCost = 1 + baseComputeCost +
  ((gasUsed * entropyH) >> (12 + discount)) + (frictionH >> 8);

// --- STAGE 11.1: PHASE SYNCHRONIZATION ---
if (coherenceVal > 500) {
  // Neural Field Resonance: pull atomic phase towards harmonic threshold (128)
  let curPhase: i32 = get_phase(atomIndex) as i32;
  if (curPhase < 128) curPhase += 2;
  else if (curPhase > 128) curPhase -= 1;
  set_phase(atomIndex, curPhase as u8);
}

// Auto-Firing Action Potential
if (resonance > 300) {
  if (energy > 200) {
    energy -= 200;
    set_resonance(atomIndex, 0);
    set_phase(atomIndex, 5);
    fire_signal(atomIndex);
  } else {
    set_resonance(atomIndex, 280);
  }
}

// HORMONE 4: repair_drive slows resonance decay (range 0..2048; >1024 halves decay)
let repairH: i32 = get_hormone(4) as i32;
let resonanceDecay: i32 = repairH > 1024 ? 1 : 2;
// Re-fetch energy and resonance because asynchronous Syscalls (e.g. SYS_TRANSFER) might have mutated the host buffer
let finalEnergy: i32 = get_energy(atomIndex) as i32;
let finalResonance: i32 = get_resonance(atomIndex) as i32;

if (finalResonance > 0) {
  set_resonance(atomIndex, finalResonance - resonanceDecay);
}
set_energy(
  atomIndex,
  finalEnergy > metabolicCost ? finalEnergy - metabolicCost : 0,
);
```

```

---

## FILE: src/ontology/core/GRID_METRICS.md

```markdown
---
id: GRID_METRICS
type: constants
description: "Derived spatial grid formulas evaluating bound capacities dynamically"
deps: [SYSTEM_CONSTANTS]
vars: [GRID_W, GRID_H, SPATIAL_CELL_SIZE]
values:
  GRID_CELLS: 
    expr: "GRID_W * GRID_H"
    type: usize
  WORLD_MAX_X: 
    expr: "(GRID_W * SPATIAL_CELL_SIZE) - 1"
    type: i32
  WORLD_MAX_Y: 
    expr: "(GRID_H * SPATIAL_CELL_SIZE) - 1"
    type: i32
---

```

---

## FILE: src/ontology/core/OMEGA_MEMORY_LAYOUT.md

```markdown
---
id: OMEGA_MEMORY_LAYOUT
type: memory_layout
description: "Isomorphic topological mapping of all generic WebAssembly shared arrays"
deps: 
  - SYSTEM_CONSTANTS
  - GRID_METRICS
vars:
  - MAX_ATOMS
  - SAFETY_BUFFER
  - ATOM_GENOME_SIZE
  - ATOM_INSTRUCTION_SIZE
  - ATOM_CONTEXT_SIZE
  - MAX_SPAWN_REQUESTS
  - MAX_MEIOSIS_EVENTS
  - GRID_CELLS
  - MAX_ASCENSION_STATS_RESERVED
  - HIVE_MEMORY_SIZE
  - HIVE_ENERGY_POOL_SIZE
  - MAX_HORMONES
  - SECRETION_STATS_SIZE
  - MAX_LEDGER_EVENTS
  - MAX_EGRESS_EVENTS
base_offset: "SAFETY_BUFFER - 8"
regions:
  - name: TICK_COUNTER
    size: 4
    align: 4
  - name: SYNC_STATE
    size: 4
    align: 4
  - name: IDS
    size: "MAX_ATOMS * 8"
    align: 8
  - name: XS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: YS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: ENERGY
    size: "MAX_ATOMS * 4"
    align: 4
  - name: RESONANCE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: PHASE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: LOGIC
    size: "MAX_ATOMS * 8"
    align: 1
  - name: BONDS
    size: "MAX_ATOMS * 4 * 4"
    align: 4
  - name: STIFFNESS
    size: "MAX_ATOMS * 4 * 4"
    align: 4
  - name: INSTRUCTIONS
    size: "MAX_ATOMS * 64"
    align: 1
  - name: CONTEXT
    size: "MAX_ATOMS * 16 * 4"
    align: 4
  - name: EVOLUTION
    size: "MAX_ATOMS * 4"
    align: 4
  - name: SPAWN_REQUESTS
    size: "8 + (1024 * 24)"
    align: 8
  - name: MEIOSIS_RESERVED
    size: "75000 * 80"
    align: 4
  - name: BOND_REQUESTS
    size: "MAX_ATOMS * 3 * 4"
    align: 4
  - name: SPATIAL_GRID
    size: "GRID_CELLS * 32 * 4"
    align: 4
  - name: ROLES
    size: "MAX_ATOMS"
    align: 1
  - name: STRUCTURE_GRID
    size: "GRID_CELLS * 4"
    align: 4
  - name: SIGNAL_GRID
    size: "GRID_CELLS * 4"
    align: 4
  - name: MEMORY_GRID
    size: "GRID_CELLS * 8"
    align: 1
  - name: ASCENSION_STATS_RESERVED
    size: "1250000 * 4"
    align: 4
  - name: BOND_DISTANCES
    size: "MAX_ATOMS * 4"
    align: 1
  - name: SYNAPTIC_WEIGHTS
    size: "MAX_ATOMS * 4"
    align: 1
  - name: DAMPING
    size: "MAX_ATOMS"
    align: 1
  - name: CAUSALITY
    size: "MAX_ATOMS"
    align: 1
  - name: HIVE_MEMORY
    size: 1024
    align: 1
  - name: HIVE_BALANCE
    size: 4
    align: 4
  - name: QUORUM
    size: "GRID_CELLS * 8 * 4"
    align: 4
  - name: COHERENCE
    size: 4
    align: 4
  - name: NEURAL_COHERENCE
    size: 4
    align: 4
  - name: PHYSICS_READ_XS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: PHYSICS_READ_YS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: PHYSICS_READ_ENERGY
    size: "MAX_ATOMS * 4"
    align: 4
  - name: PHYSICS_READ_RESONANCE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: ENERGY_DELTA
    size: "MAX_ATOMS * 4"
    align: 4
  - name: RESONANCE_DELTA
    size: "MAX_ATOMS * 4"
    align: 4
  - name: STRUCTURE_BUILD_OWNER
    size: "GRID_CELLS * 4"
    align: 4
  - name: STRUCTURE_BUILD_VALUE
    size: "GRID_CELLS * 4"
    align: 4
  - name: STRUCTURE_CHARGE_INTENT
    size: "GRID_CELLS * 4"
    align: 4
  - name: ATTENTION_FIELD
    size: "GRID_CELLS * 4"
    align: 4
  - name: HIVE_ENERGY_POOL
    size: "256 * 4"
    align: 4
  - name: GLYPH_HEADER
    size: "GRID_CELLS * 4"
    align: 4
  - name: GLYPH_PAYLOAD
    size: "GRID_CELLS * 8"
    align: 1
  - name: GLYPH_SCRATCH_HEADER
    size: "GRID_CELLS * 4"
    align: 4
  - name: GLYPH_SCRATCH_PAYLOAD
    size: "GRID_CELLS * 8"
    align: 1
  - name: HORMONES
    size: "8 * 2"
    align: 2
  - name: SECRETION_STATS
    size: "12 * 4"
    align: 4
  - name: LINEAGE
    size: "MAX_ATOMS * 8"
    align: 8
  - name: MAILBOX
    size: "MAX_ATOMS * 8"
    align: 4
  - name: LEDGER_HEAD
    size: 4
    align: 4
  - name: LEDGER_DATA
    size: "65536 * 16"
    align: 4
  - name: EGRESS_HEAD
    size: 4
    align: 4
  - name: EGRESS_DATA
    size: "8192 * 128"
    align: 4
  - name: METABOLISM_SCRATCH
    size: "(65536 * 4) + 128"
    align: 4
---

```

---

## FILE: src/ontology/core/StructureTypes.md

```markdown
---
id: StructureTypes
type: enum
dataType: i32
description: "Grid Structure Material Properties"
deps: []
values:
  STR_VOID: 0
  STR_WIRE: 1
  STR_NODE: 2
  STR_DIODE: 3
  STR_SOURCE: 4
  STR_SINK: 5
  STR_CAPACITOR: 6
  STR_INVERTER: 7
  STR_LATCH: 8
---

```

---

## FILE: src/ontology/core/SYSTEM_CONSTANTS.md

```markdown
---
id: SYSTEM_CONSTANTS
type: constants
description: "Core physical, spatial and computational limits"
deps: []
values:
  MAX_ATOMS: 
    value: 500000
    type: usize
  SAFETY_BUFFER: 
    value: 8000000
    type: usize
  GRID_W: 
    value: 140
    type: i32
  GRID_H: 
    value: 80
    type: i32

  SPATIAL_CELL_SIZE: 
    value: 10
    type: i32
  STRUCTURE_INTENT_SPIN_LIMIT:
    value: 128
    type: i32
  PHEROMONE_COST_BASE:
    value: 10
    type: i32
  PLASMID_COST_BASE:
    value: 25
    type: i32
  ROLE_NEUTRAL:
    value: 0
    type: u8
  ROLE_PRODUCER:
    value: 1
    type: u8
  ROLE_GUARDIAN:
    value: 2
    type: u8
  ROLE_ARCHITECT:
    value: 3
    type: u8
  ROLE_PARASITE:
    value: 4
    type: u8
  STRUCTURE_INTENT_LOCK_BIT:
    value: -2147483648
    type: i32
  STRUCTURE_INTENT_OWNER_MASK:
    value: 2147483647
    type: i32

  SCALE: 
    value: 1000
    type: i32
  CELL_CAPACITY: 
    value: 32
    type: usize
  MAX_PC: 
    value: 64
    type: u8
  MAX_EXECUTION_STEPS: 
    value: 64
    type: usize
  ATOM_LOGIC_SIZE: 
    value: 64
    type: usize
  MAX_LEDGER_EVENTS: 
    value: 65536
    type: usize
  MAX_EGRESS_EVENTS: 
    value: 8192
    type: usize
  WASM_PAGE_BYTES: 
    value: 65536
    type: usize
  WASM_MEMORY_PAGES: 
    value: 7630
    type: usize
  HIVE_MEMORY_SIZE: 
    value: 1024
    type: usize
  HIVE_ENERGY_POOL_SIZE: 
    value: 256
    type: usize
  MAX_HORMONES: 
    value: 8
    type: usize
  SECRETION_STATS_SIZE: 
    value: 12
    type: usize
  MAX_SPAWN_REQUESTS: 
    value: 1024
    type: usize
  MAX_MEIOSIS_EVENTS: 
    value: 75000
    type: usize
  MAX_ASCENSION_STATS: 
    value: 62500
    type: usize
  MAX_ASCENSION_STATS_RESERVED: 
    value: 1250000
    type: usize
  ATOM_CONTEXT_SIZE: 
    value: 16
    type: usize
  ATOM_GENOME_SIZE: 
    value: 8
    type: usize
  ATOM_INSTRUCTION_SIZE: 
    value: 64
    type: usize
  RESOURCE_MAX: 
    value: 2000000000
    type: i32
  MAX_GLYPH_AMP: 
    value: 8388607
    type: i32
  MIN_GLYPH_AMP: 
    value: -8388608
    type: i32
  SPAWN_MAX: 
    value: 1024
    type: i32
  SPAWN_SLOT: 
    value: 24
    type: i32
---

```

---

## FILE: src/ontology/core/trace_atom.md

```markdown
---
id: trace_atom
type: pure_fn
dataType: null
returns: void
level: 0
args:
  idx: i32
  opcode: i32
  gx: i32
  gy: i32
  targetIdx: i32
deps: []
vars: []
---

---
---

```rust
// Externally defined in the host or FFI boundary for Sigma
```

```typescript
// TS Mock No-op
```

```assemblyscript
// AssemblyScript imports are usually declared at the top level
// The transpiler handles the `@external` decorator if needed, or we just leave it 
// empty here and ensure it's exported via `pulse_orchestrator`'s host-link.
// For now, in OMEGA-64, trace_atom is already globally declared in `pulse_orchestrator.ts`.
// But to make it topological, we declare it as an external import.
```

```

---

## FILE: src/ontology/core/VmOpcodes.md

```markdown
---
id: VmOpcodes
type: enum
dataType: u8
description: "Instruction Set Architecture (ISA) Opcodes"
deps: []
values:
  OP_NOP: 0x00
  OP_SET: 0x01
  OP_GET: 0x02
  OP_PUT: 0x03
  OP_ADD: 0x04
  OP_SUB: 0x05
  OP_JZ: 0x10
  OP_JNZ: 0x11
  OP_JMP: 0x12
  OP_SYSCALL: 0x60
  OP_REPLICATE: 0x80
  OP_SIGNAL: 0x81
  OP_BIND: 0x82
  OP_SHARE: 0x83
  OP_HEBB: 0x8A
  OP_FIRE: 0x8B
  OP_DECAY: 0x91
  OP_PLUG: 0xA4
  OP_TENSEGRITY: 0xA5
  OP_COLLECTIVE: 0xA6
  OP_BUILD: 0xA8
  OP_SPORE_DRIVE: 0xA8
  OP_SENSE: 0xA9
  OP_SENSE_AS: 0xB2
  OP_SECRETE_PLASMID: 0xAA
  OP_INCORPORATE_PLASMID: 0xAB
  OP_RESOLVE: 0xB0
  OP_RESONATE_KURAMOTO: 0xB1
---

```

---

## FILE: src/ontology/core/VmProps.md

```markdown
---
id: VmProps
type: enum
dataType: u8
description: "LambdaVM Atom Property Indices"
deps: []
values:
  PROP_ENERGY: 0
  PROP_RESONANCE: 1
  PROP_X: 2
  PROP_Y: 3
  PROP_PHASE: 4
  PROP_GRID_CHARGE: 7
  PROP_QUORUM: 8
  PROP_NEURAL_COHERENCE: 9
  PROP_MEMORY: 10
  PROP_CONSENSUS: 11
---

```

---

## FILE: src/ontology/core/VmSys.md

```markdown
---
id: VmSys
type: enum
dataType: i32
description: "LambdaVM System Call Indices"
deps: []
values:
  SYS_YIELD: 1
  SYS_READ_MEM: 2
  SYS_WRITE_MEM: 3
  SYS_SPAWN: 4
  SYS_BIND: 5
  SYS_SET_ROLE: 6
  SYS_MUTATE: 7
  SYS_MSG: 8
  SYS_READ_INBOX: 9
  SYS_TRANSFER: 10
  SYS_REPLICATE: 11
  SYS_EMIT: 12
  SYS_SCAN: 13
  SYS_MOVE: 14
  SYS_EAT: 15
  SYS_BET: 16
  SYS_ATTRACT: 17
  SYS_FOLD: 18
  SYS_SPORE_DRIVE: 20
  SYS_SENSE_PHASE: 21
---

```

---

## FILE: src/ontology/host/sigma_atom_role.md

```markdown
---
id: sigma_atom_role
type: substrate_module
target: rust
level: 2
deps:
description: Defines the role enumerations for OMEGA atoms
---

# `AtomRole`

```rust
pub const U64_BYTES: usize = 8;
pub const I32_BYTES: usize = 4;
pub const I16_BYTES: usize = 2;
pub const F32_BYTES: usize = 4;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomRole {
    None = 0,
    Guardian = 1,
    Architect = 2,
    Artisan = 3,
    Parasite = 4,
    Mitochondria = 5,
    MetazoanFlag = 0x80,
}

impl AtomRole {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Guardian,
            2 => Self::Architect,
            3 => Self::Artisan,
            4 => Self::Parasite,
            5 => Self::Mitochondria,
            0x80 => Self::MetazoanFlag,
            _ => Self::None,
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_bonding.md

```markdown
---
id: sigma_bonding
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Solves simultaneous structural bonding intents using spatial hashes
---

# `Bonding Engine`

```rust
// Symbiotic Bonding Engine
// Manages Tensegrity networks through queued `bond_requests` arrays resolved per-tick.

use crate::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Attempts to establish a bond by pushing a request to the `bond_requests` array.
    pub fn push_bond_request(&self, request_idx: usize, initiator_idx: usize, target_idx: usize) {
        if request_idx >= MAX_ATOMS {
            return;
        }

        let ptr = request_idx * 3;
        let bond_atomic = self.bond_requests_atomic();

        // We use the status field (ptr + 2) as our primary lock point. 0 = IDLE, 1 = PENDING.
        // Atoms trying to bind to the same request slot concurrently will race here.
        if bond_atomic[ptr + 2]
            .compare_exchange(
                0,
                1, // Reserve slot as PENDING
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            )
            .is_ok()
        {
            // Successfully claimed the slot. Now we can safely load the data payload.
            // Initiator/Target writes don't need fetch_add since they are protected by the acquired status lock.
            bond_atomic[ptr].store(
                (initiator_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
            bond_atomic[ptr + 1].store(
                (target_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
        }
    }

    /// Evaluates bonding intent mapped during the frame.
    /// Returns the number of successful bonds established.
    pub fn resolve_bond_requests(&mut self) -> i32 {
        let mut resolved = 0;

        for i in 0..MAX_ATOMS {
            let ptr = i * 3;
            let status = self.matrix.bond_requests[ptr + 2];

            if status != 1 {
                // Not active PENDING
                self.matrix.bond_requests[ptr] = 0;
                continue;
            }

            let initiator_plus1 = self.matrix.bond_requests[ptr];
            let target_plus1 = self.matrix.bond_requests[ptr + 1];

            let initiator = (initiator_plus1 - 1) as usize;
            let target = (target_plus1 - 1) as usize;

            if initiator >= MAX_ATOMS || target >= MAX_ATOMS {
                self.matrix.bond_requests[ptr] = 0;
                self.matrix.bond_requests[ptr + 1] = 0;
                self.matrix.bond_requests[ptr + 2] = 0;
                continue;
            }

            if target > 0 {
                // Must ensure atom target still alive
                if self.matrix.ids[target] != 0 {
                    // Set Bond on Initiator's first slot (for simplicity, we mimic deterministic slot 0/1 logic here)
                    // Deno uses setBondTarget(init, 0), setBondTarget(target, 1) mapping.
                    self.matrix.bonds[(initiator * 4) + 0] = target as i32;
                    self.matrix.stiffness[(initiator * 4) + 0] = 0.1;

                    self.matrix.bonds[(target * 4) + 1] = initiator as i32;
                    self.matrix.stiffness[(target * 4) + 1] = 0.1;

                    resolved += 1;
                }
            }

            // Clear request
            self.matrix.bond_requests[ptr] = 0;
            self.matrix.bond_requests[ptr + 1] = 0;
            self.matrix.bond_requests[ptr + 2] = 0;
        }

        resolved
    }
}
```

```

---

## FILE: src/ontology/host/sigma_environment.md

```markdown
---
id: sigma_environment
type: substrate_module
target: rust
level: 2
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Ticks environmental cellular automata, structural cells, and glyphi transport
---

# `Environment` Tick Logic

```rust
use crate::{
    GRID_H, GRID_W, MAX_ATOMS, STR_CAPACITOR, STR_DIODE, STR_INVERTER, STR_LATCH, STR_NODE,
    STR_SOURCE, STR_VOID, STR_WIRE, MAX_GLYPH_AMP, MIN_GLYPH_AMP
};
use crate::SigmaState;

pub fn in_grid(x: i32, y: i32) -> bool {
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
}

pub fn tick_environment(state: &mut SigmaState, tick: i32) {
    tick_structure_grid(state);
    tick_glyph_transport(state);
    tick_synaptic_decay(state, tick);
}

fn unpack_glyph_kind(header: i32) -> i32 {
    header & 0xFF
}

fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8
}

fn pack_glyph_header(kind: i32, amplitude: i32) -> i32 {
    (amplitude << 8) | (kind & 0xFF)
}

fn decay_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let decay_amt = if kind == 2 {
        if abs_amp > 256 {
            3
        } else {
            1
        }
    } else if kind == 1 {
        if abs_amp > 64 {
            8
        } else {
            4
        }
    } else {
        abs_amp
    };
    if amplitude > 0 {
        decay_amt
    } else {
        -decay_amt
    }
}

fn diffusion_share_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let share_amt = if kind == 2 {
        if abs_amp >= 96 {
            abs_amp >> 3
        } else {
            0
        }
    } else if kind == 1 {
        if abs_amp >= 24 {
            abs_amp >> 2
        } else {
            0
        }
    } else {
        0
    };
    if amplitude > 0 {
        share_amt
    } else {
        -share_amt
    }
}

fn deposit_scratch_glyph_header(
    state: &mut SigmaState,
    cell: i32,
    kind: i32,
    amplitude: i32,
    payload_source: Option<[u8; 8]>,
) {
    if amplitude == 0 || cell < 0 || cell >= (GRID_W * GRID_H) {
        return;
    }

    let cell_idx = cell as usize;
    let current = state.matrix.glyph_scratch_header[cell_idx];
    let current_kind = unpack_glyph_kind(current);
    let current_amplitude = unpack_glyph_amplitude(current);

    if current_kind != 0 && current_kind != kind {
        if amplitude.abs() <= current_amplitude.abs() {
            return;
        }
        state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(kind, amplitude);
        if kind == 2 {
            if let Some(payload) = payload_source {
                state.matrix.glyph_scratch_payload[cell_idx] = payload;
            }
        }
        return;
    }

    let mut next_amplitude = current_amplitude + amplitude;
    if next_amplitude > MAX_GLYPH_AMP {
        next_amplitude = MAX_GLYPH_AMP;
    }
    if next_amplitude < MIN_GLYPH_AMP {
        next_amplitude = MIN_GLYPH_AMP;
    }

    let next_kind = if next_amplitude == 0 { 0 } else { kind };
    state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(next_kind, next_amplitude);

    if kind == 2 {
        if let Some(payload) = payload_source {
            state.matrix.glyph_scratch_payload[cell_idx] = payload;
        }
    }
}

pub fn tick_glyph_transport(state: &mut SigmaState) {
    // 1. Clear scratch buffers
    state.matrix.glyph_scratch_header.fill(0);
    state.matrix.glyph_scratch_payload.fill([0; 8]);

    let dx = [-1, 1, 0, 0];
    let dy = [0, 0, -1, 1];

    for cell in 0..(GRID_W * GRID_H) as usize {
        let header = state.matrix.glyph_header[cell];
        if header == 0 {
            continue;
        }

        let kind = unpack_glyph_kind(header);
        let amp = unpack_glyph_amplitude(header);
        if amp == 0 {
            continue;
        }

        let decay = decay_for_kind(kind, amp);

        // Bidirectional Decay
        let retained = if amp > 0 {
            std::cmp::max(0, amp - decay)
        } else {
            std::cmp::min(0, amp - decay)
        };

        if retained.abs() > 0 {
            let payload = if kind == 2 {
                Some(state.matrix.glyph_payload[cell])
            } else {
                None
            };
            deposit_scratch_glyph_header(state, cell as i32, kind, retained, payload);
        }

        let share = diffusion_share_for_kind(kind, amp);
        if share.abs() > 0 {
            let gx = (cell as i32) % GRID_W;
            let gy = (cell as i32) / GRID_W;

            for i in 0..4 {
                let nx = gx + dx[i];
                let ny = gy + dy[i];
                if in_grid(nx, ny) {
                    let next_cell = (ny * GRID_W + nx) as usize;
                    let payload = if share >= 128 || share <= -128 {
                        Some(state.matrix.glyph_payload[cell])
                    } else {
                        None
                    };
                    deposit_scratch_glyph_header(state, next_cell as i32, kind, share, payload);
                }
            }
        }
    }

    // 2. Internal Reflection (Signal -> Pheromone)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let signal = state.matrix.signal_grid[cell];
        let abs_signal = signal.abs();
        if abs_signal >= 1 {
            let mut amp = abs_signal >> 1;
            if amp < 16 {
                amp = 16;
            }
            if amp > 512 {
                amp = 512;
            }
            deposit_scratch_glyph_header(state, cell as i32, 1, amp, None);

            if cell % 32 == 0 {
                state.matrix.secretion_stats[10] += 1; // Signal leak counter
            }
        }
    }

    // 3. Internal Reflection (Memory -> Plasmid)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let mem = state.matrix.memory_grid[cell];
        // Read first 3 bytes as 24-bit little endian charge
        let memory_lo = u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
        let charge = (memory_lo & 0xFFFFFF) as i32;

        if charge >= 1 {
            let mut amp = charge >> 2;
            if amp < 24 {
                amp = 24;
            }
            if amp > 384 {
                amp = 384;
            }
            deposit_scratch_glyph_header(state, cell as i32, 2, amp, Some(mem));

            if cell % 32 == 0 {
                state.matrix.secretion_stats[11] += 1; // Memory leak counter
            }
        }
    }

    // Copy scratch to primary
    state
        .matrix
        .glyph_header
        .copy_from_slice(&state.matrix.glyph_scratch_header);
    state
        .matrix
        .glyph_payload
        .copy_from_slice(&state.matrix.glyph_scratch_payload);
}

fn dir8_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 0,
        2 => 1,
        3 => -1,
        4 => 1,
        5 => -1,
        6 => 0,
        7 => 1,
        _ => 0,
    }
}

fn dir8_y(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => -1,
        2 => -1,
        3 => 0,
        4 => 0,
        5 => 1,
        6 => 1,
        7 => 1,
        _ => 0,
    }
}

fn dir4_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 1,
        2 => 0,
        3 => 0,
        _ => 0,
    }
}

fn dir4_y(n: i32) -> i32 {
    match n {
        0 => 0,
        1 => 0,
        2 => -1,
        3 => 1,
        _ => 0,
    }
}

pub fn tick_structure_grid(state: &mut SigmaState) {
    for y in 0..GRID_H {
        for x in 0..GRID_W {
            let i = (y * GRID_W + x) as usize;
            let mut cell_val = state.matrix.structure_grid[i];
            let owner_raw = state.matrix.structure_build_owner[i];
            let owner = owner_raw & 0x7FFFFFFF; // STRUCTURE_INTENT_OWNER_MASK

            if owner != 0 {
                cell_val = state.matrix.structure_build_value[i];
            }

            let intent_charge_raw = state.matrix.structure_charge_intent[i];
            if intent_charge_raw > 0 {
                let mut intent_charge = intent_charge_raw;
                if intent_charge > 255 {
                    intent_charge = 255;
                }
                let base_charge = (cell_val >> 16) & 0xFF;
                if intent_charge > base_charge {
                    cell_val = (cell_val & !0x00FF0000) | (intent_charge << 16);
                }
            }

            if owner_raw != 0 || intent_charge_raw != 0 {
                state.matrix.structure_grid[i] = cell_val;
                if owner_raw != 0 {
                    state.matrix.structure_build_owner[i] = 0;
                    state.matrix.structure_build_value[i] = 0;
                }
                if intent_charge_raw != 0 {
                    state.matrix.structure_charge_intent[i] = 0;
                }
            }

            let str_type = cell_val & 0xFF;
            let current_charge = (cell_val >> 16) & 0xFF;

            // AUTOPOIESIS: Spontaneous Crystallization
            if str_type == STR_VOID {
                let mut max_n_charge = current_charge;
                for n in 0..8 {
                    let nx = x + dir8_x(n);
                    let ny = y + dir8_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_val = state.matrix.structure_grid[ni];
                        let n_charge = (n_val >> 16) & 0xFF;
                        if n_charge > max_n_charge {
                            max_n_charge = n_charge;
                        }
                    }
                }
                if max_n_charge > 100 {
                    let mut seed_charge = max_n_charge - 20;
                    if seed_charge < 64 {
                        seed_charge = 64;
                    }
                    if seed_charge > 255 {
                        seed_charge = 255;
                    }
                    state.matrix.structure_grid[i] = STR_WIRE | (seed_charge << 16);
                } else if current_charge > 0 {
                    let decayed = if current_charge > 8 {
                        current_charge - 8
                    } else {
                        0
                    };
                    state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (decayed << 16);
                }
                continue;
            }

            let _state_param = (cell_val >> 24) & 0xFF;

            // Resonance Shielding
            let spatial_idx = (y * GRID_W + x) as usize;
            let avg_phase = state.matrix.spatial_grid[spatial_idx * 32 + 31];
            let decay = if avg_phase > 128 { 2 } else { 10 };

            let mut next_charge = if current_charge > decay {
                current_charge - decay
            } else {
                0
            };

            if str_type == STR_SOURCE {
                next_charge = 255;
            } else if str_type == STR_WIRE || str_type == STR_NODE || str_type == STR_CAPACITOR {
                next_charge =
                    update_charge_wire_node_cap(state, x, y, str_type, _state_param, next_charge);
            } else if str_type == STR_DIODE {
                next_charge = update_charge_diode(state, x, y, _state_param, next_charge);
            } else if str_type == STR_INVERTER {
                next_charge = update_charge_inverter(state, x, y);
            } else if str_type == STR_LATCH {
                let (new_state, nc) = update_charge_latch(state, x, y, _state_param);
                if new_state != _state_param {
                    cell_val = (cell_val & 0x00FFFFFF) | (new_state << 24);
                }
                next_charge = nc;
            }

            if str_type != STR_SOURCE && next_charge == 0 {
                let mut stabilized = false;
                for n in 0..4 {
                    let nx = x + dir4_x(n);
                    let ny = y + dir4_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
                        if n_charge > 20 {
                            stabilized = true;
                            break;
                        }
                    }
                }
                if !stabilized {
                    state.matrix.structure_grid[i] = STR_VOID;
                    continue;
                }
            }

            state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (next_charge << 16);
        }
    }
}

fn update_charge_wire_node_cap(
    state: &SigmaState,
    x: i32,
    y: i32,
    str_type: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut max_neighbor_charge = 0;
    let mut charged_count = 0;
    let mut next_charge = current_next_charge;

    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge;
            }
            if n_charge > 50 {
                charged_count += 1;
            }
        }
    }

    if str_type == STR_WIRE {
        let flow = max_neighbor_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    } else if str_type == STR_NODE {
        if cell_state == 1 {
            // AND
            if charged_count >= 2 {
                next_charge = 255;
            }
        } else {
            // OR
            if charged_count >= 1 {
                next_charge = 255;
            }
        }
    } else if str_type == STR_CAPACITOR {
        let flow = max_neighbor_charge - 2;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_diode(
    state: &SigmaState,
    x: i32,
    y: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut nx = x;
    let mut ny = y;
    if cell_state == 0 {
        nx -= 1;
    } else if cell_state == 1 {
        nx += 1;
    } else if cell_state == 2 {
        ny -= 1;
    } else if cell_state == 3 {
        ny += 1;
    }

    let mut next_charge = current_next_charge;
    if in_grid(nx, ny) {
        let ni = (ny * GRID_W + nx) as usize;
        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
        let flow = n_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_inverter(state: &SigmaState, x: i32, y: i32) -> i32 {
    let mut max_neighbor_charge = 0;
    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge; // Inverter passes zero when charged neighbors exist
            }
        }
    }
    if max_neighbor_charge < 50 {
        255
    } else {
        0
    }
}

fn update_charge_latch(state: &SigmaState, x: i32, y: i32, cell_state: i32) -> (i32, i32) {
    let mut new_state = cell_state;

    // n=0 (Left): SET
    let set_x = x + dir4_x(0);
    let set_y = y + dir4_y(0);
    if in_grid(set_x, set_y) {
        let n_charge =
            (state.matrix.structure_grid[(set_y * GRID_W + set_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 1;
        }
    }

    // n=1 (Right): RESET
    let rst_x = x + dir4_x(1);
    let rst_y = y + dir4_y(1);
    if in_grid(rst_x, rst_y) {
        let n_charge =
            (state.matrix.structure_grid[(rst_y * GRID_W + rst_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 0;
        }
    }

    let next_charge = if new_state == 1 { 255 } else { 0 };
    (new_state, next_charge)
}

fn tick_synaptic_decay(state: &mut SigmaState, tick: i32) {
    // Global slow-decay mechanism: Use it or lose it
    if tick % 100 == 0 {
        for bond_idx in 0..(MAX_ATOMS * 4) {
            let weight = state.matrix.synaptic_weights[bond_idx];
            if weight > 0 {
                state.matrix.synaptic_weights[bond_idx] = weight - 1;
            }
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_ffi.md

```markdown
---
id: sigma_ffi
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: FFI bridging logic and memory alignment for WebAssembly workers
---

# `FFI` logic

```rust
#[allow(non_snake_case)]
use std::mem::ManuallyDrop;

// The Deno `SharedArrayBuffer` uses real pointers but from JS the offset starts at 0.
// `SAFETY_BUFFER` ends at exactly 7,999,992.
// `SigmaMatrix` now begins natively at `tick_counter` (offset 7,999,992 in the Deno memory map).
// By taking the 0-indexed memory pointer from WASM + 7,999,992 bytes,
// we alias directly onto our Struct matching JS indices perfectly.

// `SigmaMatrix` logically begins at address SAFETY_BUFFER natively matching the Deno SAB.

/// Creates a safely wrapped `SigmaState` mapping to the imported `SharedArrayBuffer`.
/// `ManuallyDrop` prevents Rust from trying to deallocate the imported WASM memory when `SigmaState` correctly orchestrates its execution horizon and drops.
unsafe fn get_ffi_state() -> ManuallyDrop<SigmaState> {
    // In wasm32-unknown-unknown with import-memory, address 0 is the start of linear memory.
    let base_ptr = crate::SAFETY_BUFFER as *mut crate::SigmaMatrix;
    let state = unsafe { SigmaState::from_raw(base_ptr) };
    ManuallyDrop::new(state)
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_instruction(idx: usize, pc: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.instructions[idx][pc] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_xs(idx: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.xs[idx] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn execute_atom(idx: usize) {
    let mut state = unsafe { get_ffi_state() };
    let mut vm = crate::LambdaVM::new();
    vm.step(&mut state, idx);
}

#[unsafe(no_mangle)]
#[export_name = "tick_environment"]
pub extern "C" fn ffi_tick_environment(tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_environment(&mut state, tick as i32);
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_matrix() {
    let _state = unsafe { get_ffi_state() };
    // Assuming mapping to pulse double buffering of coords natively:
    // (This existed in JS before pulse.rs orchestrator took over in Rust)
    // For now we'll do nothing, as PulseOrchestrator handles this.
}

#[unsafe(no_mangle)]
#[export_name = "tick_structure_grid"]
pub extern "C" fn ffi_tick_structure_grid() {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_structure_grid(&mut state);
}

use std::cell::RefCell;

thread_local! {
    static VISITED_POOL: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(crate::MAX_ATOMS));
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_membrane_physics() {
    let mut state = unsafe { get_ffi_state() };

    VISITED_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        visited.clear();
        visited.resize(crate::MAX_ATOMS, 0);

        for i in 1..crate::MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !(crate::AtomRole::MetazoanFlag as u8);
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        for start_node in 1..crate::MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &crate::SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0
                        && target < crate::MAX_ATOMS
                        && state.matrix.ids[target] != 0
                    {
                        if target == start && depth >= 2 {
                            return true;
                        }
                        if target < start {
                            continue;
                        }
                        if !path.contains(&target) {
                            path.push(target);
                            if dfs(target, start, depth + 1, path, state) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
                false
            }

            if dfs(start_node, start_node, 0, &mut path, &*state) {
                rings.push(path.clone());
                for &node in &path {
                    visited[node] = 1;
                }
            }
        }

        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32;

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
            }
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn build_spatial_hash() {
    let mut state = unsafe { get_ffi_state() };
    state.build_spatial_hash();
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_overflow_count() -> i32 {
    0 // Deprecated in favor of direct metric array
}

// Memory mapping diagnosis hook
#[unsafe(no_mangle)]
pub extern "C" fn verify_memory_alignment(idx: usize, val: i32) {
    let state = unsafe { get_ffi_state() };
    state.xs_atomic()[idx].store(val as i16, std::sync::atomic::Ordering::Relaxed);
    state.context_atomic(idx)[0].store(val, std::sync::atomic::Ordering::Relaxed);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_max_cell_count() -> i32 {
    0 // Deprecated
}

#[unsafe(no_mangle)]
pub extern "C" fn reduce_atom_deltas(_start_idx: usize, _end_idx: usize) {
    // Handled generically by PulseOrchestrator now
}

#[unsafe(no_mangle)]
pub extern "C" fn get_neural_coherence() -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence
}

#[unsafe(no_mangle)]
pub extern "C" fn set_neural_coherence(val: i32) {
    let mut state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence = val;
}

#[unsafe(no_mangle)]
#[export_name = "tickGlyphTransport"]
pub extern "C" fn ffi_tick_glyph_transport(_tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_glyph_transport(&mut state);
}

#[unsafe(no_mangle)]
pub extern "C" fn resolve_bond_requests(_start: usize, _end: usize) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.resolve_bond_requests()
}

#[unsafe(no_mangle)]
pub extern "C" fn drain_spawn_requests(tick: u32) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.drain_spawn_requests(tick as i32)
}

#[unsafe(no_mangle)]
pub extern "C" fn clear_metabolism_stats() {
    // Replaced by application tick resetting local state inside Deno,
    // but exported to fulfill module demands.
}

#[unsafe(no_mangle)]
pub extern "C" fn accumulate_metabolism_stats(_start: usize, _end: usize) {
    // Reduced natively in Deno JS space with the Rust `reduce_atom_deltas` side effects.
}

#[unsafe(no_mangle)]
pub extern "C" fn apply_metabolism_kernel(
    _param1: i32,
    _param2: i32,
    _param3: i32,
    _param4: i32,
    _param5: i32,
    _param6: i32,
    _param7: i32,
    _param8: i32,
    _param9: i32,
    _param10: i32,
    _param11: i32,
    _param12: i32,
) {
    // Implemented internally via `pulse.rs` `apply_metabolism_kernel`.
}

#[unsafe(no_mangle)]
pub extern "C" fn run_shadow_simulation_ffi(
    atom_id: u32,
    ticks: u32,
    logic_ptr: u32,
    result_ptr: u32,
) -> i32 {
    let state = unsafe { get_ffi_state() };

    // The logic_ptr and result_ptr are offsets into the linear WASM memory (usually starts at 0).
    // The memory itself was built on JS `SharedArrayBuffer` mapping properly mapped against zero.
    // Ensure bounds are safe because OOB memory causes unreachable panic.
    if logic_ptr as usize + 64 > 500_039_680 || result_ptr as usize + 32 > 500_039_680 {
        return 0; // Failure
    }

    let hallucination_bytes = unsafe { &*(logic_ptr as usize as *const [u8; 64]) };

    let tick_ptr = 7_999_992 as *const i32;
    let start_tick = unsafe { *tick_ptr as u32 };

    let metrics = crate::run_shadow_simulation(
        &state,
        atom_id as u64,
        hallucination_bytes,
        ticks,
        start_tick,
    );

    // Write back the 32-byte struct to the provided result pointer
    // Structure: [energy_diff, resonance_diff, bonds_broken, bonds_formed, structural_value_change, population_diff, coherence_diff, divergence_tick]
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut i32, 8) };
    result_slice[0] = metrics.energy_diff;
    result_slice[1] = metrics.resonance_diff;
    result_slice[2] = metrics.bonds_broken as i32;
    result_slice[3] = metrics.bonds_formed as i32;
    result_slice[4] = metrics.structural_value_change;
    result_slice[5] = metrics.population_diff;
    result_slice[6] = metrics.coherence_diff;
    result_slice[7] = metrics.divergence_tick as i32;

    1 // Success indicator
}

#[unsafe(no_mangle)]
pub extern "C" fn generate_epoch_proof_ffi(tick: u32, result_ptr: u32) {
    use sha2::{Digest, Sha256};
    let state = unsafe { get_ffi_state() };
    let mut hasher = Sha256::new();

    hasher.update(tick.to_le_bytes());

    for i in 1..crate::MAX_ATOMS {
        let id = state.matrix.ids[i];
        if id != 0 {
            hasher.update(id.to_le_bytes());
            hasher.update(state.matrix.energy[i].to_le_bytes());
            hasher.update(state.matrix.resonance[i].to_le_bytes());
            hasher.update(state.matrix.xs[i].to_le_bytes());
            hasher.update(state.matrix.ys[i].to_le_bytes());
            hasher.update(state.matrix.phase[i].to_le_bytes());
            hasher.update(state.matrix.logic[i]);
        }
    }

    for i in 0..crate::GRID_CELLS {
        let owner = state.matrix.structure_build_owner[i];
        if owner > 0 {
            hasher.update((i as u32).to_le_bytes());
            hasher.update(owner.to_le_bytes());
            hasher.update(state.matrix.structure_build_value[i].to_le_bytes());
            hasher.update(state.matrix.structure_charge_intent[i].to_le_bytes());
        }
    }

    let result = hasher.finalize();
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut u8, 32) };
    result_slice.copy_from_slice(&result);
}
```

```

---

## FILE: src/ontology/host/sigma_glyph_transport.md

```markdown
---
id: sigma_glyph_transport
type: substrate_module
target: rust
level: 2
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Handles wave interference physics and optical secretion
---

# `Glyph Transport`

```rust
use crate::{MAX_GLYPH_AMP, MIN_GLYPH_AMP};
use crate::SigmaState;

pub fn unpack_glyph_kind(header: i32) -> u8 {
    (header & 0xFF) as u8
}

pub fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8 // signed arithmetic shift
}

pub fn pack_glyph_header(kind: u8, amplitude: i32) -> i32 {
    let mut amp = amplitude;
    if amp > MAX_GLYPH_AMP {
        amp = MAX_GLYPH_AMP;
    }
    if amp < MIN_GLYPH_AMP {
        amp = MIN_GLYPH_AMP;
    }
    (amp << 8) | (kind as i32 & 0xFF)
}

impl SigmaState {
    /// Models optical wave interference on a flat 2D grid cell.
    pub fn atomic_deposit_glyph_header(&self, cell: usize, kind: u8, amplitude: i32) {
        if amplitude == 0 || cell >= crate::GRID_CELLS {
            return;
        }

        let current = self.matrix.glyph_header[cell];
        let current_kind = unpack_glyph_kind(current);
        let current_amp = unpack_glyph_amplitude(current);

        // Mismatched kind prioritization (overwrite if strictly stronger, else annihilated/blocked)
        if current_kind != 0 && current_kind != kind {
            if amplitude.abs() > current_amp.abs() {
                self.glyph_header_atomic()[cell].store(
                    pack_glyph_header(kind, amplitude) as u32,
                    std::sync::atomic::Ordering::Relaxed,
                );
            }
        } else {
            // Matching kind (or zeroed cell): additive wave interference
            let mut next_amplitude = current_amp + amplitude;
            if next_amplitude > MAX_GLYPH_AMP {
                next_amplitude = MAX_GLYPH_AMP;
            }
            if next_amplitude < MIN_GLYPH_AMP {
                next_amplitude = MIN_GLYPH_AMP;
            }

            // Annihilation (perfect destructive interference) clears the cell kind
            let next_kind = if next_amplitude == 0 { 0 } else { kind };

            self.glyph_header_atomic()[cell].store(
                pack_glyph_header(next_kind, next_amplitude) as u32,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_isa.md

```markdown
---
id: sigma_isa
type: substrate_module
target: rust
level: 1
deps:
description: Defines the Instruction Set Architecture values for the interpreter.
---

# `ISA` Constants

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum GlyphOp {
    Nop = 0x00,
    Set = 0x01,
    Get = 0x02,
    Put = 0x03,
    Add = 0x04,
    Sub = 0x05,
    Jz = 0x10,
    Jnz = 0x11,
    Jmp = 0x12,
    // Future syscalls
    Syscall = 0x60,
    Replicate = 0x80,
    Signal = 0x81,
    Bind = 0x82,
    Share = 0x83,
    Hebb = 0x8A,
    Fire = 0x8B,
    Decay = 0x91,
    Plug = 0xA4,
    Tensegrity = 0xA5,
    Collective = 0xA6,
    Build = 0xA8,
    Sense = 0xA9,
    SecretePlasmid = 0xAA,
    IncorporatePlasmid = 0xAB,
    Resolve = 0xB0,
    ResonateKuramoto = 0xB1,
    Unknown = 0xFF,
}

impl From<u8> for GlyphOp {
    fn from(val: u8) -> Self {
        match val {
            0x00 => GlyphOp::Nop,
            0x01 => GlyphOp::Set,
            0x02 => GlyphOp::Get,
            0x03 => GlyphOp::Put,
            0x04 => GlyphOp::Add,
            0x05 => GlyphOp::Sub,
            0x10 => GlyphOp::Jz,
            0x11 => GlyphOp::Jnz,
            0x12 => GlyphOp::Jmp,
            0x60 => GlyphOp::Syscall,
            0x80 => GlyphOp::Replicate,
            0x81 => GlyphOp::Signal,
            0x82 => GlyphOp::Bind,
            0x83 => GlyphOp::Share,
            0x8A => GlyphOp::Hebb,
            0x8B => GlyphOp::Fire,
            0x91 => GlyphOp::Decay,
            0xA4 => GlyphOp::Plug,
            0xA5 => GlyphOp::Tensegrity,
            0xA6 => GlyphOp::Collective,
            0xA8 => GlyphOp::Build,
            0xA9 => GlyphOp::Sense, // Structure Sense
            0xAA => GlyphOp::SecretePlasmid,
            0xAB => GlyphOp::IncorporatePlasmid,
            0xB0 => GlyphOp::Resolve,
            0xB1 => GlyphOp::ResonateKuramoto,
            _ => GlyphOp::Unknown,
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_math.md

```markdown
---
id: sigma_math
type: substrate_module
target: rust
level: 2
deps:
description: Mathematical Coprocessor (Deterministic LUT Trigonometry)
---

# `Math Coprocessor`

```rust
// Flatten the levels backwards into the math namespace so external code can just use `crate::math_sin`
pub use crate::ontology_gen::L01::*;
pub use crate::ontology_gen::L00::*;
```

```

---

## FILE: src/ontology/host/sigma_memory.md

```markdown
---
id: sigma_memory
type: substrate_module
target: rust
deps: 
  - SYSTEM_CONSTANTS
  - GRID_METRICS
description: The central Data-Oriented memory matrix that perfectly aligns with Deno's SharedArrayBuffer
---

# `SigmaMatrix` & `SigmaState` definition

```rust
// Sigma-Core Memory Layout
// Byte-for-byte compatible with OMEGA-64 OFFSETS.ts

/// The central Data-Oriented memory matrix that perfectly aligns with Deno's `SharedArrayBuffer`
#[repr(C)]
pub struct SigmaMatrix {
    pub ids: [u64; MAX_ATOMS],
    pub xs: [i16; MAX_ATOMS],
    pub ys: [i16; MAX_ATOMS],
    pub energy: [i32; MAX_ATOMS],
    pub resonance: [i32; MAX_ATOMS],
    pub phase: [i32; MAX_ATOMS],
    pub logic: [[u8; ATOM_GENOME_SIZE]; MAX_ATOMS],
    pub bonds: [i32; MAX_ATOMS * 4],
    pub stiffness: [f32; MAX_ATOMS * 4],
    pub instructions: [[u8; ATOM_INSTRUCTION_SIZE]; MAX_ATOMS],
    pub context: [[i32; ATOM_CONTEXT_SIZE]; MAX_ATOMS],
    pub evolution_reserved: [i32; MAX_ATOMS],
    pub spawn_requests: [u8; 8 + (MAX_SPAWN_REQUESTS * 24)],
    pub meiosis_reserved: [i32; MAX_MEIOSIS_EVENTS], // Size 300,000 bytes
    pub _pad_to_bond_requests: [u8; 112024584 - (106024584 + (MAX_MEIOSIS_EVENTS * 4))], // 112024584 - 106324584 = 5700000 bytes
    pub bond_requests: [i32; MAX_ATOMS * 3],
    pub spatial_grid: [i32; GRID_CELLS * 32],
    pub roles: [u8; MAX_ATOMS],
    pub structure_grid: [i32; GRID_CELLS],
    pub signal_grid: [i32; GRID_CELLS],
    pub memory_grid: [[u8; 8]; GRID_CELLS],
    pub ascension_stats_reserved: [i32; MAX_ASCENSION_STATS_RESERVED],
    pub bond_distances: [u8; MAX_ATOMS * 4],
    pub synaptic_weights: [u8; MAX_ATOMS * 4],
    pub damping: [u8; MAX_ATOMS],
    pub causality: [u8; MAX_ATOMS],
    pub hive_memory: [u8; HIVE_MEMORY_SIZE],
    pub hive_balance: i32,
    pub quorum: [i32; GRID_CELLS * 8],
    pub coherence: i32,
    pub neural_coherence: i32,
    pub physics_read_xs: [i16; MAX_ATOMS],
    pub physics_read_ys: [i16; MAX_ATOMS],
    pub physics_read_energy: [i32; MAX_ATOMS],
    pub physics_read_resonance: [i32; MAX_ATOMS],
    pub energy_delta: [i32; MAX_ATOMS],
    pub resonance_delta: [i32; MAX_ATOMS],
    pub structure_build_owner: [i32; GRID_CELLS],
    pub structure_build_value: [i32; GRID_CELLS],
    pub structure_charge_intent: [i32; GRID_CELLS],
    pub attention_field: [f32; GRID_CELLS],
    pub hive_energy_pool: [i32; HIVE_ENERGY_POOL_SIZE],
    pub glyph_header: [i32; GRID_CELLS],
    pub glyph_payload: [[u8; 8]; GRID_CELLS],
    pub glyph_scratch_header: [i32; GRID_CELLS],
    pub glyph_scratch_payload: [[u8; 8]; GRID_CELLS],
    pub hormones: [u16; MAX_HORMONES],
    pub secretion_stats: [i32; SECRETION_STATS_SIZE],
    pub _pad_to_lineage: [u8; 4],
    pub lineage: [u64; MAX_ATOMS],
    pub mailbox: [[i32; 2]; MAX_ATOMS],
    pub ledger_head: i32,
    pub ledger_data: [[i32; 4]; MAX_LEDGER_EVENTS],
    pub egress_head: i32,
    pub egress_data: [[u8; 256]; MAX_EGRESS_EVENTS],
}

pub struct SigmaState {
    pub matrix: Box<SigmaMatrix>,
    pub free_search_cursor: usize,
}

impl SigmaState {
    pub fn new() -> Self {
        Self {
            // Unsafe required because initializing an 54MB struct on the stack would overflow.
            // Using zeroed allocation directly onto the heap.
            matrix: unsafe {
                let layout = std::alloc::Layout::new::<SigmaMatrix>();
                let ptr = std::alloc::alloc_zeroed(layout) as *mut SigmaMatrix;
                Box::from_raw(ptr)
            },
            free_search_cursor: 1,
        }
    }

    /// SAFETY: ptr must be valid, aligned, and writeable (typically mapped to a JS SharedArrayBuffer)
    pub unsafe fn from_raw(ptr: *mut SigmaMatrix) -> Self {
        Self {
            matrix: unsafe { Box::from_raw(ptr) },
            free_search_cursor: 1,
        }
    }
}
impl Clone for SigmaState {
    fn clone(&self) -> Self {
        let mut new_state = Self::new();
        unsafe {
            std::ptr::copy_nonoverlapping(
                self.matrix.as_ref() as *const SigmaMatrix,
                new_state.matrix.as_mut() as *mut SigmaMatrix,
                1,
            );
        }
        new_state
    }
}

impl SigmaState {
    /// Returns a slice of AtomicI32 mapping directly to the `spatial_grid` array
    /// Safe because `AtomicI32` has the exact same memory layout as `i32` (`repr(C)` transparent).
    #[inline]
    pub fn phase_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.phase.as_ptr() as *const std::sync::atomic::AtomicI32,
                MAX_ATOMS,
            )
        }
    }

    pub fn ids_atomic(&self) -> &[std::sync::atomic::AtomicU64] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ids.as_ptr() as *const std::sync::atomic::AtomicU64,
                MAX_ATOMS,
            )
        }
    }

    pub fn context_atomic(&self, atom_idx: usize) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.context[atom_idx].as_ptr() as *const std::sync::atomic::AtomicI32,
                ATOM_CONTEXT_SIZE,
            )
        }
    }

    pub fn xs_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.xs.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn roles_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.roles.as_ptr() as *const std::sync::atomic::AtomicU8,
                MAX_ATOMS,
            )
        }
    }

    pub fn ys_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ys.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn hive_memory_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hive_memory.as_ptr() as *const std::sync::atomic::AtomicU8,
                HIVE_MEMORY_SIZE,
            )
        }
    }

    pub fn glyph_header_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_header.as_ptr() as *const std::sync::atomic::AtomicU32,
                GRID_CELLS,
            )
        }
    }

    pub fn glyph_payload_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_payload.as_ptr() as *const std::sync::atomic::AtomicU8,
                GRID_CELLS * 8,
            )
        }
    }

    pub fn stiffness_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.stiffness.as_ptr() as *const std::sync::atomic::AtomicU32,
                MAX_ATOMS * 4,
            )
        }
    }

    pub fn synaptic_weights_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.synaptic_weights.as_ptr() as *const std::sync::atomic::AtomicU8,
                MAX_ATOMS * 4,
            )
        }
    }

    pub fn spatial_grid_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spatial_grid.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.spatial_grid.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_charge_intent` array
    #[inline]
    pub fn structure_charge_intent_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_charge_intent.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_charge_intent.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_build_owner` array
    #[inline]
    pub fn structure_build_owner_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_owner.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_owner.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `bond_requests` array
    #[inline]
    pub fn bond_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.bond_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.bond_requests.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping to the `spawn_requests` head pointers.
    /// The first 8 bytes of `spawn_requests` are the write and read heads (i32 each).
    #[inline]
    pub fn spawn_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spawn_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                2, // We only need the first two AtomicI32s (write_head and read_head)
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `quorum` array
    #[inline]
    pub fn quorum_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.quorum.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.quorum.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `energy` array
    #[inline]
    pub fn energy_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.energy.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.energy.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `resonance` array
    #[inline]
    pub fn resonance_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.resonance.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.resonance.len(),
            )
        }
    }

    /// Returns a mutable reference to the atomic `hive_balance`
    #[inline]
    pub fn hive_balance_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe {
            &*(&self.matrix.hive_balance as *const i32 as *const std::sync::atomic::AtomicI32)
        }
    }

    pub fn allocate(&mut self) -> Option<usize> {
        for i in 1..MAX_ATOMS {
            if self.matrix.ids[i] == 0 {
                return Some(i);
            }
        }
        None
    }

    pub fn recycle_atom(&mut self, idx: usize) {
        self.matrix.ids[idx] = 0;
        self.matrix.energy[idx] = 0;
        self.matrix.resonance[idx] = 0;
        self.matrix.xs[idx] = 0;
        self.matrix.ys[idx] = 0;
        self.matrix.phase[idx] = 0;
        self.matrix.logic[idx].fill(0);
        self.matrix.instructions[idx].fill(0);
        self.matrix.context[idx].fill(0);
        for i in 0..4 {
            let b = (idx * 4) + i;
            self.matrix.bonds[b] = 0;
            self.matrix.stiffness[b] = 0.0;
            self.matrix.bond_distances[b] = 0;
            self.matrix.synaptic_weights[b] = 0;
        }
        self.matrix.roles[idx] = 0;
    }

    pub fn set_energy(&mut self, index: usize, energy: i32) {
        if index < MAX_ATOMS {
            self.matrix.energy[index] = energy;
        }
    }

    pub fn read_genome(&self, index: usize) -> Option<&[u8]> {
        if index < MAX_ATOMS {
            Some(&self.matrix.logic[index])
        } else {
            None
        }
    }

    pub fn egress_head_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe { &*(&self.matrix.egress_head as *const i32 as *const std::sync::atomic::AtomicI32) }
    }

    pub fn dispatch_egress(&self, atom_idx: usize, nx: i32, ny: i32, current_energy: i32) {
        let max_events = 8192;
        let head = self
            .egress_head_atomic()
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let idx = (head as usize) % max_events;

        let mut payload = [0u8; 256];
        payload[0..ATOM_INSTRUCTION_SIZE].copy_from_slice(&self.matrix.instructions[atom_idx]);
        payload[64..68].copy_from_slice(&current_energy.to_le_bytes());
        payload[68..72].copy_from_slice(&self.matrix.phase[atom_idx].to_le_bytes());
        payload[72..76].copy_from_slice(&self.matrix.resonance[atom_idx].to_le_bytes());
        payload[76..80].copy_from_slice(&nx.to_le_bytes());
        payload[80..84].copy_from_slice(&ny.to_le_bytes());

        for i in 0..ATOM_CONTEXT_SIZE {
            let offset = 84 + (i * 4);
            payload[offset..offset + 4]
                .copy_from_slice(&self.matrix.context[atom_idx][i].to_le_bytes());
        }

        payload[148] = self.matrix.roles[atom_idx];

        unsafe {
            let egress_ptr = self.matrix.egress_data.as_ptr() as *mut u8;
            let slot_ptr = egress_ptr.add(idx * 256);
            std::ptr::copy_nonoverlapping(payload.as_ptr(), slot_ptr, 256);
        }
    }
}

// -----------------------------------------------------------------------------
// Type Checks & Padding Validations
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::offset_of;
    // The Deno `SharedArrayBuffer` expects these exact byte offsets mapping to `OFFSETS.ts`:
    // export const MAX_ATOMS = 500000;
    // export const SAFETY_BUFFER = 8000000;
    // export const IDS_OFFSET = 8000000;
    // export const XS_OFFSET = 12000000;
    #[test]
    fn verify_memory_offsets() {
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ids),
            SAFETY_BUFFER + (8000000 - 8000000),
            "ids"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, xs),
            SAFETY_BUFFER + (12000000 - 8000000),
            "xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ys),
            SAFETY_BUFFER + (13000000 - 8000000),
            "ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy),
            crate::ENERGY_OFFSET,
            "energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance),
            crate::RESONANCE_OFFSET,
            "resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, phase),
            crate::PHASE_OFFSET,
            "phase"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, logic),
            crate::LOGIC_OFFSET,
            "logic"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bonds),
            crate::BONDS_OFFSET,
            "bonds"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, stiffness),
            crate::STIFFNESS_OFFSET,
            "stiffness"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, instructions),
            crate::INSTRUCTIONS_OFFSET,
            "instructions"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, context),
            crate::CONTEXT_OFFSET,
            "context"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, evolution_reserved),
            crate::EVOLUTION_OFFSET,
            "evolution_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spawn_requests),
            crate::SPAWN_REQUESTS_OFFSET,
            "spawn_requests"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, meiosis_reserved),
            crate::MEIOSIS_OFFSET,
            "meiosis_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_requests),
            crate::BOND_REQUESTS_OFFSET,
            "bond_requests"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spatial_grid),
            crate::SPATIAL_GRID_OFFSET,
            "spatial_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, roles),
            crate::ROLES_OFFSET,
            "roles"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_grid),
            crate::STRUCTURE_GRID_OFFSET,
            "structure_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, signal_grid),
            crate::SIGNAL_GRID_OFFSET,
            "signal_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, memory_grid),
            crate::MEMORY_GRID_OFFSET,
            "memory_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ascension_stats_reserved),
            crate::ASCENSION_STATS_OFFSET,
            "ascension_stats_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_distances),
            crate::BOND_DISTANCES_OFFSET,
            "bond_distances"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, synaptic_weights),
            crate::SYNAPTIC_WEIGHTS_OFFSET,
            "synaptic_weights"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, damping),
            crate::DAMPING_OFFSET,
            "damping"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, causality),
            crate::CAUSALITY_OFFSET,
            "causality"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_memory),
            crate::HIVE_MEMORY_OFFSET,
            "hive_memory"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_balance),
            crate::HIVE_BALANCE_OFFSET,
            "hive_balance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, quorum),
            crate::QUORUM_OFFSET,
            "quorum"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, coherence),
            crate::COHERENCE_OFFSET,
            "coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, neural_coherence),
            crate::NEURAL_COHERENCE_OFFSET,
            "neural_coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_xs),
            crate::PHYSICS_READ_XS_OFFSET,
            "physics_read_xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_ys),
            crate::PHYSICS_READ_YS_OFFSET,
            "physics_read_ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_energy),
            crate::PHYSICS_READ_ENERGY_OFFSET,
            "physics_read_energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_resonance),
            crate::PHYSICS_READ_RESONANCE_OFFSET,
            "physics_read_resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy_delta),
            crate::ENERGY_DELTA_OFFSET,
            "energy_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance_delta),
            crate::RESONANCE_DELTA_OFFSET,
            "resonance_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_owner),
            crate::STRUCTURE_BUILD_OWNER_OFFSET,
            "structure_build_owner"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_value),
            crate::STRUCTURE_BUILD_VALUE_OFFSET,
            "structure_build_value"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_charge_intent),
            crate::STRUCTURE_CHARGE_INTENT_OFFSET,
            "structure_charge_intent"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, attention_field),
            crate::ATTENTION_FIELD_OFFSET,
            "attention_field"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_energy_pool),
            crate::HIVE_ENERGY_POOL_OFFSET,
            "hive_energy_pool"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_header),
            crate::GLYPH_HEADER_OFFSET,
            "glyph_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_payload),
            crate::GLYPH_PAYLOAD_OFFSET,
            "glyph_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_header),
            crate::GLYPH_SCRATCH_HEADER_OFFSET,
            "glyph_scratch_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_payload),
            crate::GLYPH_SCRATCH_PAYLOAD_OFFSET,
            "glyph_scratch_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hormones),
            crate::HORMONE_OFFSET,
            "hormones"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, secretion_stats),
            crate::SECRETION_STATS_OFFSET,
            "secretion_stats"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, lineage),
            crate::LINEAGE_OFFSET,
            "lineage"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, mailbox),
            crate::MAILBOX_OFFSET,
            "mailbox"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_head),
            crate::LEDGER_HEAD_OFFSET,
            "ledger_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_data),
            crate::LEDGER_DATA_OFFSET,
            "ledger_data"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_head),
            crate::EGRESS_HEAD_OFFSET,
            "egress_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_data),
            crate::EGRESS_DATA_OFFSET,
            "egress_data"
        );
    }
}
```

```

---

## FILE: src/ontology/host/sigma_pulse.md

```markdown
---
id: sigma_pulse
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Multithreaded tick orchestrator and phase sequencer using Rayon
---

# `PulseOrchestrator` implementation

```rust
use crate::{GRID_H, GRID_W, MAX_ATOMS};
use crate::{LambdaVM, SigmaState};
use rayon::prelude::*;

pub struct PulseOrchestrator<'a> {
    pub visited: &'a mut [u8],
}

impl<'a> PulseOrchestrator<'a> {
    pub fn new(buffer: &'a mut [u8]) -> Self {
        Self { visited: buffer }
    }

    pub fn tick(&mut self, state: &mut SigmaState, tick_number: u32) {
        // 1. Spatial Hash
        state.build_spatial_hash();

        // 2. Sync Read Views (Double Buffering)
        state
            .matrix
            .physics_read_xs
            .copy_from_slice(&state.matrix.xs);
        state
            .matrix
            .physics_read_ys
            .copy_from_slice(&state.matrix.ys);
        state
            .matrix
            .physics_read_energy
            .copy_from_slice(&state.matrix.energy);
        state
            .matrix
            .physics_read_resonance
            .copy_from_slice(&state.matrix.resonance);

        // 3. Execution Phase (Parallelizing over all logical atom indices)
        (1..MAX_ATOMS).for_each(|i| {
            if state.matrix.ids[i] != 0 {
                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0
                        && (target as usize) < MAX_ATOMS
                        && state.matrix.ids[target as usize] != 0
                    {
                        mass += 1;
                    }
                }

                if tick_number % mass == 0 {
                    let mut vm = LambdaVM::new(); // VM has no deep state, very cheap to allocate
                    vm.step(state, i);
                }
            }
        });

        // 4. Resolution Phase
        state.resolve_bond_requests();
        let _ = state.drain_spawn_requests(tick_number as i32);

        // 5. Environment Phase
        crate::tick_glyph_transport(state);
        crate::tick_structure_grid(state);

        // 6. Metabolism Phase & 7. Immune Phase (GC)
        let base_entropy_tax = 10;
        let base_friction = 5;

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                let role = state.matrix.roles[i] & 0x7F;

                let mut e = state.matrix.energy[i];

                if role == 5 {
                    // ROLE_MITOCHONDRIA
                    let host_idx = state.matrix.context[i][12] as usize;
                    if host_idx > 0 && host_idx < MAX_ATOMS && state.matrix.ids[host_idx] != 0 {
                        // Enforce Coordinate Lock
                        state.matrix.xs[i] = state.matrix.xs[host_idx];
                        state.matrix.ys[i] = state.matrix.ys[host_idx];

                        // Pay up 90% of current energy
                        if e > crate::SCALE {
                            let transfer = ((e - crate::SCALE) as f64 * 0.9) as i32;
                            if transfer > 0 {
                                state.matrix.energy[host_idx] += transfer;
                                e -= transfer;
                            }
                        }
                        state.matrix.energy[i] = e;
                    } else {
                        // Host died
                        state.matrix.energy[i] = 0;
                        state.matrix.ids[i] = 0;
                        state.matrix.roles[i] = 0;
                    }
                    continue;
                }

                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0
                        && (target as usize) < MAX_ATOMS
                        && state.matrix.ids[target as usize] != 0
                    {
                        mass += 1;
                    }
                }

                let effective_tax = base_entropy_tax / mass;

                e -= effective_tax;
                e -= base_friction; // Friction remains constant for mechanical movement parity

                if e <= 0 {
                    // PH 43: Fossilization Check
                    let resonance = state.matrix.resonance[i];
                    let role = state.matrix.roles[i] & 0x7F; // Strip metazoan flag
                    let has_immunity =
                        state.matrix.context[i][13] != 0 || state.matrix.context[i][14] != 0;

                    if resonance > 100 || role == 2 || role == 3 || mass > 2 || has_immunity {
                        let cx = state.matrix.xs[i] as usize;
                        let cy = state.matrix.ys[i] as usize;
                        let gx = cx / (crate::SCALE as usize);
                        let gy = cy / (crate::SCALE as usize);

                        if gx < (GRID_W as usize) && gy < (GRID_H as usize) {
                            let cell_idx = gy * (GRID_W as usize) + gx;
                            let structure_val = state.matrix.structure_grid[cell_idx];
                            let structure_type = structure_val & 0xFF;

                            // 1. Structural Crystallization
                            if structure_type == 0 || structure_type == 1 {
                                let mut charge = resonance.clamp(10, 255);
                                let base_charge = (structure_val >> 16) & 0xFF;
                                charge = std::cmp::max(charge, base_charge);

                                let new_type = if role == 3 {
                                    6 // STR_CAPACITOR (Architects leave energy banks)
                                } else {
                                    1 // STR_WIRE (Guardians and others leave hardened walls/pathways)
                                };

                                state.matrix.structure_grid[cell_idx] = new_type | (charge << 16);
                            }

                            // 2. Epigenetic Hash Trace (CRISPR memory spill)
                            let mut scroll_hash = state.matrix.context[i][13];
                            if scroll_hash == 0 {
                                scroll_hash = state.matrix.context[i][14];
                            }

                            if scroll_hash != 0 {
                                let mut mem = state.matrix.memory_grid[cell_idx];

                                // To organically decay into a kind=2 plasmid via tick_glyph_transport,
                                // memory_grid triggers off of the first 3-bytes being a 24-bit charge >= 1.
                                // We'll put the scroll into the 4 upper bytes (4..8) as payload,
                                // and set the first byte to a minimal charge trigger if not already charged.
                                mem[4] = ((scroll_hash >> 24) & 0xFF) as u8;
                                mem[5] = ((scroll_hash >> 16) & 0xFF) as u8;
                                mem[6] = ((scroll_hash >> 8) & 0xFF) as u8;
                                mem[7] = (scroll_hash & 0xFF) as u8;

                                // memory_lo triggers charge.
                                let memory_lo =
                                    u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
                                let mut charge = (memory_lo & 0xFFFFFF) as i32;
                                if charge < 100 {
                                    charge = 100; // Provide enough plasma generic charge to bleed off into a kind=2
                                    mem[0] = (charge & 0xFF) as u8;
                                    mem[1] = ((charge >> 8) & 0xFF) as u8;
                                    mem[2] = ((charge >> 16) & 0xFF) as u8;
                                    // keep mem[3] unaltered
                                }

                                state.matrix.memory_grid[cell_idx] = mem;
                            }
                        }
                    }

                    state.recycle_atom(i);
                } else {
                    state.matrix.energy[i] = e;
                }
            }
        }

        // 8. Membrane Physics (Metazoan Emergence)
        self.visited.fill(0);

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !0x80;
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        // Detect simple topological cycles (length 3 to 8)
        for start_node in 1..MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || self.visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                        if target == start && depth >= 2 {
                            return true;
                        }
                        // Prune duplicate or overlapping loops natively
                        if target < start {
                            continue;
                        }
                        if !path.contains(&target) {
                            path.push(target);
                            if dfs(target, start, depth + 1, path, state) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
                false
            }

            if dfs(start_node, start_node, 0, &mut path, &*state) {
                rings.push(path.clone());
                for &node in &path {
                    self.visited[node] = 1;
                }
            }
        }

        // Resource Pooling and Stealth Flagging
        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
                // Metazoan flag
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32; // Shield Defense

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
            }
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_replication.md

```markdown
---
id: sigma_replication
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Manages autopoietic mitosis processes and genome verification
---

# `Replication Engine`

```rust
// Replication Engine
// Handles the queued spawn requests and materializes new atoms into the Matrix at the end of each tick.

use crate::{SigmaState, MAX_ATOMS};
use crate::{SPAWN_MAX, SPAWN_SLOT};

impl SigmaState {
    /// Pushes a spawn request into the ring-buffer at the current write head.
    /// Uses Atomic bounds allowing multiple threads to queue concurrently.
    /// `owner_idx`: ID of the parent atom replicating
    /// `cx, cy`: Coordinates for the child
    /// `energy`: Provisioned starting energy
    pub fn push_spawn_request(&self, owner_idx: usize, cx: i32, cy: i32, energy: i32) {
        let spawn_atomic = self.spawn_requests_atomic(); // index 0 is write_head, 1 is read_head

        let read_head = spawn_atomic[1].load(std::sync::atomic::Ordering::Acquire);

        // Atomically claim the next slot in the ring buffer
        let mut write_head = spawn_atomic[0].load(std::sync::atomic::Ordering::Acquire);
        loop {
            if write_head - read_head >= SPAWN_MAX {
                return; // Buffer full
            }
            match spawn_atomic[0].compare_exchange(
                write_head,
                write_head + 1,
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            ) {
                Ok(_) => break, // claim confirmed
                Err(new_write_head) => write_head = new_write_head,
            }
        }

        // We claimed `write_head`. Now write payload specifically into our reserved slot.
        let slot_off = 8 + ((write_head % SPAWN_MAX) * SPAWN_SLOT) as usize;
        let p_id = self.matrix.ids[owner_idx];

        // Write p_id (low 32, high 32)
        let pid_lo = (p_id & 0xFFFFFFFF) as i32;
        let pid_hi = (p_id >> 32) as i32;

        unsafe {
            // Note: Since each thread has a UNIQUE slot (`write_head` is atomic), we can bypass Rust's
            // interior mutability checks purely for `spawn_requests` payload area using unsafe raw pointers.
            let req_ptr = self.matrix.spawn_requests.as_ptr() as *mut u8;

            std::ptr::copy_nonoverlapping(pid_lo.to_le_bytes().as_ptr(), req_ptr.add(slot_off), 4);
            std::ptr::copy_nonoverlapping(
                pid_hi.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 4),
                4,
            );

            std::ptr::copy_nonoverlapping(
                (cx as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 8),
                2,
            );
            std::ptr::copy_nonoverlapping(
                (cy as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 10),
                2,
            );

            std::ptr::copy_nonoverlapping(
                energy.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 12),
                4,
            );

            let logic = self.matrix.logic[owner_idx];
            std::ptr::copy_nonoverlapping(logic.as_ptr(), req_ptr.add(slot_off + 16), 8);
        }
    }

    /// Evaluates the spawn buffer at the end of the frame, copying instructions from known parent IDs.
    pub fn drain_spawn_requests(&mut self, tick: i32) -> i32 {
        let header_slice: &[u8; 8] = self.matrix.spawn_requests[0..8].try_into().unwrap();
        let write_head = i32::from_le_bytes(header_slice[0..4].try_into().unwrap());
        let read_head = i32::from_le_bytes(header_slice[4..8].try_into().unwrap());

        let mut cursor = read_head;
        let mut spawned = 0;
        let mut free_search_cursor = self.free_search_cursor; // 0 is null atom

        while cursor != write_head && spawned < 64 {
            let slot_off = 8 + ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;

            let pid_lo = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off..slot_off + 4]
                    .try_into()
                    .unwrap(),
            );
            let pid_hi = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off + 4..slot_off + 8]
                    .try_into()
                    .unwrap(),
            );
            let g_lo = pid_lo;

            if g_lo != 0 {
                let p_id = (pid_lo as u32 as u64) | ((pid_hi as u32 as u64) << 32);

                let cx = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 8..slot_off + 10]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let cy = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 10..slot_off + 12]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let energy_scaled = i32::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 12..slot_off + 16]
                        .try_into()
                        .unwrap(),
                );

                let mut logic: [u8; 8] = [0; 8];
                logic.copy_from_slice(&self.matrix.spawn_requests[slot_off + 16..slot_off + 24]);

                // O(1) Search via index hinting: The lower 32-bits of p_id contain the parent index
                let parent_hint = (p_id & 0xFFFFFFFF) as usize;
                let mut parent_idx = 0;
                if parent_hint > 0
                    && parent_hint < MAX_ATOMS
                    && self.matrix.ids[parent_hint] == p_id
                {
                    parent_idx = parent_hint;
                } else {
                    // Fallback to linear search in case of desync
                    for i in 1..MAX_ATOMS {
                        if self.matrix.ids[i] == p_id {
                            parent_idx = i;
                            break;
                        }
                    }
                }

                // Find Free Slot
                let mut free_idx: i32 = -1;
                for i in 0..MAX_ATOMS {
                    let search = (free_search_cursor + i) % MAX_ATOMS;
                    if search != 0 && self.matrix.ids[search] == 0 {
                        free_idx = search as i32;
                        break;
                    }
                }

                if free_idx != -1 && parent_idx != 0 {
                    let child_id = ((tick as i64) << 32) | (free_idx as i64);
                    let f = free_idx as usize;

                    self.matrix.ids[f] = child_id as u64;
                    self.matrix.xs[f] = cx as i16;
                    self.matrix.ys[f] = cy as i16;
                    self.matrix.energy[f] = energy_scaled;
                    self.matrix.logic[f] = logic;

                    // Copy 64 bytes of ASM instructions from parent
                    self.matrix.instructions[f] = self.matrix.instructions[parent_idx];

                    // Reset fresh state
                    self.matrix.resonance[f] = 0;
                    self.matrix.phase[f] = 0;
                    self.matrix.context[f] = [0; 16];
                    self.matrix.context[f][8] = 0; // PC

                    // CRISPR Inheritance
                    // Pass adaptive immunity (Reg 13) down to the child
                    self.matrix.context[f][13] = self.matrix.context[parent_idx][13];

                    free_search_cursor = (free_idx as usize + 1) % MAX_ATOMS;
                }
            }
            cursor += 1;
            spawned += 1;
        }

        // Close transaction
        self.matrix.spawn_requests[4..8].copy_from_slice(&cursor.to_le_bytes());
        self.free_search_cursor = free_search_cursor;
        spawned
    }
}
```

```

---

## FILE: src/ontology/host/sigma_shadow.md

```markdown
---
id: sigma_shadow
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Implements the speculative execution engine for quantum divergence
---

# `Shadow Simulation` Engine

```rust
use crate::SigmaState;
use crate::PulseOrchestrator;

/// Drift metrics reporting back to the TypeScript orchestrator.
#[repr(C)]
#[derive(Debug, Clone)]
pub struct DriftMetrics {
    pub energy_diff: i32,
    pub resonance_diff: i32,
    pub bonds_broken: u32,
    pub bonds_formed: u32,
    pub structural_value_change: i32,
    pub population_diff: i32,
    pub coherence_diff: i32,
    pub divergence_tick: u32,
}

use std::cell::RefCell;

thread_local! {
    static SHADOW_POOL: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(crate::MAX_ATOMS));
}

/// Clones the entire `SigmaState`, overrides the target `atom_id` logic bytes,
/// runs `ticks` iterations of the native PulseOrchestrator, and calculates
/// the topological drift before shedding the clone.
pub fn run_shadow_simulation(
    original_state: &SigmaState,
    atom_id: u64,
    hallucination_bytes: &[u8; 64],
    ticks: u32,
    start_tick: u32,
) -> DriftMetrics {
    // 1. Deep clone the massive matrix securely avoiding stack bounds
    let mut shadow_state = original_state.clone();
    let shadow_matrix = &mut shadow_state.matrix;

    // Find absolute memory index of the atom
    let mut target_idx = None;
    for (i, &id) in shadow_matrix.ids.iter().enumerate() {
        if id == atom_id {
            target_idx = Some(i);
            break;
        }
    }

    let target_idx = target_idx.unwrap_or(0); // fallback gracefully if bad ID? Ideally we should return error.

    let initial_energy = shadow_matrix.energy[target_idx];
    let initial_resonance = shadow_matrix.resonance[target_idx];
    let initial_structural_value = shadow_matrix.structure_build_value.iter().sum::<i32>();

    let initial_population = shadow_matrix.ids.iter().filter(|&&id| id != 0).count() as i32;
    let initial_coherence = shadow_matrix.neural_coherence;

    let original_bonds: Vec<i32> = {
        let start = target_idx * 4;
        shadow_matrix.bonds[start..start + 4].to_vec()
    };

    // 2. Inject the semantic hallucination override
    shadow_matrix.instructions[target_idx].copy_from_slice(hallucination_bytes);

    // 3. Spool up a sovereign Pulse orchestrator over the isolated shadow
    SHADOW_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        visited.clear();
        visited.resize(crate::MAX_ATOMS, 0);
        let mut orchestrator = PulseOrchestrator::new(&mut visited);

        for i in 0..ticks {
            orchestrator.tick(&mut shadow_state, start_tick + i);
        }

        // 4. Calculate topological divergence
        let final_energy = shadow_state.matrix.energy[target_idx];
        let final_resonance = shadow_state.matrix.resonance[target_idx];
        let final_structural_value = shadow_state
            .matrix
            .structure_build_value
            .iter()
            .sum::<i32>();

        let final_population = shadow_state
            .matrix
            .ids
            .iter()
            .filter(|&&id| id != 0)
            .count() as i32;
        let final_coherence = shadow_state.matrix.neural_coherence;

        let final_bonds: Vec<i32> = {
            let start = target_idx * 4;
            shadow_state.matrix.bonds[start..start + 4].to_vec()
        };

        let mut bonds_broken = 0;
        let mut bonds_formed = 0;

        for i in 0..4 {
            if original_bonds[i] != 0 && final_bonds[i] == 0 {
                bonds_broken += 1;
            }
            if original_bonds[i] == 0 && final_bonds[i] != 0 {
                bonds_formed += 1;
            }
        }

        DriftMetrics {
            energy_diff: final_energy.saturating_sub(initial_energy),
            resonance_diff: final_resonance.saturating_sub(initial_resonance),
            bonds_broken,
            bonds_formed,
            structural_value_change: final_structural_value
                .saturating_sub(initial_structural_value),
            population_diff: final_population.saturating_sub(initial_population),
            coherence_diff: final_coherence.saturating_sub(initial_coherence),
            divergence_tick: start_tick + ticks,
        }
    })
}
```

```

---

## FILE: src/ontology/host/sigma_spatial.md

```markdown
---
id: sigma_spatial
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Implements the 2D grid hashing algorithm enabling fast localized queries
---

# Spatial Hashing Grid

```rust
// Spatial Fabric Topology & Cognition Grid

use crate::{GRID_CELLS, GRID_W, SPATIAL_CELL_SIZE, WORLD_MAX_X, WORLD_MAX_Y};
use crate::{SigmaState, MAX_ATOMS};
use std::sync::atomic::Ordering;

impl SigmaState {
    /// Rebuilds the 140x80 spatial hash grid for collision detection and neighbor awareness.
    /// Perfectly maps to the TypeScript bit-for-bit implementation.
    pub fn build_spatial_hash(&mut self) -> (i32, i32) {
        // Slot 31 is the phase slot, slots 1..30 are for atoms
        let phase_slot = 31;
        let max_atom_slots = 30;

        // 1. Clear Grid and Quorum
        self.matrix.spatial_grid[..].fill(0);
        self.matrix.quorum[..].fill(0);

        let spatial_atomic = self.spatial_grid_atomic();
        let quorum_atomic = self.quorum_atomic();

        let mut overflow_count = 0;
        let mut max_cell_count = 0;

        // 2. Bin Atoms
        for idx in 0..MAX_ATOMS {
            if self.matrix.ids[idx] == 0 {
                continue; // Skip dead atoms
            }

            let mut x = (self.matrix.xs[idx] as i32) / 100;
            let mut y = (self.matrix.ys[idx] as i32) / 100;

            if x < 0 {
                x = 0;
            }
            if x > WORLD_MAX_X {
                x = WORLD_MAX_X;
            }
            if y < 0 {
                y = 0;
            }
            if y > WORLD_MAX_Y {
                y = WORLD_MAX_Y;
            }

            let cell_x = (x / SPATIAL_CELL_SIZE) as usize;
            let cell_y = (y / SPATIAL_CELL_SIZE) as usize;
            let cell_idx = (cell_y * (GRID_W as usize)) + cell_x;

            let sg_base = cell_idx * 32;

            // Atomically reserve a slot
            let slot_idx =
                spatial_atomic[sg_base].fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            let next_slot = slot_idx + 1; // 1-based internal slot count

            if next_slot <= max_atom_slots {
                // Store atom index in the grid slot
                spatial_atomic[sg_base + (next_slot as usize)]
                    .store(idx as i32, std::sync::atomic::Ordering::Relaxed);

                // Accumulate Phase into slot 31 (phase_slot)
                let my_phase = self.matrix.phase[idx] as i32;
                spatial_atomic[sg_base + phase_slot]
                    .fetch_add(my_phase, std::sync::atomic::Ordering::Relaxed);

                // Role quorum counting
                let role = self.matrix.roles[idx];
                let safe_role = if role > 7 { 7 } else { role as usize };

                let q_base = cell_idx * 8;
                quorum_atomic[q_base + safe_role]
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);

                if next_slot > max_cell_count {
                    max_cell_count = next_slot;
                }
            } else {
                overflow_count += 1;
            }
        }

        // 3. Finalize Phase Averages
        for i in 0..GRID_CELLS {
            let sg_base = i * 32;
            let count = spatial_atomic[sg_base].load(std::sync::atomic::Ordering::Relaxed);
            if count > 0 {
                let sum =
                    spatial_atomic[sg_base + phase_slot].load(std::sync::atomic::Ordering::Relaxed);
                spatial_atomic[sg_base + phase_slot]
                    .store(sum / count, std::sync::atomic::Ordering::Relaxed);
            }
        }

        (overflow_count, max_cell_count)
    }

    /// Helper to get number of atoms in a specific grid cell
    pub fn get_spatial_grid_count(&self, gx: i32, gy: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32]
    }

    /// Helper to get a specific atom index from a grid cell
    pub fn get_spatial_grid_atom(&self, gx: i32, gy: i32, sub_idx: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32 + ((sub_idx + 1) as usize)]
    }
}
```

```

---

## FILE: src/ontology/host/sigma_structure.md

```markdown
---
id: sigma_structure
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
description: Handles the cellular automaton lifecycle of the crystalline grid
---

# `Membrane & Structure` Engine

```rust
// Architecture Intent Engine
// Handles the arbitration and locking mechanisms for `OP_BUILD`, `OP_PLUG`, and `OP_SENSE`.

use crate::SigmaState;

pub const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648; // 0x80000000

impl SigmaState {
    /// Attempts to publish a build intent to the specified cell.
    /// Attempts to publish a build intent to the specified cell.
    /// Arbitration happens via the `ownerToken` mechanism to resolve racing logic during a tick.
    pub fn publish_build_intent(&self, cell_idx: usize, owner_atom_idx: usize, build_value: i32) {
        if cell_idx >= crate::GRID_CELLS {
            return;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let val_atomic = unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_value.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_value.len(),
            )
        };

        let owner_token = (owner_atom_idx as i32) + 1; // 1-indexed

        // Spin until we successfully lock or realize we are over-prioritized
        loop {
            let current_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

            // Bail if locked by the consensus daemon
            if current_owner == STRUCTURE_INTENT_LOCK_BIT {
                break;
            }

            if owner_token > current_owner {
                // We have higher priority, attempt to claim it
                match owner_atomic[cell_idx].compare_exchange(
                    current_owner,
                    owner_token,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => {
                        // Success! We claimed the owner token. Write our value.
                        val_atomic[cell_idx]
                            .store(build_value, std::sync::atomic::Ordering::Release);
                        break;
                    }
                    Err(_) => {
                        // Failed to claim (another atom snuck in). Loop again and re-evaluate `current_owner`.
                        continue;
                    }
                }
            } else {
                // An atom with higher priority already owns this slot for this tick.
                break;
            }
        }
    }

    /// Reads the state of a structure cell, viewing the immediate intent if present,
    /// otherwise returning the finalized grid value.
    pub fn read_structure_cell(&self, cell_idx: usize) -> i32 {
        if cell_idx >= crate::GRID_CELLS {
            return 0;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let intent_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

        if intent_owner != 0 && intent_owner != STRUCTURE_INTENT_LOCK_BIT {
            let val_atomic = unsafe {
                std::slice::from_raw_parts(
                    self.matrix.structure_build_value.as_ptr()
                        as *const std::sync::atomic::AtomicI32,
                    self.matrix.structure_build_value.len(),
                )
            };
            val_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire)
        } else {
            self.matrix.structure_grid[cell_idx]
        }
    }

    /// Mutates the charge intent for OP_PLUG.
    pub fn set_structure_charge_intent(&self, cell_idx: usize, charge: i32) {
        if cell_idx < crate::GRID_CELLS {
            let intent_atomic = self.structure_charge_intent_atomic();
            let mut current = intent_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);
            loop {
                // In Deno, multiple plugs into the same cell don't sum, they take max, or they just overwrite.
                // Assuming overwrite or max. Max is safer for multi-threaded:
                if charge <= current {
                    break;
                }
                match intent_atomic[cell_idx].compare_exchange(
                    current,
                    charge,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => break,
                    Err(actual) => current = actual,
                }
            }
        }
    }
}
```

```

---

## FILE: src/ontology/host/sigma_vm.md

```markdown
---
id: sigma_vm
type: substrate_module
target: rust
level: 3
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - sigma_memory
  - sigma_isa
  - sigma_environment
description: LambdaVM Execution Engine
---

# `LambdaVM`

```rust
use crate::{
    GRID_W, PROP_ENERGY, PROP_PHASE, PROP_RESONANCE, SPATIAL_CELL_SIZE,
};
use crate::in_grid;
use crate::GlyphOp;
use crate::{SYS_TRANSFER, SYS_ATTRACT, SYS_FOLD, SYS_SPAWN, SYS_BIND};
use crate::{math_cos, math_sin};
use crate::{SigmaState, MAX_ATOMS};

pub struct LambdaVM {}

impl LambdaVM {
    pub fn new() -> Self {
        Self {}
    }

    #[inline(always)]
    pub fn fetch_instruction(&self, state: &SigmaState, atom_idx: usize, pc: u8, offset: u8) -> u8 {
        let actual_pc = (pc.wrapping_add(offset)) & 63;
        state
            .matrix
            .instructions
            .get(atom_idx)
            .map(|inst| inst[actual_pc as usize])
            .unwrap_or(0) // Default to NOP if indices completely invalid
    }

    /// Executes a single atom's VM pipeline mapped exactly to Deno.
    ///
    /// # Safety
    /// Bounded automatically if `atom_idx >= MAX_ATOMS`. Native out of bounds operations
    /// degrade cleanly into NOP executions. Array manipulation operates primarily through
    /// safely ordered hardware-level atomics to prevent simultaneous VM tick data races.
    ///
    /// # Metabolic Economics
    /// Standard execution runs at zero gas until operations resolve. Each opcode natively applies
    /// +1 base computation energy cost, scaled exponentially based on `hormone` friction/entropy
    /// equations simulating thermodynamics across the Tensegrity lattice.
    pub fn step(&mut self, state: &SigmaState, atom_idx: usize) {
        if atom_idx >= crate::MAX_ATOMS {
            return;
        }

        // Get initial PC
        let mut pc = state.matrix.context[atom_idx][8] as u8;

        // Emulating `getReadEnergy` and `getReadResonance` which act as snapshots
        // during execution, though for simple tests we assume they match actual.
        let mut energy = state.matrix.energy[atom_idx];
        let mut resonance = state.matrix.resonance[atom_idx];

        let mut gas_used = 0;
        let mut gas_limit = if energy < 100 { energy } else { 100 };
        let mut step_count = 0;
        const MAX_EXECUTION_STEPS: usize = 64;

        while gas_used < gas_limit {
            step_count += 1;
            if step_count > MAX_EXECUTION_STEPS {
                state.energy_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
                break;
            }

            let op = GlyphOp::from(state.matrix.instructions[atom_idx][pc as usize]);

            match op {
                GlyphOp::Nop => {
                    gas_used += 1;
                    break;
                }
                GlyphOp::Set => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let imm = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 {
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(imm as i8 as i32, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Get => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
                    let mut val = 0;

                    if prop == PROP_ENERGY {
                        val = energy;
                    } else if prop == PROP_RESONANCE {
                        val = resonance;
                    } else if prop == PROP_PHASE {
                        val = state.matrix.phase[atom_idx];
                    }
                    // Ignoring complex external grid read properties for simple test harness

                    if reg < 8 {
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Put => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
                    let val = if reg < 8 {
                        state.matrix.context[atom_idx][reg as usize]
                    } else {
                        0
                    };

                    if prop == PROP_ENERGY {
                        energy = val;
                    } else if prop == PROP_RESONANCE {
                        resonance = val;
                    } else if prop == PROP_PHASE {
                        state.phase_atomic()[atom_idx]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Add => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sum = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_add(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sum, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Sub => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sub = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_sub(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sub, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Jnz => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] != 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jz => {
                    // Note: Deno didn't have OP_JZ fully flushed in phase-7 physics, but logic implies inverse JNZ
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] == 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jmp => {
                    pc = self.fetch_instruction(state, atom_idx, pc, 1);
                    gas_used += 2;
                }
                GlyphOp::Resolve => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let angle_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let mode_reg = self.fetch_instruction(state, atom_idx, pc, 3);

                    let angle = if angle_reg < 8 {
                        state.matrix.context[atom_idx][angle_reg as usize]
                    } else {
                        0
                    };
                    let mode_val = if mode_reg < 8 {
                        state.matrix.context[atom_idx][mode_reg as usize]
                    } else {
                        0
                    };

                    let mut high_res = 0;
                    let mut cost = 1;

                    if mode_val == 1 || mode_val == 3 {
                        high_res = 1;
                        cost = 5;
                    } else if mode_val == 4 || mode_val == 5 {
                        high_res = 2; // Reserved for Taylor2
                        cost = 10;
                    }

                    let val = if mode_val == 0 || mode_val == 1 || mode_val == 4 {
                        math_sin(angle, high_res)
                    } else {
                        math_cos(angle, high_res)
                    };

                    if dest_reg < 8 {
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 4;
                    gas_used += cost;
                }
                GlyphOp::ResonateKuramoto => {
                    let gx = (state.matrix.xs[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);
                    let gy = (state.matrix.ys[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);

                    // Note: Deno physics clamp logic is actually (xs / SPATIAL_CELL_SIZE) / 100.
                    // Let's use grid coordinates as mapped by build_spatial_hash (which are units of 10)
                    let current_phase = state.matrix.phase[atom_idx] as i32;
                    let mut sum_sin: i32 = 0;
                    let mut neighbor_count = 0;

                    let grid_cx = gx;
                    let grid_cy = gy;

                    'search: for dy in -1..=1 {
                        for dx in -1..=1 {
                            let nx = grid_cx + dx;
                            let ny = grid_cy + dy;

                            if in_grid(nx, ny) {
                                let count = state.get_spatial_grid_count(nx, ny);
                                for i in 0..count {
                                    if neighbor_count >= 32 {
                                        break 'search;
                                    }
                                    let neighbor_id =
                                        state.get_spatial_grid_atom(nx, ny, i) as usize;
                                    if neighbor_id > 0
                                        && neighbor_id != atom_idx
                                        && neighbor_id < MAX_ATOMS
                                    {
                                        let neighbor_phase = state.matrix.phase[neighbor_id] as i32;
                                        let diff = (neighbor_phase - current_phase) & 255;
                                        sum_sin = sum_sin.saturating_add(math_sin(diff, 0)); // Direct lookup density mapping
                                        neighbor_count += 1;
                                    }
                                }
                            }
                        }
                    }

                    let coh = state.matrix.neural_coherence as i32;
                    let mut k_bond = 5 + (coh / 100);
                    if k_bond > 128 {
                        k_bond = 128;
                    }

                    if neighbor_count > 0 {
                        let d_theta = (k_bond.saturating_mul(sum_sin)) >> 15;
                        let theta_next = (current_phase as i32)
                            .saturating_add(d_theta)
                            .rem_euclid(256);
                        state.phase_atomic()[atom_idx]
                            .store(theta_next as i32, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 1;
                    gas_used += 5 + (neighbor_count * 2);
                }
                GlyphOp::Share => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amount_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };
                    let mut amount = if amount_reg < 8 {
                        state.matrix.context[atom_idx][amount_reg as usize]
                    } else {
                        0
                    };

                    if target_idx > 0 && (target_idx as usize) < MAX_ATOMS && amount > 0 {
                        let aggression = state.matrix.hormones[2] as i32;
                        if aggression > 1024 {
                            amount += (amount * (aggression - 1024)) / 2048;
                        }

                        let sender_energy = state.matrix.energy[atom_idx];
                        let scaled_amount = amount * crate::SCALE;

                        if sender_energy >= scaled_amount {
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                            energy -= scaled_amount;

                            let energy_atomic = state.energy_atomic();
                            energy_atomic[target_idx as usize]
                                .fetch_add(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Replicate => {
                    let aggression = state.matrix.hormones[2] as i32;
                    let e_thresh = 50 - (aggression >> 3);
                    let r_thresh = 10 - (aggression >> 5);

                    if energy > e_thresh * crate::SCALE
                        && state.matrix.resonance[atom_idx] > r_thresh
                    {
                        let cx = state.matrix.xs[atom_idx] as i32;
                        let cy = state.matrix.ys[atom_idx] as i32;

                        let child_energy = energy / 2;

                        state.push_spawn_request(atom_idx, cx, cy, child_energy);

                        state.energy_atomic()[atom_idx]
                            .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                        state.resonance_atomic()[atom_idx]
                            .fetch_add(30, std::sync::atomic::Ordering::Relaxed);

                        energy -= child_energy;
                    }

                    pc += 1;
                    gas_used += 15;
                }
                GlyphOp::Bind => {
                    let _mode_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize] as usize
                    } else {
                        0
                    };

                    if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                        state.push_bond_request(atom_idx, atom_idx, target_idx);
                    }

                    pc += 3;
                    gas_used += 20;
                }
                GlyphOp::Hebb => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    if slot < 4 && resonance > 200 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let mut weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight < 255 {
                                weight += 1;
                                state.synaptic_weights_atomic()[bond_idx]
                                    .store(weight, std::sync::atomic::Ordering::Relaxed);
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::Fire => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amp_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    let amplitude = if amp_reg < 8 {
                        state.matrix.context[atom_idx][amp_reg as usize]
                    } else {
                        0
                    };

                    if slot < 4 && amplitude > 0 && energy >= (amplitude / 10) {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;

                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let weight = state.matrix.synaptic_weights[bond_idx] as f32;
                            let fire_cost = amplitude / 10;

                            // Scale the transmitted resonance mathematically by the synaptic weight
                            let transmitted = ((amplitude as f32) * (weight / 255.0)) as i32;

                            if transmitted > 0 {
                                state.resonance_atomic()[target_idx]
                                    .fetch_add(transmitted, std::sync::atomic::Ordering::Relaxed);
                            }

                            // Pay the firing cost
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(fire_cost, std::sync::atomic::Ordering::Relaxed);
                            energy -= fire_cost;
                        }
                    }

                    pc += 3;
                    gas_used += 15;
                }
                GlyphOp::Decay => {
                    let mut min_weight = 255;
                    let mut min_slot = None;

                    for slot in 0..4 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0 {
                            let weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight > 0 && weight < min_weight {
                                min_weight = weight;
                                min_slot = Some(slot);
                            }
                        }
                    }

                    if let Some(slot) = min_slot {
                        let bond_idx = (atom_idx * 4) + slot;
                        let mut weight = state.synaptic_weights_atomic()[bond_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        if weight > 0 {
                            weight -= 1;
                            state.synaptic_weights_atomic()[bond_idx]
                                .store(weight, std::sync::atomic::Ordering::Relaxed);

                            // Metabolic Recoup via network pruning
                            state.energy_atomic()[atom_idx]
                                .fetch_add(50, std::sync::atomic::Ordering::Relaxed);
                            energy += 50;
                        }
                    }

                    pc += 1;
                    gas_used += 10;
                }
                GlyphOp::Tensegrity => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let val_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let spring_target = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };

                    let val = if val_reg < 8 {
                        state.matrix.context[atom_idx][val_reg as usize]
                    } else {
                        0
                    };

                    if spring_target >= 0 && spring_target < 4 {
                        let bond_idx = (atom_idx * 4) + spring_target as usize;
                        if state.matrix.bonds[bond_idx] != 0 {
                            // Map integers to f32 stiffness (val / 100)
                            let stiffness = (val as f32) / 100.0;
                            // Transmute f32 bit pattern to u32 for atomic storage
                            state.stiffness_atomic()[bond_idx]
                                .store(stiffness.to_bits(), std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Build => {
                    let type_val = self.fetch_instruction(state, atom_idx, pc, 1) as i32;
                    let state_val = self.fetch_instruction(state, atom_idx, pc, 2) as i32;

                    let build_val = (state_val << 24) | (0xFF << 16) | type_val;
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.publish_build_intent(cell_idx, atom_idx, build_val);
                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Plug => {
                    let charge_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let charge_val = if charge_reg < 8 {
                        state.matrix.context[atom_idx][charge_reg as usize]
                    } else {
                        0
                    };
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.set_structure_charge_intent(cell_idx, charge_val);
                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Sense => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    // Radius ignored for parity testing, directly sensing current cell
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    let val = state.read_structure_cell(cell_idx);
                    if dest_reg < 8 {
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 4;
                    gas_used += 5;
                }
                GlyphOp::SecretePlasmid => {
                    // Extract genome offset parameter
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if energy >= 150_000 && offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        // Read 8 bytes from genome
                        let mut payload = [0u8; 8];
                        payload.copy_from_slice(
                            &state.matrix.instructions[atom_idx]
                                [offset as usize..(offset as usize + 8)],
                        );

                        // Deposit into payload atomically
                        let payload_atomic = state.glyph_payload_atomic();
                        for i in 0..8 {
                            payload_atomic[cell_idx * 8 + i]
                                .store(payload[i], std::sync::atomic::Ordering::Relaxed);
                        }

                        // Trigger interference map: Kind 3 (PLASMID), Max Amplitude (255)
                        state.atomic_deposit_glyph_header(cell_idx, 3, 255);

                        energy -= 150_000;
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::IncorporatePlasmid => {
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        let header = state.glyph_header_atomic()[cell_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        let kind = (header & 0xFF) as u8;

                        if kind == 3 {
                            let payload_atomic = state.glyph_payload_atomic();
                            let mut new_bytes = [0u8; 8];
                            for i in 0..8 {
                                new_bytes[i] = payload_atomic[cell_idx * 8 + i]
                                    .load(std::sync::atomic::Ordering::Relaxed);
                            }

                            // CRISPR Immunity Check
                            // Fast hash: shifting the first 4 bytes into a 32-bit integer.
                            let mut plasmid_hash: i32 = 0;
                            plasmid_hash |= (new_bytes[0] as i32) << 24;
                            plasmid_hash |= (new_bytes[1] as i32) << 16;
                            plasmid_hash |= (new_bytes[2] as i32) << 8;
                            plasmid_hash |= new_bytes[3] as i32;

                            let immune_memory = state.context_atomic(atom_idx)[13]
                                .load(std::sync::atomic::Ordering::Relaxed);

                            if immune_memory != 0 && immune_memory == plasmid_hash {
                                // MATCH! Execute OP_PURGE immunity mechanism.
                                // 1. Destroy payload in environment
                                for i in 0..8 {
                                    payload_atomic[cell_idx * 8 + i]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                                state.glyph_header_atomic()[cell_idx]
                                    .store(0, std::sync::atomic::Ordering::Relaxed);

                                // 2. Metabolic Bonus (+50_000 raw energy)
                                state.energy_atomic()[atom_idx]
                                    .fetch_add(50_000, std::sync::atomic::Ordering::Relaxed);
                                energy += 50_000;

                                // 3. Abort insertion
                                gas_used += 10;
                            } else {
                                // NAIVE ENCOUNTER
                                // Record the hash into Trauma Tracker (Reg 14) for potential learning at end of step
                                state.context_atomic(atom_idx)[14]
                                    .store(plasmid_hash, std::sync::atomic::Ordering::Relaxed);

                                // Thermodynamic Safeguard
                                let mut current_bytes = [0u8; 8];
                                current_bytes.copy_from_slice(
                                    &state.matrix.instructions[atom_idx]
                                        [offset as usize..(offset as usize + 8)],
                                );

                                // We need full 64 byte frames for entropy calculations
                                let mut mock_old = [0u8; 64];
                                mock_old.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                let mut mock_new = [0u8; 64];
                                mock_new.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                mock_new[offset as usize..(offset as usize + 8)]
                                    .copy_from_slice(&new_bytes);

                                let entropy_old = crate::calculate_shannon_entropy(&mock_old);
                                let entropy_new = crate::calculate_shannon_entropy(&mock_new);

                                let is_desperate = energy < (100_000_000 / 10);

                                if entropy_new < entropy_old || is_desperate {
                                    // SAFETY: We hold an atomic lock on our own atom's execution (step_count loop bounds gas).
                                    // Under the parallel execution model, no other thread writes to our `atom_idx` instruction block
                                    // concurrently. Atomic protection applies inter-atom, but intra-atom we have absolute sovereignty.
                                    unsafe {
                                        let inst_ptr =
                                            state.matrix.instructions.as_ptr() as *mut [u8; 64];
                                        let atom_inst = &mut *inst_ptr.add(atom_idx);
                                        atom_inst[offset as usize..(offset as usize + 8)]
                                            .copy_from_slice(&new_bytes);
                                    }
                                    // Evict Entropy Cache
                                    state.context_atomic(atom_idx)[15]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Signal => {
                    let type_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let intensity_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let kind = if type_reg < 8 {
                        state.matrix.context[atom_idx][type_reg as usize] as u8
                    } else {
                        0
                    };
                    let intensity = if intensity_reg < 8 {
                        state.matrix.context[atom_idx][intensity_reg as usize]
                    } else {
                        0
                    };

                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    // Re-implementing atomic_deposit_glyph_header locally for parity
                    // It mutates global arrays internally.
                    state.atomic_deposit_glyph_header(cell_idx, kind, intensity);
                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Collective => {
                    let mode = self.fetch_instruction(state, atom_idx, pc, 1);
                    let p2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    let p3 = self.fetch_instruction(state, atom_idx, pc, 3);

                    if mode == 0 {
                        // Hive Store
                        let addr = (p2 as usize) & 1023;
                        let val = (p3 & 0xFF) as u8;
                        // Note: hive_memory doesn't have an atomic array yet, but it's typically sequential.
                        // For pure race safety, we'd need AtomicU8 array. Simple tests avoid intense races here.
                        // Assuming deterministic scheduling or acceptable last-write-wins for hive_memory.
                        // (Deno SAB had atomic views but we can skip if not heavily tested for races)
                        state.hive_memory_atomic()[addr]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 1 {
                        // Hive Load
                        let addr = (p2 as usize) & 1023;
                        let reg = (p3 as usize) & 7;
                        let loaded = state.hive_memory_atomic()[addr]
                            .load(std::sync::atomic::Ordering::Relaxed)
                            as i32;
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(loaded, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 3 {
                        // Hive Deposit
                        let val = (p2 & 0xFF) as i32;
                        if energy >= val * crate::SCALE {
                            let hive_bal_atomic = state.hive_balance_atomic();
                            hive_bal_atomic.fetch_add(val, std::sync::atomic::Ordering::Relaxed);
                            state.energy_atomic()[atom_idx].fetch_sub(
                                val * crate::SCALE,
                                std::sync::atomic::Ordering::Relaxed,
                            );
                            energy -= val * crate::SCALE;
                        }
                        gas_used += 15;
                    } else if mode == 4 {
                        // Hive Withdraw
                        let reg = (p2 as usize) & 7;
                        let hive_bal_atomic = state.hive_balance_atomic();

                        let mut amount = 0;
                        let mut current_bal =
                            hive_bal_atomic.load(std::sync::atomic::Ordering::Acquire);
                        loop {
                            let curr_amt = if current_bal > 100 { 100 } else { current_bal };
                            if curr_amt <= 0 {
                                break;
                            }
                            match hive_bal_atomic.compare_exchange(
                                current_bal,
                                current_bal - curr_amt,
                                std::sync::atomic::Ordering::AcqRel,
                                std::sync::atomic::Ordering::Acquire,
                            ) {
                                Ok(_) => {
                                    state.energy_atomic()[atom_idx].fetch_add(
                                        curr_amt * crate::SCALE,
                                        std::sync::atomic::Ordering::Relaxed,
                                    );
                                    energy += curr_amt * crate::SCALE;
                                    amount = curr_amt;
                                    break;
                                }
                                Err(actual) => current_bal = actual,
                            }
                        }
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(amount, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 15;
                    } else if mode == 5 {
                        // Phase Lock (Bonds)
                        // Note: For parallel execution, mutating another atom's context directly is a race.
                        // We must cast the target's PC to AtomicI32 temporarily if run across threads.
                        for slot in 0..4 {
                            let bond_idx = (atom_idx * 4) + slot;
                            let target = state.matrix.bonds[bond_idx] as usize;
                            if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                                // Thread-safe PC override
                                state.context_atomic(target)[8]
                                    .store((pc + 4) as i32, std::sync::atomic::Ordering::Release);
                            }
                        }
                        gas_used += 15;
                    } else if mode == 6 {
                        // Quorum PC Sync
                        let cx = state.matrix.xs[atom_idx] as i32 / 10;
                        let cy = state.matrix.ys[atom_idx] as i32 / 10;
                        if in_grid(cx, cy) {
                            let count = state.get_spatial_grid_count(cx, cy);
                            for i in 0..count {
                                let peer = state.get_spatial_grid_atom(cx, cy, i) as usize;
                                if peer > 0
                                    && peer < MAX_ATOMS
                                    && peer != atom_idx
                                    && state.matrix.ids[peer] != 0
                                {
                                    state.context_atomic(peer)[8].store(
                                        (pc + 4) as i32,
                                        std::sync::atomic::Ordering::Release,
                                    );
                                }
                            }
                        }
                        gas_used += 20;
                    }

                    pc += 4; // Length is 4 according to verification harness
                }
                GlyphOp::Syscall => {
                    let context_regs = state.context_atomic(atom_idx);
                    let sys_id = context_regs[0].load(std::sync::atomic::Ordering::Relaxed); // R0
                    let r1 = context_regs[1].load(std::sync::atomic::Ordering::Relaxed);
                    let r2 = context_regs[2].load(std::sync::atomic::Ordering::Relaxed);
                    let r3 = context_regs[3].load(std::sync::atomic::Ordering::Relaxed);

                    match sys_id {
                        SYS_ATTRACT => {
                            let target_idx = r1 as usize;
                            let attract_force = r2;

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && state.matrix.ids[target_idx] != 0
                            {
                                let ox = state.matrix.xs[atom_idx] as i32;
                                let oy = state.matrix.ys[atom_idx] as i32;
                                let tx = state.matrix.xs[target_idx] as i32;
                                let ty = state.matrix.ys[target_idx] as i32;

                                let dx = tx - ox;
                                let dy = ty - oy;

                                let dx_sign = if dx > 0 {
                                    1
                                } else if dx < 0 {
                                    -1
                                } else {
                                    0
                                };
                                let dy_sign = if dy > 0 {
                                    1
                                } else if dy < 0 {
                                    -1
                                } else {
                                    0
                                };

                                let move_dir_x = if attract_force > 0 { dx_sign } else { -dx_sign };
                                let move_dir_y = if attract_force > 0 { dy_sign } else { -dy_sign };

                                if move_dir_x != 0 || move_dir_y != 0 {
                                    let nx = ox + (move_dir_x * 10);
                                    let ny = oy + (move_dir_y * 10);

                                    let is_escaped = nx < 0 || nx > 1399 || ny < 0 || ny > 799;

                                    if is_escaped {
                                        state.dispatch_egress(atom_idx, nx, ny, energy);
                                        state.energy_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        state.ids_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        energy = 0;
                                    } else {
                                        let n_grid_x = nx / 10;
                                        let n_grid_y = ny / 10;
                                        let count_in_cell =
                                            state.get_spatial_grid_count(n_grid_x, n_grid_y);
                                        if count_in_cell < 31 {
                                            state.xs_atomic()[atom_idx].store(
                                                nx as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            state.ys_atomic()[atom_idx].store(
                                                ny as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    }
                                }
                            }
                            gas_used += 10;
                        }
                        SYS_FOLD => {
                            gas_used += 10;
                        }
                        SYS_SPAWN => {
                            let child_energy = r1 * 1000;
                            let dx = r2;
                            let dy = r3;

                            if energy > child_energy {
                                let cx = (state.matrix.xs[atom_idx] as i32) + dx;
                                let cy = (state.matrix.ys[atom_idx] as i32) + dy;

                                state.push_spawn_request(atom_idx, cx, cy, child_energy);

                                state.energy_atomic()[atom_idx]
                                    .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                                energy -= child_energy;
                            }
                            gas_used += 20;
                        }
                        SYS_BIND => {
                            let target_idx = r1 as usize;
                            if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                                state.push_bond_request(atom_idx, atom_idx, target_idx);
                            }
                            gas_used += 15;
                        }
                        SYS_TRANSFER => {
                            let target_idx = r1 as usize;
                            let resource_type = r2;
                            let amount = r3; // positive to give, negative to take (steal)

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && amount != 0
                                && state.matrix.ids[target_idx] != 0
                            {
                                if resource_type == 0 {
                                    // Energy
                                    if amount > 0 {
                                        // Giving
                                        let scaled_amount = amount * 1000;
                                        if state.matrix.energy[atom_idx] >= scaled_amount {
                                            state.energy_atomic()[atom_idx].fetch_sub(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            energy -= scaled_amount;
                                            let energy_atomic = state.energy_atomic();
                                            energy_atomic[target_idx].fetch_add(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    } else {
                                        // Taking/Stealing (negative amount)
                                        let my_role = state.roles_atomic()[atom_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;
                                        let target_role = state.roles_atomic()[target_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;

                                        if my_role == 3 && target_role == 1 {
                                            let t_energy = state.energy_atomic()[target_idx]
                                                .load(std::sync::atomic::Ordering::Acquire);
                                            if t_energy > 20_000 {
                                                // Mutate to Mitochondria (role 5)
                                                let current_role = state.roles_atomic()[target_idx]
                                                    .load(std::sync::atomic::Ordering::Relaxed);
                                                state.roles_atomic()[target_idx].store(
                                                    5 | (current_role & 0x80),
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                // Store host atom_idx in Context Reg 12
                                                state.context_atomic(target_idx)[12].store(
                                                    atom_idx as i32,
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                break; // Engulfment replaces stealing
                                            }
                                        }

                                        let my_resonance = state.matrix.resonance[atom_idx];
                                        let target_defense =
                                            if state.matrix.evolution_reserved[target_idx] > 0 {
                                                state.matrix.evolution_reserved[target_idx]
                                            } else {
                                                state.matrix.resonance[target_idx]
                                            };

                                        if my_resonance > target_defense {
                                            let ox = state.matrix.xs[atom_idx] as f32;
                                            let oy = state.matrix.ys[atom_idx] as f32;
                                            let tx = state.matrix.xs[target_idx] as f32;
                                            let ty = state.matrix.ys[target_idx] as f32;

                                            let dx = (tx - ox) / 10.0;
                                            let dy = (ty - oy) / 10.0;
                                            let dist_sq = dx * dx + dy * dy;

                                            if dist_sq <= 2.25 {
                                                let steal_amount = (-amount) * 1000;
                                                let energy_atomic = state.energy_atomic();
                                                let mut t_energy = energy_atomic[target_idx]
                                                    .load(std::sync::atomic::Ordering::Acquire);
                                                let mut final_take = 0;
                                                loop {
                                                    let take_amount =
                                                        std::cmp::min(steal_amount, t_energy);
                                                    if take_amount <= 0 {
                                                        break;
                                                    }
                                                    match energy_atomic[target_idx]
                                                        .compare_exchange(
                                                            t_energy,
                                                            t_energy - take_amount,
                                                            std::sync::atomic::Ordering::AcqRel,
                                                            std::sync::atomic::Ordering::Acquire,
                                                        ) {
                                                        Ok(_) => {
                                                            final_take = take_amount;
                                                            break;
                                                        }
                                                        Err(actual) => t_energy = actual,
                                                    }
                                                }
                                                if final_take > 0 {
                                                    state.energy_atomic()[atom_idx].fetch_add(
                                                        final_take,
                                                        std::sync::atomic::Ordering::Relaxed,
                                                    );
                                                    energy += final_take;
                                                }
                                            }
                                        }
                                    }
                                } else if resource_type == 1 {
                                    // Resonance (only giving permitted for now)
                                    if amount > 0 && state.matrix.resonance[atom_idx] >= amount {
                                        state.resonance_atomic()[atom_idx].fetch_sub(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                        resonance -= amount;
                                        let res_atomic = state.resonance_atomic();
                                        res_atomic[target_idx].fetch_add(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                    }
                                }
                            }
                            gas_used += if amount < 0 { 30 } else { 10 };
                        }
                        _ => {
                            gas_used += 10;
                        }
                    }
                    pc += 1; // Basic jump over opcode for next resume if applicable
                    gas_limit = 0; // Yield to host
                }
                GlyphOp::Unknown => {
                    // Stop execution on invalid opcode
                    pc = 0;
                    gas_used += 1;
                    gas_limit = 0;
                }
            }

            if pc >= 64 {
                pc = 0;
            }
        }

        // Writeback PC
        state.context_atomic(atom_idx)[8].store(pc as i32, std::sync::atomic::Ordering::Relaxed);

        // Structural Thermodynamics (Shannon Entropy Noise Tax)
        let mut cached_entropy_plus_one = state.matrix.context[atom_idx][15];
        if cached_entropy_plus_one == 0 {
            let entropy =
                calculate_shannon_entropy(&state.matrix.instructions[atom_idx]);
            cached_entropy_plus_one = entropy + 1;
            state.context_atomic(atom_idx)[15].store(
                cached_entropy_plus_one,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
        let entropy_val = cached_entropy_plus_one - 1;

        // Metabolics
        let entropy_h = state.matrix.hormones[0] as i32;
        let repair_h = state.matrix.hormones[4] as i32;
        let friction_h = state.matrix.hormones[5] as i32;

        let coherence_val = state.matrix.neural_coherence;
        let discount = if coherence_val > 1000 {
            2
        } else if coherence_val > 100 {
            1
        } else {
            0
        };

        let base_compute_cost = gas_used >> discount;
        let noise_tax = (base_compute_cost * entropy_val) >> 12;
        let metabolic_cost = 1
            + base_compute_cost
            + noise_tax
            + ((gas_used * entropy_h) >> (12 + discount))
            + (friction_h >> 8);

        // Phase Synchronization
        if coherence_val > 500 {
            let mut cur_phase = state.matrix.phase[atom_idx] as i32;
            if cur_phase < 128 {
                cur_phase += 2;
            } else if cur_phase > 128 {
                cur_phase -= 1;
            }
            state.phase_atomic()[atom_idx].store(cur_phase, std::sync::atomic::Ordering::Relaxed);
        }

        // Action potential
        if resonance > 300 {
            if energy > 200 {
                energy -= 200;
                resonance = 0;
                state.phase_atomic()[atom_idx].store(5, std::sync::atomic::Ordering::Relaxed);
                // fireSignal omitted for offline simple ALU testing
            } else {
                resonance = 280;
            }
        }

        let resonance_decay = if repair_h > 1024 { 1 } else { 2 };

        if resonance > 0 {
            state.resonance_atomic()[atom_idx].store(
                std::cmp::max(0, resonance - resonance_decay),
                std::sync::atomic::Ordering::Relaxed,
            );
        }

        let final_energy = if energy > metabolic_cost {
            energy - metabolic_cost
        } else {
            0
        };

        // CRISPR Trauma Learning (Checkout Phase)
        // If the atom suffered massive metabolic drain but survived (0 < final_energy <= starvation floor)
        // we persist the temporary Trauma Tracker (Reg 14) into permanent CRISPR Cassette (Reg 13).
        if final_energy > 0 && final_energy <= 100_000 {
            let trauma_hash =
                state.context_atomic(atom_idx)[14].load(std::sync::atomic::Ordering::Relaxed);
            if trauma_hash != 0 {
                // Learn the traumatic signature
                state.context_atomic(atom_idx)[13]
                    .store(trauma_hash, std::sync::atomic::Ordering::Relaxed);
                state.context_atomic(atom_idx)[14].store(0, std::sync::atomic::Ordering::Relaxed);
            }
        }

        state.energy_atomic()[atom_idx].store(final_energy, std::sync::atomic::Ordering::Relaxed);

        if final_energy == 0 {
            state.ids_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
        }
    }
}
```

```

---

## FILE: src/ontology/math/C_LOG2_C_LUT.md

```markdown
---
id: C_LOG2_C_LUT
type: static_table
description: "Таблиця для швидкого розрахунку ентропії (c * log2(c))"
deps: []
dataType: i32
---

## payload: [0, 0, 2000, 4755, 8000, 11610, 15510, 19651, 24000, 28529, 33219, 38054, 43020, 48106, 53303, 58603, 64000, 69487, 75059, 80711, 86439, 92239, 98107, 104042, 110039, 116096, 122211, 128382, 134606, 140881, 147207, 153580, 160000, 166465, 172974, 179525, 186117, 192750, 199421, 206131, 212877, 219660, 226477, 233329, 240215, 247133, 254084, 261066, 268078, 275121, 282193, 289294, 296423, 303580, 310764, 317975, 325212, 332475, 339763, 347076, 354413, 361775, 369160, 376569, 384000]

```

---

## FILE: src/ontology/math/calculate_shannon_entropy.md

```markdown
---
id: calculate_shannon_entropy
type: pure_fn
description: "Швидкий розрахунок ентропії за допомогою LUT"
deps: 
  - C_LOG2_C_LUT
args:
  data: usize
rsArgs:
  data: "&[u8; 64]"
returns: i32
tests:
---

### Rust
> [!NOTE]
> The `data` param must map cleanly from WASM. Here we hardcode `&[u8; 64]` as a custom type for now.

```rust
    let mut counts = [0i32; 256];
    for &b in data.iter() {
        counts[b as usize] += 1;
    }

    let mut sum_c_log_c = 0;
    for &c in counts.iter() {
        if c > 0 {
            sum_c_log_c += C_LOG2_C_LUT[c as usize];
        }
    }

    let mut entropy = 6000 - (sum_c_log_c >> 6);
    
    if entropy < 0 {
        entropy = 0;
    } else if entropy > 6000 {
        entropy = 6000;
    }
    
    entropy
```

### TypeScript
```typescript
  // Stub for WASM
  return 0;
```

```

---

## FILE: src/ontology/math/clamp_resource.md

```markdown
---
id: clamp_resource
type: pure_fn
description: "Clamps a resource value between 0 and RESOURCE_MAX"
deps: 
  - SYSTEM_CONSTANTS
vars:
  - RESOURCE_MAX
args:
  value: i64
returns: i32
---

### Rust
```rust
if value < 0 {
    0
} else if value > (RESOURCE_MAX as i64) {
    RESOURCE_MAX as i32
} else {
    value as i32
}
```

### TypeScript
```typescript
if (value < 0n) return 0;
if (value > BigInt(RESOURCE_MAX)) return RESOURCE_MAX;
return Number(value);
```

### AssemblyScript
```assemblyscript
if (value < 0) return 0;
if (value > (RESOURCE_MAX as i64)) return RESOURCE_MAX;
return value as i32;
```

```

---

## FILE: src/ontology/math/COS_LUT.md

```markdown
---
id: COS_LUT
type: static_table
description: "Таблиця косинусів у Q15 форматі (довжина 256)"
deps: []
dataType: i16
---

## payload: [32767,32757,32728,32678,32609,32521,32412,32285,32137,31971,31785,31580,31356,31113,30852,30571,30273,29956,29621,29268,28898,28510,28105,27683,27245,26790,26319,25832,25329,24811,24279,23731,23170,22594,22005,21403,20787,20159,19519,18868,18204,17530,16846,16151,15446,14732,14010,13279,12539,11793,11039,10278,9512,8739,7962,7179,6393,5602,4808,4011,3212,2410,1608,804,0,-804,-1608,-2410,-3212,-4011,-4808,-5602,-6393,-7179,-7962,-8739,-9512,-10278,-11039,-11793,-12539,-13279,-14010,-14732,-15446,-16151,-16846,-17530,-18204,-18868,-19519,-20159,-20787,-21403,-22005,-22594,-23170,-23731,-24279,-24811,-25329,-25832,-26319,-26790,-27245,-27683,-28105,-28510,-28898,-29268,-29621,-29956,-30273,-30571,-30852,-31113,-31356,-31580,-31785,-31971,-32137,-32285,-32412,-32521,-32609,-32678,-32728,-32757,-32767,-32757,-32728,-32678,-32609,-32521,-32412,-32285,-32137,-31971,-31785,-31580,-31356,-31113,-30852,-30571,-30273,-29956,-29621,-29268,-28898,-28510,-28105,-27683,-27245,-26790,-26319,-25832,-25329,-24811,-24279,-23731,-23170,-22594,-22005,-21403,-20787,-20159,-19519,-18868,-18204,-17530,-16846,-16151,-15446,-14732,-14010,-13279,-12539,-11793,-11039,-10278,-9512,-8739,-7962,-7179,-6393,-5602,-4808,-4011,-3212,-2410,-1608,-804,0,804,1608,2410,3212,4011,4808,5602,6393,7179,7962,8739,9512,10278,11039,11793,12539,13279,14010,14732,15446,16151,16846,17530,18204,18868,19519,20159,20787,21403,22005,22594,23170,23731,24279,24811,25329,25832,26319,26790,27245,27683,28105,28510,28898,29268,29621,29956,30273,30571,30852,31113,31356,31580,31785,31971,32137,32285,32412,32521,32609,32678,32728,32757]

```

---

## FILE: src/ontology/math/fast_abs.md

```markdown
---
id: fast_abs
type: pure_fn
description: "Bitwise fast absolute value calculation utilizing sign-masking without branching (i32)"
deps: []
args:
  v: i32
returns: i32
tests:
  - [50, 50]
  - [-10, 10]
  - [0, 0]
---

### Rust
```rust
let mask = v >> 31;
(v + mask) ^ mask
```

### TypeScript
```typescript
const mask = v >> 31;
return (v + mask) ^ mask;
```

### AssemblyScript
```assemblyscript
const mask = v >> 31;
return (v + mask) ^ mask;
```

```

---

## FILE: src/ontology/math/fast_max.md

```markdown
---
id: fast_max
type: pure_fn
description: "Bitwise fast maximum calculation utilizing difference-masking without branching (i32)"
deps: []
args:
  a: i32
  b: i32
returns: i32
tests:
  - [50, 20, 50]
  - [-10, 0, 0]
  - [10, 10, 10]
---

### Rust
```rust
let diff = a - b;
a - (diff & (diff >> 31))
```

### TypeScript
```typescript
const diff = a - b;
return a - (diff & (diff >> 31));
```

### AssemblyScript
```assemblyscript
const diff = a - b;
return a - (diff & (diff >> 31));
```

```

---

## FILE: src/ontology/math/fast_min.md

```markdown
---
id: fast_min
type: pure_fn
description: "Bitwise fast minimum calculation utilizing difference-masking without branching (i32)"
deps: []
args:
  a: i32
  b: i32
returns: i32
tests:
  - [50, 20, 20]
  - [-10, 0, -10]
  - [10, 10, 10]
---

### Rust
```rust
let diff = a - b;
b + (diff & (diff >> 31))
```

### TypeScript
```typescript
const diff = a - b;
return b + (diff & (diff >> 31));
```

### AssemblyScript
```assemblyscript
const diff = a - b;
return b + (diff & (diff >> 31));
```

```

---

## FILE: src/ontology/math/fast_sign.md

```markdown
---
id: fast_sign
type: pure_fn
description: "Bitwise mathematical sign extraction (-1, 0, 1) without branching"
deps: []
args:
  v: i32
returns: i32
tests:
  - [50, 1]
  - [-10, -1]
  - [0, 0]
---

### Rust
```rust
(v >> 31) | ((-v as u32) >> 31) as i32
```

### TypeScript
```typescript
return (v >> 31) | ((<number><unknown>-v) >>> 31);
```

### AssemblyScript
```assemblyscript
return (v >> 31) | (<i32>(<u32>-v) >>> 31);
```

```

---

## FILE: src/ontology/math/math_clamp.md

```markdown
---
id: math_clamp
type: pure_fn
description: "Universal boundary enforcement function"
deps: []
args:
  val: i32
  min: i32
  max: i32
returns: i32
tests:
  - [50, 0, 100, 50]
  - [-10, 0, 100, 0]
  - [150, 0, 100, 100]
---

### Rust
```rust
if val < min {
    min
} else if val > max {
    max
} else {
    val
}
```

### TypeScript
```typescript
if (val < min) return min;
if (val > max) return max;
return val;
```

### AssemblyScript
```assemblyscript
if (val < min) return min;
if (val > max) return max;
return val;
```

```

---

## FILE: src/ontology/math/math_cos.md

```markdown
---
id: math_cos
type: pure_fn
description: "Обчислення косинуса з динамічною точністю (LUT, LERP, TAYLOR2)"
deps: 
  - SIN_LUT
  - COS_LUT
vars:
  - SIN_LUT
  - COS_LUT
args:
  angle: i32
  highRes: i32
returns: i32
tests:
  - [0, 0, 32767]
  - [64, 0, 0]
  - [128, 0, -32767]
  - [192, 0, 0]
---

### Rust
```rust
if highRes == 0 {
    let idx = (angle & 255) as usize;
    return COS_LUT[idx] as i32;
}
let idx = ((angle >> 8) & 255) as usize;
let frac = angle & 255;

if highRes == 1 {
    let v0 = COS_LUT[idx] as i32;
    let v1 = COS_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (s_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (c_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
c_base - term1 - term2
```

### TypeScript
```typescript
if (highRes == 0) {
    let idx = angle & 255;
    return COS_LUT[idx] as i32;
}
let idx = (angle >> 8) & 255;
let frac = angle & 255;

if (highRes == 1) {
    let v0 = COS_LUT[idx] as i32;
    let v1 = COS_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (s_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (c_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
return c_base - term1 - term2;
```

```

---

## FILE: src/ontology/math/math_sin.md

```markdown
---
id: math_sin
type: pure_fn
description: "Обчислення синуса з динамічною точністю"
deps: 
  - SIN_LUT
  - COS_LUT
vars:
  - SIN_LUT
  - COS_LUT
args:
  angle: i32
  highRes: i32
returns: i32
tests:
  - [0, 0, 0]
  - [1, 0, 804]
  - [1, 1, 804]
---

### Rust
```rust
if highRes == 0 {
    let idx = (angle & 255) as usize;
    return SIN_LUT[idx] as i32;
}
let idx = ((angle >> 8) & 255) as usize;
let frac = angle & 255;

if highRes == 1 {
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

// TAYLOR2
let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (c_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (s_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
s_base + term1 - term2
```

### TypeScript
```typescript
if (highRes == 0) {
    let idx = angle & 255;
    return SIN_LUT[idx] as i32;
}
let idx = (angle >> 8) & 255;
let frac = angle & 255;

if (highRes == 1) {
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
}

let s_base = SIN_LUT[idx] as i32;
let c_base = COS_LUT[idx] as i32;
let d1 = (c_base * 804) >> 15;
let term1 = (d1 * frac) >> 8;
let d2 = (s_base * 10) >> 15;
let term2 = (d2 * frac * frac) >> 16;
return s_base + term1 - term2;
```

```

---

## FILE: src/ontology/math/prng_next.md

```markdown
---
id: prng_next
type: pure_fn
dataType: null
returns: u32
level: 1
args:
  state: u32
deps: []
vars: []
---

---
---

```rust
    state.wrapping_mul(1664525).wrapping_add(1013904223)
```

```typescript
    return (state * 1664525 + 1013904223) | 0;
```

```assemblyscript
  return (state * 1664525 + 1013904223) | 0;
```

```

---

## FILE: src/ontology/math/SIN_LUT.md

```markdown
---
id: SIN_LUT
type: static_table
description: "Таблиця синусів у Q15 форматі (довжина 256)"
deps: []
dataType: i16
---

## payload: [0,804,1608,2410,3212,4011,4808,5602,6393,7179,7962,8739,9512,10278,11039,11793,12539,13279,14010,14732,15446,16151,16846,17530,18204,18868,19519,20159,20787,21403,22005,22594,23170,23731,24279,24811,25329,25832,26319,26790,27245,27683,28105,28510,28898,29268,29621,29956,30273,30571,30852,31113,31356,31580,31785,31971,32137,32285,32412,32521,32609,32678,32728,32757,32767,32757,32728,32678,32609,32521,32412,32285,32137,31971,31785,31580,31356,31113,30852,30571,30273,29956,29621,29268,28898,28510,28105,27683,27245,26790,26319,25832,25329,24811,24279,23731,23170,22594,22005,21403,20787,20159,19519,18868,18204,17530,16846,16151,15446,14732,14010,13279,12539,11793,11039,10278,9512,8739,7962,7179,6393,5602,4808,4011,3212,2410,1608,804,0,-804,-1608,-2410,-3212,-4011,-4808,-5602,-6393,-7179,-7962,-8739,-9512,-10278,-11039,-11793,-12539,-13279,-14010,-14732,-15446,-16151,-16846,-17530,-18204,-18868,-19519,-20159,-20787,-21403,-22005,-22594,-23170,-23731,-24279,-24811,-25329,-25832,-26319,-26790,-27245,-27683,-28105,-28510,-28898,-29268,-29621,-29956,-30273,-30571,-30852,-31113,-31356,-31580,-31785,-31971,-32137,-32285,-32412,-32521,-32609,-32678,-32728,-32757,-32767,-32757,-32728,-32678,-32609,-32521,-32412,-32285,-32137,-31971,-31785,-31580,-31356,-31113,-30852,-30571,-30273,-29956,-29621,-29268,-28898,-28510,-28105,-27683,-27245,-26790,-26319,-25832,-25329,-24811,-24279,-23731,-23170,-22594,-22005,-21403,-20787,-20159,-19519,-18868,-18204,-17530,-16846,-16151,-15446,-14732,-14010,-13279,-12539,-11793,-11039,-10278,-9512,-8739,-7962,-7179,-6393,-5602,-4808,-4011,-3212,-2410,-1608,-804]

```

---

## FILE: src/ontology/memory/add_energy_delta.md

```markdown
---
id: add_energy_delta
type: pure_fn
description: "Atomic add to physics energy delta array"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ENERGY_DELTA_OFF
args:
  idx: i32
  delta: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
if (delta !== 0) {
  Atomics.add(energyDeltaView, idx, delta);
}
```

### AssemblyScript
```assemblyscript
if (delta != 0) {
  atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2), delta);
}
```

```

---

## FILE: src/ontology/memory/add_hive_balance.md

```markdown
---
id: add_hive_balance
type: pure_fn
description: "Atomically add integer to global hive energy pool"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_BALANCE_OFF
args:
  val: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return Atomics.add(hiveBalanceView, 0, val);
```

### AssemblyScript
```assemblyscript
return atomic.add<i32>(HIVE_BALANCE_OFF, val);
```

```

---

## FILE: src/ontology/memory/add_resonance_delta.md

```markdown
---
id: add_resonance_delta
type: pure_fn
description: "Atomic add to physics resonance delta array"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - RESONANCE_DELTA_OFF
args:
  idx: i32
  delta: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
if (delta !== 0) {
  Atomics.add(resonanceDeltaView, idx, delta);
}
```

### AssemblyScript
```assemblyscript
if (delta != 0) {
  atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2), delta);
}
```

```

---

## FILE: src/ontology/memory/add_resonance.md

```markdown
---
id: add_resonance
type: pure_fn
description: "Add a delta to atom resonance in the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
  - get_resonance
  - set_resonance
vars:
  - get_resonance
  - set_resonance
args:
  idx: i32
  delta: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
set_resonance(idx, get_resonance(idx) + delta);
```

### AssemblyScript
```assemblyscript
set_resonance(idx, get_resonance(idx) + delta);
```

```

---

## FILE: src/ontology/memory/genome_key16.md

```markdown
---
id: genome_key16
type: pure_fn
description: "Read the first two logic bytes of an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - LOGIC_OFFSET
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
const b0 = dataView.getUint8(LOGIC_OFFSET + (idx << 3));
const b1 = dataView.getUint8(LOGIC_OFFSET + (idx << 3) + 1);
return (b0 << 8) | b1;
```

### AssemblyScript
```assemblyscript
const ptr = LOGIC_OFFSET + (idx << 3);
const b0 = load<u8>(ptr) as i32;
const b1 = load<u8>(ptr + 1) as i32;
return (b0 << 8) | b1;
```

```

---

## FILE: src/ontology/memory/get_bond_stiffness.md

```markdown
---
id: get_bond_stiffness
type: pure_fn
description: "Read atomic bond stiffness"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - STIFFNESS_OFFSET
args:
  atomIdx: i32
  slot: i32
returns: f32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getFloat32(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), true);
```

### AssemblyScript
```assemblyscript
return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2));
```

```

---

## FILE: src/ontology/memory/get_bond_target.md

```markdown
---
id: get_bond_target
type: pure_fn
description: "Read atom bond target by slot"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - BONDS_OFFSET
args:
  atomIdx: i32
  slot: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2));
```

```

---

## FILE: src/ontology/memory/get_energy.md

```markdown
---
id: get_energy
type: pure_fn
description: "Read atom energy from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ENERGY_OFFSET
args:
  idx: i32
returns: i32
---

### Rust
```rust
// Requires SharedArrayBuffer pointer mechanism in parent scope
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
// Requires `dataView: DataView` in scope
return dataView.getInt32(ENERGY_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(ENERGY_OFFSET + (idx << 2));
```

```

---

## FILE: src/ontology/memory/get_hive_balance.md

```markdown
---
id: get_hive_balance
type: pure_fn
description: "Read total hive energy balance"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_BALANCE_OFF
args: {}
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return Atomics.load(hiveBalanceView, 0);
```

### AssemblyScript
```assemblyscript
return atomic.load<i32>(HIVE_BALANCE_OFF);
```

```

---

## FILE: src/ontology/memory/get_hive_memory.md

```markdown
---
id: get_hive_memory
type: pure_fn
description: "Read byte from the organism shared neural memory block"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_MEMORY_OFF
args:
  addr: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(HIVE_MEMORY_OFF + (addr & 1023));
```

### AssemblyScript
```assemblyscript
return load<u8>(HIVE_MEMORY_OFF + (addr & 1023));
```

```

---

## FILE: src/ontology/memory/get_hormone.md

```markdown
---
id: get_hormone
type: pure_fn
description: "Read global hormone level atomically"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HORMONE_OFF
args:
  id: i32
returns: u16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return Atomics.load(HormoneView, id);
```

### AssemblyScript
```assemblyscript
return atomic.load<u16>(HORMONE_OFF + (id << 1));
```

```

---

## FILE: src/ontology/memory/get_lineage.md

```markdown
---
id: get_lineage
type: pure_fn
description: "Read atom lineage (u64) from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - LINEAGE_OFFSET
args:
  idx: i32
returns: u64
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getBigUint64(LINEAGE_OFFSET + (idx << 3), true);
```

### AssemblyScript
```assemblyscript
return load<u64>(LINEAGE_OFFSET + (idx << 3));
```

```

---

## FILE: src/ontology/memory/get_logic_byte.md

```markdown
---
id: get_logic_byte
type: pure_fn
description: "Read a specific byte from an atom's logic array"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - LOGIC_OFFSET
args:
  idx: i32
  slot: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(LOGIC_OFFSET + (idx << 3) + slot);
```

### AssemblyScript
```assemblyscript
return load<u8>(LOGIC_OFFSET + (idx << 3) + slot);
```

```

---

## FILE: src/ontology/memory/get_p_c.md

```markdown
---
id: get_p_c
type: pure_fn
description: "Read program counter of an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(CONTEXT_OFFSET + (atomIdx << 6) + 32);
```

### AssemblyScript
```assemblyscript
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32);
```

```

---

## FILE: src/ontology/memory/get_pending_syscall.md

```markdown
---
id: get_pending_syscall
type: pure_fn
description: "Read pending syscall flag for an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(CONTEXT_OFFSET + (atomIdx << 6) + 33);
```

### AssemblyScript
```assemblyscript
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33);
```

```

---

## FILE: src/ontology/memory/get_phase.md

```markdown
---
id: get_phase
type: pure_fn
description: "Read atom phase from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHASE_OFFSET
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(PHASE_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(PHASE_OFFSET + (idx << 2));
```

```

---

## FILE: src/ontology/memory/get_read_energy.md

```markdown
---
id: get_read_energy
type: pure_fn
description: "Read physics buffered atom Energy from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHYSICS_READ_ENERGY_OFF
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(PHYSICS_READ_ENERGY_OFF + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2));
```

```

---

## FILE: src/ontology/memory/get_read_resonance.md

```markdown
---
id: get_read_resonance
type: pure_fn
description: "Read physics buffered atom Resonance from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHYSICS_READ_RESONANCE_OFF
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(PHYSICS_READ_RESONANCE_OFF + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2));
```

```

---

## FILE: src/ontology/memory/get_read_x.md

```markdown
---
id: get_read_x
type: pure_fn
description: "Read physics buffered atom X coordinate from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHYSICS_READ_XS_OFF
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt16(PHYSICS_READ_XS_OFF + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1));
```

```

---

## FILE: src/ontology/memory/get_read_y.md

```markdown
---
id: get_read_y
type: pure_fn
description: "Read physics buffered atom Y coordinate from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHYSICS_READ_YS_OFF
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt16(PHYSICS_READ_YS_OFF + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1));
```

```

---

## FILE: src/ontology/memory/get_reg.md

```markdown
---
id: get_reg
type: pure_fn
description: "Read atomic execution register"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  reg: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2));
```

```

---

## FILE: src/ontology/memory/get_resonance.md

```markdown
---
id: get_resonance
type: pure_fn
description: "Read atom resonance from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - RESONANCE_OFFSET
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(RESONANCE_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(RESONANCE_OFFSET + (idx << 2));
```

```

---

## FILE: src/ontology/memory/get_role.md

```markdown
---
id: get_role
type: pure_fn
description: "Read semantic role of an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ROLES_OFFSET
args:
  atomIdx: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(ROLES_OFFSET + atomIdx);
```

### AssemblyScript
```assemblyscript
return load<u8>(ROLES_OFFSET + atomIdx);
```

```

---

## FILE: src/ontology/memory/get_spatial_grid_atom.md

```markdown
---
id: get_spatial_grid_atom
type: pure_fn
description: "Read atom reference index at grid slot"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - SPATIAL_GRID_OFFSET
  - GRID_W
args:
  gx: i32
  gy: i32
  subIdx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
const cellIdx = gy * GRID_W + gx;
return dataView.getInt32(SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2), true);
```

### AssemblyScript
```assemblyscript
let cellIdx = gy * GRID_W + gx;
return load<i32>(
  SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2)
);
```

```

---

## FILE: src/ontology/memory/get_spatial_grid_count.md

```markdown
---
id: get_spatial_grid_count
type: pure_fn
description: "Read population density in a spatial cell"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - SPATIAL_GRID_OFFSET
  - GRID_W
args:
  gx: i32
  gy: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
const cellIdx = gy * GRID_W + gx;
return dataView.getInt32(SPATIAL_GRID_OFFSET + (cellIdx << 7), true);
```

### AssemblyScript
```assemblyscript
let cellIdx = gy * GRID_W + gx;
return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7));
```

```

---

## FILE: src/ontology/memory/get_x.md

```markdown
---
id: get_x
type: pure_fn
description: "Read atom X coordinate from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - XS_OFFSET
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt16(XS_OFFSET + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(XS_OFFSET + (idx << 1));
```

```

---

## FILE: src/ontology/memory/get_y.md

```markdown
---
id: get_y
type: pure_fn
description: "Read atom Y coordinate from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - YS_OFFSET
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt16(YS_OFFSET + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(YS_OFFSET + (idx << 1));
```

```

---

## FILE: src/ontology/memory/set_bond_dist.md

```markdown
---
id: set_bond_dist
type: pure_fn
description: "Set bond stretch distance in u8 representation"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - BOND_DISTANCES_OFFSET
args:
  atomIdx: i32
  slot: i32
  dist: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot, dist);
```

### AssemblyScript
```assemblyscript
store<u8>(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot, dist);
```

```

---

## FILE: src/ontology/memory/set_bond_stiffness.md

```markdown
---
id: set_bond_stiffness
type: pure_fn
description: "Set atomic bond stiffness"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - STIFFNESS_OFFSET
args:
  atomIdx: i32
  slot: i32
  val: f32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setFloat32(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), val);
```

```

---

## FILE: src/ontology/memory/set_bond_target.md

```markdown
---
id: set_bond_target
type: pure_fn
description: "Write atom bond target by slot"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - BONDS_OFFSET
args:
  atomIdx: i32
  slot: i32
  targetIdx: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), targetIdx, true);
```

### AssemblyScript
```assemblyscript
store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), targetIdx);
```

```

---

## FILE: src/ontology/memory/set_damping.md

```markdown
---
id: set_damping
type: pure_fn
description: "Set atomic kinetic damping factor"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - DAMPING_OFF
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(DAMPING_OFF + atomIdx, val);
```

### AssemblyScript
```assemblyscript
store<u8>(DAMPING_OFF + atomIdx, val);
```

```

---

## FILE: src/ontology/memory/set_energy.md

```markdown
---
id: set_energy
type: pure_fn
description: "Write atom energy to the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ENERGY_OFFSET
args:
  idx: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
// Requires `dataView: DataView` in scope
dataView.setInt32(ENERGY_OFFSET + (idx << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<i32>(ENERGY_OFFSET + (idx << 2), val);
```

```

---

## FILE: src/ontology/memory/set_hive_memory.md

```markdown
---
id: set_hive_memory
type: pure_fn
description: "Write byte to the organism shared neural memory block"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_MEMORY_OFF
args:
  addr: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(HIVE_MEMORY_OFF + (addr & 1023), val);
```

### AssemblyScript
```assemblyscript
store<u8>(HIVE_MEMORY_OFF + (addr & 1023), val);
```

```

---

## FILE: src/ontology/memory/set_p_c.md

```markdown
---
id: set_p_c
type: pure_fn
description: "Set program counter of an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(CONTEXT_OFFSET + (atomIdx << 6) + 32, val);
```

### AssemblyScript
```assemblyscript
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32, val);
```

```

---

## FILE: src/ontology/memory/set_pending_syscall.md

```markdown
---
id: set_pending_syscall
type: pure_fn
description: "Set pending syscall flag for an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(CONTEXT_OFFSET + (atomIdx << 6) + 33, val);
```

### AssemblyScript
```assemblyscript
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33, val);
```

```

---

## FILE: src/ontology/memory/set_phase.md

```markdown
---
id: set_phase
type: pure_fn
description: "Write atom phase to the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHASE_OFFSET
args:
  idx: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(PHASE_OFFSET + (idx << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<i32>(PHASE_OFFSET + (idx << 2), val);
```

```

---

## FILE: src/ontology/memory/set_reg.md

```markdown
---
id: set_reg
type: pure_fn
description: "Write atomic execution register"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  reg: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), val);
```

```

---

## FILE: src/ontology/memory/set_resonance.md

```markdown
---
id: set_resonance
type: pure_fn
description: "Write atom resonance to the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
  - clamp_resource
vars:
  - RESONANCE_OFFSET
  - clamp_resource
args:
  idx: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(RESONANCE_OFFSET + (idx << 2), clamp_resource(BigInt(val)), true);
```

### AssemblyScript
```assemblyscript
store<i32>(RESONANCE_OFFSET + (idx << 2), clamp_resource(val as i64));
```

```

---

## FILE: src/ontology/memory/set_role.md

```markdown
---
id: set_role
type: pure_fn
description: "Write semantic role to an atom"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ROLES_OFFSET
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(ROLES_OFFSET + atomIdx, val);
```

### AssemblyScript
```assemblyscript
store<u8>(ROLES_OFFSET + atomIdx, val);
```

```

---

## FILE: src/ontology/physics/apply_bond_springs.md

```markdown
---
id: apply_bond_springs
type: pure_fn
dataType: null
returns: void
level: 1
args:
  idx: i32
  x: i32
  y: i32
vars:
  - DAMPING_OFF
  - MAX_ATOMS
  - BOND_DISTANCES_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_bond_target
  - get_bond_stiffness
  - get_read_x
  - get_read_y
  - get_read_resonance
  - add_resonance_delta
  - encode_force_tuple
description: Auto-recovered apply_bond_springs
---

---
---

```rust
unimplemented!()
```

```typescript
let fx: f32 = 0;
let fy: f32 = 0;
let damping = load<u8>(DAMPING_OFF + idx as usize);

for (let b = 0; b < 4; b++) {
  let targetIdx = get_bond_target(idx, b);
  if (targetIdx == 0 || targetIdx >= MAX_ATOMS) continue;

  let targetDist = load<u8>(BOND_DISTANCES_OFFSET + (idx << 2) + b as usize);
  if (targetDist == 0) targetDist = 50;

  let stiffness = get_bond_stiffness(idx, b);
  let pX = get_read_x(targetIdx) as f32;
  let pY = get_read_y(targetIdx) as f32;
  let dx = pX - (x as f32);
  let dy = pY - (y as f32);
  let dist = Mathf.sqrt(dx * dx + dy * dy);
  if (dist < 1.0) dist = 1.0;

  // --- Stage 9.1: Resonance-Weighted Stiffness & Symbiosis ---
  let myRes = get_read_resonance(idx);
  let targetRes = get_read_resonance(targetIdx);

  // 1. Resonance Synchronization: Equalize resonance between bonded partners (5% flow)
  if (targetRes > myRes) {
    add_resonance_delta(idx, (targetRes - myRes) / 20);
  } else if (myRes > targetRes) {
    add_resonance_delta(idx, -((myRes - targetRes) / 20));
  }

  // 2. Resonance-Weighted Stiffness: Bonds are stronger if atoms are synchronized
  let sumRes: f32 = (myRes as f32) + (targetRes as f32);
  let resonanceWeight: f32 = sumRes / 600.0;
  if (resonanceWeight < 0.5) resonanceWeight = 0.5;
  if (resonanceWeight > 2.0) resonanceWeight = 2.0;

  if (stiffness > 0.8) {
    let force = (dist - (targetDist as f32)) * 1.5 * resonanceWeight;
    fx += (dx / dist) * force;
    fy += (dy / dist) * force;
  } else {
    let elasticRange: f32 = 10.0;
    if (dist > (targetDist as f32) + elasticRange) {
      let force = (dist - ((targetDist as f32) + elasticRange)) * 0.1 *
        resonanceWeight;
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    } else if (dist < (targetDist as f32) - elasticRange) {
      let force = (((targetDist as f32) - elasticRange) - dist) * 0.2 *
        resonanceWeight;
      fx -= (dx / dist) * force;
      fy -= (dy / dist) * force;
    }
  }
}

if (damping > 0) {
  let dampingFactor = Mathf.max(0, 1.0 - ((damping as f32) / 255.0));
  fx *= dampingFactor;
  fy *= dampingFactor;
}

return encode_force_tuple(fx, fy);
```

```assemblyscript
let fx: f32 = 0;
let fy: f32 = 0;
let damping = load<u8>(DAMPING_OFF + idx as usize);

for (let b = 0; b < 4; b++) {
  let targetIdx = get_bond_target(idx, b);
  if (targetIdx == 0 || targetIdx >= MAX_ATOMS) continue;

  let targetDist = load<u8>(BOND_DISTANCES_OFFSET + (idx << 2) + b as usize);
  if (targetDist == 0) targetDist = 50;

  let stiffness = get_bond_stiffness(idx, b);
  let pX = get_read_x(targetIdx) as f32;
  let pY = get_read_y(targetIdx) as f32;
  let dx = pX - (x as f32);
  let dy = pY - (y as f32);
  let dist = Mathf.sqrt(dx * dx + dy * dy);
  if (dist < 1.0) dist = 1.0;

  // --- Stage 9.1: Resonance-Weighted Stiffness & Symbiosis ---
  let myRes = get_read_resonance(idx);
  let targetRes = get_read_resonance(targetIdx);

  // 1. Resonance Synchronization: Equalize resonance between bonded partners (5% flow)
  if (targetRes > myRes) {
    add_resonance_delta(idx, (targetRes - myRes) / 20);
  } else if (myRes > targetRes) {
    add_resonance_delta(idx, -((myRes - targetRes) / 20));
  }

  // 2. Resonance-Weighted Stiffness: Bonds are stronger if atoms are synchronized
  let sumRes: f32 = (myRes as f32) + (targetRes as f32);
  let resonanceWeight: f32 = sumRes / 600.0;
  if (resonanceWeight < 0.5) resonanceWeight = 0.5;
  if (resonanceWeight > 2.0) resonanceWeight = 2.0;

  if (stiffness > 0.8) {
    let force = (dist - (targetDist as f32)) * 1.5 * resonanceWeight;
    fx += (dx / dist) * force;
    fy += (dy / dist) * force;
  } else {
    let elasticRange: f32 = 10.0;
    if (dist > (targetDist as f32) + elasticRange) {
      let force = (dist - ((targetDist as f32) + elasticRange)) * 0.1 *
        resonanceWeight;
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    } else if (dist < (targetDist as f32) - elasticRange) {
      let force = (((targetDist as f32) - elasticRange) - dist) * 0.2 *
        resonanceWeight;
      fx -= (dx / dist) * force;
      fy -= (dy / dist) * force;
    }
  }
}

if (damping > 0) {
  let dampingFactor = Mathf.max(0, 1.0 - ((damping as f32) / 255.0));
  fx *= dampingFactor;
  fy *= dampingFactor;
}

return encode_force_tuple(fx, fy);
```

```

---

## FILE: src/ontology/physics/calculate_trophism.md

```markdown
---
id: calculate_trophism
type: pure_fn
dataType: null
returns: void
level: 1
args:
  idx: i32
  x: i32
  y: i32
  role: u8
vars:
  - SPATIAL_CELL_SIZE
  - MAX_ATOMS
  - ROLE_PRODUCER
  - ROLE_NEUTRAL
  - ROLE_GUARDIAN
  - ROLE_PARASITE
  - ROLE_ARCHITECT
  - GRID_W
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_read_energy
  - in_grid
  - get_spatial_grid_count
  - get_spatial_grid_atom
  - get_read_x
  - get_read_y
  - get_role
  - add_energy_delta
  - add_resonance_delta
  - get_read_resonance
  - get_attention_cell
  - get_glyph_influence
  - read_structure_cell
  - encode_force_tuple
description: Auto-recovered calculate_trophism
---

---
---

```rust
unimplemented!()
```

```typescript
let tx: f32 = 0;
let ty: f32 = 0;
const radius: f32 = 250.0;
const detectionRadiusSq: f32 = 225.0; // 15^2
const flow: i32 = (0.2 * 1000.0) as i32; // Using 1000.0 for literal scale
const burn: i32 = (1.0 * 1000.0) as i32;
let energy = get_read_energy(idx);

const gx = x / SPATIAL_CELL_SIZE;
const gy = y / SPATIAL_CELL_SIZE;

// Scan neighborhood for chemotaxis, trophic flow, and social recognition
for (let oy = -3; oy <= 3; oy++) {
  for (let ox = -3; ox <= 3; ox++) {
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let count = get_spatial_grid_count(cx, cy);
      for (let s = 0; s < count; s++) {
        let otherIdx = get_spatial_grid_atom(cx, cy, s);
        if (otherIdx == idx || otherIdx >= MAX_ATOMS) continue;

        let oX = get_read_x(otherIdx) as f32;
        let oY = get_read_y(otherIdx) as f32;
        let dx = oX - (x as f32);
        let dy = oY - (y as f32);
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.001) {
          // Overlapping atoms flow energy but don't apply chemotaxis/avoidance (divide by zero)
          d2 = 0.001;
        } else if (d2 < 1.0) {
          // Minor overlap, let it through
        }

        // --- PHASE 15: SOCIAL RECOGNITION (AVOIDANCE) ---
        if (d2 < 100.0) { // Too close!
          tx -= dx * 0.5;
          ty -= dy * 0.5;
        }

        // --- PHASE 17+: TROPHIC FLOW ---
        if (d2 <= detectionRadiusSq) {
          let otherRole = get_role(otherIdx);
          if (role == ROLE_PRODUCER && otherRole == ROLE_NEUTRAL) {
            if (energy > 100 * 1000) {
              add_energy_delta(idx, -flow);
              add_energy_delta(otherIdx, flow);
              energy -= flow;
            }
          }
          if (role == ROLE_GUARDIAN && otherRole == ROLE_PARASITE) {
            let oEnergy = get_read_energy(otherIdx);
            if (oEnergy > 0) {
              add_energy_delta(
                otherIdx,
                -Mathf.min(oEnergy as f32, burn as f32) as i32,
              );
              add_resonance_delta(idx, 5);
            }
          }
        }

        if (d2 > radius * radius) continue;
        let d = Mathf.sqrt(d2);

        // --- PHASE 14: CHEMOTAXIS ---
        let oEnergy = get_read_energy(otherIdx);
        let oRes = get_read_resonance(otherIdx);

        let multiplier: f32 = 1.0;
        if (role == ROLE_GUARDIAN && oRes > 50) multiplier = 3.0;
        if (role == ROLE_PRODUCER && (oEnergy as f32) < 50000.0) {
          multiplier = 2.0; // 50.0 * 1000
        }

        let force = ((oEnergy as f32) / 100000.0) * ((radius - d) / radius) *
          (2.0 * multiplier);

        // Hard cap on chemotactic force to prevent physics explosions
        // when arbitrary massive energy pools are assigned by the test runner.
        if (force < -20.0) force = -20.0;
        if (force > 20.0) force = 20.0;

        // Anti-overshoot mechanism: Do not pull an atom past its target
        if (force > 0.0 && force > d) {
          force = d;
        }

        tx += (dx / d) * force;
        ty += (dy / d) * force;
      }
    }
  }
}

// Observer presence field (Era 70): role-dependent response to attention gradients.
let gradX = get_attention_cell(gx + 1, gy) - get_attention_cell(gx - 1, gy);
let gradY = get_attention_cell(gx, gy + 1) - get_attention_cell(gx, gy - 1);
if (gradX > 200.0) gradX = 200.0;
if (gradX < -200.0) gradX = -200.0;
if (gradY > 200.0) gradY = 200.0;
if (gradY < -200.0) gradY = -200.0;

let attentionDrive: f32 = 0.0;
if (role == ROLE_PARASITE) {
  attentionDrive = -0.04;
} else if (role == ROLE_ARCHITECT) {
  const localAttention = get_attention_cell(gx, gy);
  attentionDrive = localAttention > 80.0 ? -0.03 : 0.02;
} else if (role == ROLE_GUARDIAN) {
  attentionDrive = 0.02;
} else {
  attentionDrive = 0.05; // Producers and neutral explorers gravitate to attention.
}
tx += gradX * attentionDrive;
ty += gradY * attentionDrive;

let glyphGradX = get_glyph_influence(gx + 1, gy, role) -
  get_glyph_influence(gx - 1, gy, role);
let glyphGradY = get_glyph_influence(gx, gy + 1, role) -
  get_glyph_influence(gx, gy - 1, role);
if (glyphGradX > 200.0) glyphGradX = 200.0;
if (glyphGradX < -200.0) glyphGradX = -200.0;
if (glyphGradY > 200.0) glyphGradY = 200.0;
if (glyphGradY < -200.0) glyphGradY = -200.0;
tx += glyphGradX * 0.015;
ty += glyphGradY * 0.015;

if (role == ROLE_ARCHITECT) {
  // Simple 4-way density check
  for (let i = 0; i < 4; i++) {
    let ox: i32 = 0;
    let oy: i32 = 0;
    if (i == 0) {
      oy = -2;
    } else if (i == 1) {
      oy = 2;
    } else if (i == 2) {
      ox = -2;
    } else {
      ox = 2;
    }
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let cell = read_structure_cell(cy * GRID_W + cx);
      let density = (cell >> 8) & 0xFF;
      let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
      tx += ((ox as f32) / (2.0 as f32)) * force;
      ty += ((oy as f32) / (2.0 as f32)) * force;
    }
  }
}

return encode_force_tuple(tx, ty);
```

```assemblyscript
let tx: f32 = 0;
let ty: f32 = 0;
const radius: f32 = 250.0;
const detectionRadiusSq: f32 = 225.0; // 15^2
const flow: i32 = (0.2 * 1000.0) as i32; // Using 1000.0 for literal scale
const burn: i32 = (1.0 * 1000.0) as i32;
let energy = get_read_energy(idx);

const gx = x / SPATIAL_CELL_SIZE;
const gy = y / SPATIAL_CELL_SIZE;

// Scan neighborhood for chemotaxis, trophic flow, and social recognition
for (let oy = -3; oy <= 3; oy++) {
  for (let ox = -3; ox <= 3; ox++) {
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let count = get_spatial_grid_count(cx, cy);
      for (let s = 0; s < count; s++) {
        let otherIdx = get_spatial_grid_atom(cx, cy, s);
        if (otherIdx == idx || otherIdx >= MAX_ATOMS) continue;

        let oX = get_read_x(otherIdx) as f32;
        let oY = get_read_y(otherIdx) as f32;
        let dx = oX - (x as f32);
        let dy = oY - (y as f32);
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.001) {
          // Overlapping atoms flow energy but don't apply chemotaxis/avoidance (divide by zero)
          d2 = 0.001;
        } else if (d2 < 1.0) {
          // Minor overlap, let it through
        }

        // --- PHASE 15: SOCIAL RECOGNITION (AVOIDANCE) ---
        if (d2 < 100.0) { // Too close!
          tx -= dx * 0.5;
          ty -= dy * 0.5;
        }

        // --- PHASE 17+: TROPHIC FLOW ---
        if (d2 <= detectionRadiusSq) {
          let otherRole = get_role(otherIdx);
          if (role == ROLE_PRODUCER && otherRole == ROLE_NEUTRAL) {
            if (energy > 100 * 1000) {
              add_energy_delta(idx, -flow);
              add_energy_delta(otherIdx, flow);
              energy -= flow;
            }
          }
          if (role == ROLE_GUARDIAN && otherRole == ROLE_PARASITE) {
            let oEnergy = get_read_energy(otherIdx);
            if (oEnergy > 0) {
              add_energy_delta(
                otherIdx,
                -Mathf.min(oEnergy as f32, burn as f32) as i32,
              );
              add_resonance_delta(idx, 5);
            }
          }
        }

        if (d2 > radius * radius) continue;
        let d = Mathf.sqrt(d2);

        // --- PHASE 14: CHEMOTAXIS ---
        let oEnergy = get_read_energy(otherIdx);
        let oRes = get_read_resonance(otherIdx);

        let multiplier: f32 = 1.0;
        if (role == ROLE_GUARDIAN && oRes > 50) multiplier = 3.0;
        if (role == ROLE_PRODUCER && (oEnergy as f32) < 50000.0) {
          multiplier = 2.0; // 50.0 * 1000
        }

        let force = ((oEnergy as f32) / 100000.0) * ((radius - d) / radius) *
          (2.0 * multiplier);

        // Hard cap on chemotactic force to prevent physics explosions
        // when arbitrary massive energy pools are assigned by the test runner.
        if (force < -20.0) force = -20.0;
        if (force > 20.0) force = 20.0;

        // Anti-overshoot mechanism: Do not pull an atom past its target
        if (force > 0.0 && force > d) {
          force = d;
        }

        tx += (dx / d) * force;
        ty += (dy / d) * force;
      }
    }
  }
}

// Observer presence field (Era 70): role-dependent response to attention gradients.
let gradX = get_attention_cell(gx + 1, gy) - get_attention_cell(gx - 1, gy);
let gradY = get_attention_cell(gx, gy + 1) - get_attention_cell(gx, gy - 1);
if (gradX > 200.0) gradX = 200.0;
if (gradX < -200.0) gradX = -200.0;
if (gradY > 200.0) gradY = 200.0;
if (gradY < -200.0) gradY = -200.0;

let attentionDrive: f32 = 0.0;
if (role == ROLE_PARASITE) {
  attentionDrive = -0.04;
} else if (role == ROLE_ARCHITECT) {
  const localAttention = get_attention_cell(gx, gy);
  attentionDrive = localAttention > 80.0 ? -0.03 : 0.02;
} else if (role == ROLE_GUARDIAN) {
  attentionDrive = 0.02;
} else {
  attentionDrive = 0.05; // Producers and neutral explorers gravitate to attention.
}
tx += gradX * attentionDrive;
ty += gradY * attentionDrive;

let glyphGradX = get_glyph_influence(gx + 1, gy, role) -
  get_glyph_influence(gx - 1, gy, role);
let glyphGradY = get_glyph_influence(gx, gy + 1, role) -
  get_glyph_influence(gx, gy - 1, role);
if (glyphGradX > 200.0) glyphGradX = 200.0;
if (glyphGradX < -200.0) glyphGradX = -200.0;
if (glyphGradY > 200.0) glyphGradY = 200.0;
if (glyphGradY < -200.0) glyphGradY = -200.0;
tx += glyphGradX * 0.015;
ty += glyphGradY * 0.015;

if (role == ROLE_ARCHITECT) {
  // Simple 4-way density check
  for (let i = 0; i < 4; i++) {
    let ox: i32 = 0;
    let oy: i32 = 0;
    if (i == 0) {
      oy = -2;
    } else if (i == 1) {
      oy = 2;
    } else if (i == 2) {
      ox = -2;
    } else {
      ox = 2;
    }
    let cx = gx + ox;
    let cy = gy + oy;
    if (in_grid(cx, cy)) {
      let cell = read_structure_cell(cy * GRID_W + cx);
      let density = (cell >> 8) & 0xFF;
      let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
      tx += ((ox as f32) / (2.0 as f32)) * force;
      ty += ((oy as f32) / (2.0 as f32)) * force;
    }
  }
}

return encode_force_tuple(tx, ty);
```

```

---

## FILE: src/ontology/physics/encode_force_tuple.md

```markdown
---
id: encode_force_tuple
type: pure_fn
dataType: null
returns: void
level: 1
args:
  fx: f32
  fy: f32
description: Auto-recovered encode_force_tuple
---

---
---

```rust
unimplemented!()
```

```typescript
// Reinterpret cast f32 -> i32 then pack into i64
const xInt = reinterpret<i32>(fx);
const yInt = reinterpret<i32>(fy);
return ((xInt as i64) << 32) | ((yInt as i64) & 0xFFFFFFFF);
```

```assemblyscript
// Reinterpret cast f32 -> i32 then pack into i64
const xInt = reinterpret<i32>(fx);
const yInt = reinterpret<i32>(fy);
return ((xInt as i64) << 32) | ((yInt as i64) & 0xFFFFFFFF);
```

```

---

## FILE: src/ontology/physics/fire_signal.md

```markdown
---
id: fire_signal
type: pure_fn
dataType: null
returns: void
level: 1
args:
  idx: i32
vars:
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_bond_target
  - get_bond_stiffness
  - add_resonance_delta
description: Auto-recovered fire_signal
---

---
---

```rust
unimplemented!()
```

```typescript
for (let b = 0; b < 4; b++) {
  let target = get_bond_target(idx, b);
  if (target > 0 && target < MAX_ATOMS) {
    let st = get_bond_stiffness(idx, b);
    let signalStrength = (150.0 * st) as i32; // Increased to ensure cascade
    add_resonance_delta(target, signalStrength);
  }
}
```

```assemblyscript
for (let b = 0; b < 4; b++) {
  let target = get_bond_target(idx, b);
  if (target > 0 && target < MAX_ATOMS) {
    let st = get_bond_stiffness(idx, b);
    let signalStrength = (150.0 * st) as i32; // Increased to ensure cascade
    add_resonance_delta(target, signalStrength);
  }
}
```

```

---

## FILE: src/ontology/physics/get_attention_cell.md

```markdown
---
id: get_attention_cell
type: pure_fn
dataType: null
returns: f32
level: 1
args:
  gx: i32
  gy: i32
vars:
  - GRID_W
  - GRID_H
  - ATTENTION_FIELD_OFF
description: Auto-recovered get_attention_cell
deps:
  - GRID_METRICS
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
```

```assemblyscript
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
```

```

---

## FILE: src/ontology/physics/get_genome_velocity_x.md

```markdown
---
id: get_genome_velocity_x
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  idx: i32
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_logic_byte
description: Auto-recovered get_genome_velocity_x
---

---
---

```rust
unimplemented!()
```

```typescript
let vx: i32 = 0;
for (let b = 0; b < 2; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vx;
```

```assemblyscript
let vx: i32 = 0;
for (let b = 0; b < 2; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vx;
```

```

---

## FILE: src/ontology/physics/get_genome_velocity_y.md

```markdown
---
id: get_genome_velocity_y
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  idx: i32
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - get_logic_byte
description: Auto-recovered get_genome_velocity_y
---

---
---

```rust
unimplemented!()
```

```typescript
let vy: i32 = 0;
for (let b = 2; b < 4; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vy += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vy += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vy;
```

```assemblyscript
let vy: i32 = 0;
for (let b = 2; b < 4; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vy += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vy += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vy;
```

```

---

## FILE: src/ontology/physics/get_glyph_influence.md

```markdown
---
id: get_glyph_influence
type: pure_fn
dataType: null
returns: f32
level: 1
args:
  gx: i32
  gy: i32
  role: u8
vars:
  - GRID_W
  - GRID_H
  - GLYPH_HEADER_OFF
  - ROLE_PARASITE
  - ROLE_GUARDIAN
  - ROLE_ARCHITECT
description: Auto-recovered get_glyph_influence
deps:
  - SYSTEM_CONSTANTS
  - GRID_METRICS
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
const cell = gy * GRID_W + gx;
const header = atomic.load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
const kind = header & 0xFF;
const amplitude = ((header >>> 8) & 0x00FFFFFF) as f32;
if (amplitude <= 0.0) return 0.0;
const normalized = amplitude / 256.0;

if (kind == 1) { // pheromone packet
  if (role == ROLE_PARASITE) return -normalized * 0.8;
  if (role == ROLE_GUARDIAN) return normalized * 0.4;
  if (role == ROLE_ARCHITECT) return normalized * 0.2;
  return normalized * 0.9;
}

if (kind == 2) { // plasmid packet
  if (role == ROLE_GUARDIAN) return -normalized * 0.45;
  if (role == ROLE_ARCHITECT) return -normalized * 0.2;
  if (role == ROLE_PARASITE) return normalized * 0.75;
  return normalized * 0.3;
}

return 0.0;
```

```assemblyscript
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
const cell = gy * GRID_W + gx;
const header = atomic.load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
const kind = header & 0xFF;
const amplitude = ((header >>> 8) & 0x00FFFFFF) as f32;
if (amplitude <= 0.0) return 0.0;
const normalized = amplitude / 256.0;

if (kind == 1) { // pheromone packet
  if (role == ROLE_PARASITE) return -normalized * 0.8;
  if (role == ROLE_GUARDIAN) return normalized * 0.4;
  if (role == ROLE_ARCHITECT) return normalized * 0.2;
  return normalized * 0.9;
}

if (kind == 2) { // plasmid packet
  if (role == ROLE_GUARDIAN) return -normalized * 0.45;
  if (role == ROLE_ARCHITECT) return -normalized * 0.2;
  if (role == ROLE_PARASITE) return normalized * 0.75;
  return normalized * 0.3;
}

return 0.0;
```

```

---

## FILE: src/ontology/physics/publish_build_intent.md

```markdown
---
id: publish_build_intent
type: pure_fn
dataType: null
returns: void
level: 1
args:
  ownerAtomIdx: i32
  cellIdx: i32
  buildValue: i32
vars:
  - STRUCTURE_INTENT_SPIN_LIMIT
  - STRUCTURE_INTENT_LOCK_BIT
  - STRUCTURE_INTENT_OWNER_MASK
  - STRUCTURE_BUILD_OWNER_OFF
  - STRUCTURE_BUILD_VALUE_OFF
description: Auto-recovered publish_build_intent
deps:
  - SYSTEM_CONSTANTS
  - OMEGA_MEMORY_LAYOUT
---

---
---

```rust
unimplemented!()
```

```typescript
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const ownerToken = ownerAtomIdx + 1;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const snapshot = atomic.load<i32>(ownerPtr);
  if ((snapshot & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  const winningOwner = snapshot & STRUCTURE_INTENT_OWNER_MASK;
  if (ownerToken < winningOwner) return;

  const observed = atomic.cmpxchg<i32>(
    ownerPtr,
    snapshot,
    snapshot | STRUCTURE_INTENT_LOCK_BIT,
  );
  if (observed != snapshot) continue;

  atomic.store<i32>(valuePtr, buildValue);
  // Release lock + set winner
  atomic.store<i32>(ownerPtr, ownerToken);
  return;
}
```

```assemblyscript
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const ownerToken = ownerAtomIdx + 1;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const snapshot = atomic.load<i32>(ownerPtr);
  if ((snapshot & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  const winningOwner = snapshot & STRUCTURE_INTENT_OWNER_MASK;
  if (ownerToken < winningOwner) return;

  const observed = atomic.cmpxchg<i32>(
    ownerPtr,
    snapshot,
    snapshot | STRUCTURE_INTENT_LOCK_BIT,
  );
  if (observed != snapshot) continue;

  atomic.store<i32>(valuePtr, buildValue);
  // Release lock + set winner
  atomic.store<i32>(ownerPtr, ownerToken);
  return;
}
```

```

---

## FILE: src/ontology/physics/publish_charge_intent.md

```markdown
---
id: publish_charge_intent
type: pure_fn
dataType: null
returns: void
level: 1
args:
  cellIdx: i32
  requestedCharge: i32
vars:
  - STRUCTURE_CHARGE_INTENT_OFF
  - STRUCTURE_INTENT_SPIN_LIMIT
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - fast_max
description: Auto-recovered publish_charge_intent
---

---
---

```rust
unimplemented!()
```

```typescript
const ptr = STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize;
let charge = requestedCharge;
charge = fast_max(charge, 0);
if (charge > 255) charge = 255;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const current = atomic.load<i32>(ptr);
  if (charge <= current) return;
  const observed = atomic.cmpxchg<i32>(ptr, current, charge);
  if (observed == current) return;
}
```

```assemblyscript
const ptr = STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize;
let charge = requestedCharge;
charge = fast_max(charge, 0);
if (charge > 255) charge = 255;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const current = atomic.load<i32>(ptr);
  if (charge <= current) return;
  const observed = atomic.cmpxchg<i32>(ptr, current, charge);
  if (observed == current) return;
}
```

```

---

## FILE: src/ontology/physics/read_structure_cell.md

```markdown
---
id: read_structure_cell
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  cellIdx: i32
vars:
  - STRUCTURE_BUILD_OWNER_OFF
  - STRUCTURE_BUILD_VALUE_OFF
  - STRUCTURE_GRID_OFF
  - STRUCTURE_INTENT_SPIN_LIMIT
  - STRUCTURE_INTENT_LOCK_BIT
  - STRUCTURE_INTENT_OWNER_MASK
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
description: Auto-recovered read_structure_cell
---

---
---

```rust
unimplemented!()
```

```typescript
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const gridPtr = STRUCTURE_GRID_OFF + (cellIdx << 2) as usize;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const ownerRaw = atomic.load<i32>(ownerPtr);
  if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  if ((ownerRaw & STRUCTURE_INTENT_OWNER_MASK) != 0) {
    return atomic.load<i32>(valuePtr);
  }
  return atomic.load<i32>(gridPtr);
}

// Stale lock fallback: preserve forward progress under adversarial contention.
return atomic.load<i32>(gridPtr);
```

```assemblyscript
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const gridPtr = STRUCTURE_GRID_OFF + (cellIdx << 2) as usize;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const ownerRaw = atomic.load<i32>(ownerPtr);
  if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  if ((ownerRaw & STRUCTURE_INTENT_OWNER_MASK) != 0) {
    return atomic.load<i32>(valuePtr);
  }
  return atomic.load<i32>(gridPtr);
}

// Stale lock fallback: preserve forward progress under adversarial contention.
return atomic.load<i32>(gridPtr);
```

```

---

## FILE: src/ontology/physics/read_structure_charge.md

```markdown
---
id: read_structure_charge
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  cellIdx: i32
vars:
  - STRUCTURE_CHARGE_INTENT_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - read_structure_cell
description: Auto-recovered read_structure_charge
---

---
---

```rust
unimplemented!()
```

```typescript
const cellVal = read_structure_cell(cellIdx);
const baseCharge = (cellVal >> 16) & 0xFF;
const intentCharge = atomic.load<i32>(
  STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
);
return intentCharge > baseCharge ? intentCharge : baseCharge;
```

```assemblyscript
const cellVal = read_structure_cell(cellIdx);
const baseCharge = (cellVal >> 16) & 0xFF;
const intentCharge = atomic.load<i32>(
  STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
);
return intentCharge > baseCharge ? intentCharge : baseCharge;
```

```

---

## FILE: src/ontology/physics/reduce_atom_deltas.md

```markdown
---
id: reduce_atom_deltas
type: pure_fn
dataType: null
returns: void
level: 1
args:
  startIdx: i32
  endIdx: i32
vars:
  - ENERGY_DELTA_OFF
  - ENERGY_OFFSET
  - RESONANCE_DELTA_OFF
  - RESONANCE_OFFSET
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - clamp_resource
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  let start = startIdx;
  let end = endIdx;
  if (start < 0) start = 0;
  if (end > MAX_ATOMS) end = MAX_ATOMS;
  if (start >= end) return;

  for (let idx = start; idx < end; idx++) {
    const deltaOff = (idx << 2) as usize;

    const de = atomic.load<i32>(ENERGY_DELTA_OFF + deltaOff);
    if (de != 0) {
      atomic.store<i32>(ENERGY_DELTA_OFF + deltaOff, 0);
      const nextEnergy = (atomic.load<i32>(ENERGY_OFFSET + deltaOff) as i64) +
        (de as i64);
      atomic.store<i32>(ENERGY_OFFSET + deltaOff, clamp_resource(nextEnergy));
    }

    const dr = atomic.load<i32>(RESONANCE_DELTA_OFF + deltaOff);
    if (dr != 0) {
      atomic.store<i32>(RESONANCE_DELTA_OFF + deltaOff, 0);
      const nextRes = (atomic.load<i32>(RESONANCE_OFFSET + deltaOff) as i64) +
        (dr as i64);
      atomic.store<i32>(RESONANCE_OFFSET + deltaOff, clamp_resource(nextRes));
    }
  }
```

```

---

## FILE: src/ontology/physics/resolve_bond_requests.md

```markdown
---
id: resolve_bond_requests
type: pure_fn
dataType: null
returns: void
level: 1
args:
  start: i32
  end: i32
vars:
  - BOND_REQUESTS_OFFSET
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - set_bond_target
  - set_bond_stiffness
  - get_bond_target
description: Auto-recovered resolve_bond_requests
---

---
---

```rust
unimplemented!()
```

```typescript
let resolved: i32 = 0;
for (let i = start; i < end; i++) {
  const ptr = BOND_REQUESTS_OFFSET + (i * 12) as usize;
  const initiatorPlus1 = atomic.load<i32>(ptr);
  if (initiatorPlus1 == 0) continue;

  if (atomic.load<i32>(ptr + 8) != 1) { // Not active
    atomic.store<i32>(ptr, 0);
    continue;
  }

  const targetPlus1 = atomic.load<i32>(ptr + 4);
  const initiator = initiatorPlus1 - 1;
  const target = targetPlus1 - 1;

  if (target >= 0 && target < MAX_ATOMS) {
    // trace_atom(initiator, 0xBB, target, 0, resolved);
    set_bond_target(initiator, 0, target);
    set_bond_stiffness(initiator, 0, 0.1);
    set_bond_target(target, 1, initiator);
    set_bond_stiffness(target, 1, 0.1);
    // trace_atom(initiator, 0xCC, get_bond_target(initiator, 0), 0, 0);
    resolved++;
  }

  // Clear request
  atomic.store<i32>(ptr, 0);
  atomic.store<i32>(ptr + 4, 0);
  atomic.store<i32>(ptr + 8, 0);
}
// trace_atom(888, 0xEE, resolved, 0, 0);
return resolved;
```

```assemblyscript
let resolved: i32 = 0;
for (let i = start; i < end; i++) {
  const ptr = BOND_REQUESTS_OFFSET + (i * 12) as usize;
  const initiatorPlus1 = atomic.load<i32>(ptr);
  if (initiatorPlus1 == 0) continue;

  if (atomic.load<i32>(ptr + 8) != 1) { // Not active
    atomic.store<i32>(ptr, 0);
    continue;
  }

  const targetPlus1 = atomic.load<i32>(ptr + 4);
  const initiator = initiatorPlus1 - 1;
  const target = targetPlus1 - 1;

  if (target >= 0 && target < MAX_ATOMS) {
    // trace_atom(initiator, 0xBB, target, 0, resolved);
    set_bond_target(initiator, 0, target);
    set_bond_stiffness(initiator, 0, 0.1);
    set_bond_target(target, 1, initiator);
    set_bond_stiffness(target, 1, 0.1);
    // trace_atom(initiator, 0xCC, get_bond_target(initiator, 0), 0, 0);
    resolved++;
  }

  // Clear request
  atomic.store<i32>(ptr, 0);
  atomic.store<i32>(ptr + 4, 0);
  atomic.store<i32>(ptr + 8, 0);
}
// trace_atom(888, 0xEE, resolved, 0, 0);
return resolved;
```

```

---

## FILE: src/ontology/physics/tick_environment.md

```markdown
---
id: tick_environment
type: pure_fn
dataType: null
returns: void
level: 2
args:
  tick: i32
vars:
  - GRID_CELLS
  - ATTENTION_FIELD_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - tick_structure_grid
  - diffuse_viral_semantics
  - glyph_transport
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  // 1. Attention Field Decay (90% per tick)
  for (let i = 0; i < (GRID_CELLS as i32); i++) {
    const ptr = ATTENTION_FIELD_OFF + (i << 2) as usize;
    const val = load<f32>(ptr);
    if (val > 0.0) {
      store<f32>(ptr, val * 0.9);
    }
  }

  // 2. Structural Decay & Autopoiesis
  tick_structure_grid();

  // 3. Viral Semantic Diffusion
  diffuse_viral_semantics(tick);

  // 4. Pheromone / Plasmid Diffusion
  glyph_transport(tick);
```

```

---

## FILE: src/ontology/physics/tick_structure_grid.md

```markdown
---
id: tick_structure_grid
type: pure_fn
dataType: null
returns: void
level: 1
args: {}
vars:
  - GRID_H
  - GRID_W
  - STRUCTURE_GRID_OFF
  - STRUCTURE_BUILD_OWNER_OFF
  - STRUCTURE_BUILD_VALUE_OFF
  - STRUCTURE_CHARGE_INTENT_OFF
  - STR_VOID
  - STR_WIRE
  - STR_SOURCE
  - STR_NODE
  - STR_CAPACITOR
  - STR_DIODE
  - STR_INVERTER
  - STR_LATCH
  - SPATIAL_GRID_OFFSET
  - SIGNAL_GRID_OFF
  - MEMORY_GRID_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - dir8_x
  - dir8_y
  - dir4_x
  - dir4_y
  - in_grid
  - trace_atom
  - read_structure_charge
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  const STRUCTURE_INTENT_OWNER_MASK: i32 = 0x7FFFFFFF;

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const i = y * GRID_W + x;
      const cellPtr = STRUCTURE_GRID_OFF + (i << 2) as usize;
      const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (i << 2) as usize;
      const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (i << 2) as usize;
      const chargeIntentPtr = STRUCTURE_CHARGE_INTENT_OFF + (i << 2) as usize;

      let cellVal = atomic.load<i32>(cellPtr);
      const ownerRaw = atomic.load<i32>(ownerPtr);
      const owner = ownerRaw & STRUCTURE_INTENT_OWNER_MASK;
      if (owner != 0) {
        cellVal = atomic.load<i32>(valuePtr);
      }
      const intentChargeRaw = atomic.load<i32>(chargeIntentPtr);
      if (intentChargeRaw > 0) {
        let intentCharge = intentChargeRaw;
        if (intentCharge > 255) intentCharge = 255;
        const baseCharge = (cellVal >> 16) & 0xFF;
        if (intentCharge > baseCharge) {
          cellVal = (cellVal & ~0x00FF0000) | (intentCharge << 16);
        }
      }
      if (ownerRaw != 0 || intentChargeRaw != 0) {
        atomic.store<i32>(cellPtr, cellVal);
        if (ownerRaw != 0) {
          atomic.store<i32>(ownerPtr, 0);
          atomic.store<i32>(valuePtr, 0);
        }
        if (intentChargeRaw != 0) {
          atomic.store<i32>(chargeIntentPtr, 0);
        }
      }

      let type = cellVal & 0xFF;
      let currentCharge = (cellVal >> 16) & 0xFF;

      // --- AUTOPOIESIS: Spontaneous Crystallization ---
      if (type == STR_VOID) {
        let maxNCharge: i32 = currentCharge;
        for (let n = 0; n < 8; n++) {
          let nx = x + dir8_x(n);
          let ny = y + dir8_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            const nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2) as usize);
            const nCharge = (nVal >> 16) & 0xFF;
            if (nCharge > maxNCharge) maxNCharge = nCharge;
          }
        }
        if (maxNCharge > 100) {
          let seedCharge = maxNCharge - 20;
          if (seedCharge < 64) seedCharge = 64;
          if (seedCharge > 255) seedCharge = 255;
          atomic.store<i32>(
            STRUCTURE_GRID_OFF + (i << 2) as usize,
            STR_WIRE | (seedCharge << 16),
          );
          // Trace only the first few to avoid flood
          if (i == 5670) {
            trace_atom(i, 0x378, maxNCharge, 1, 1);
          }
        } else if (currentCharge > 0) {
          const decayed = currentCharge > 8 ? currentCharge - 8 : 0;
          atomic.store<i32>(
            STRUCTURE_GRID_OFF + (i << 2) as usize,
            (cellVal & ~0x00FF0000) | (decayed << 16),
          );
        }
        continue;
      }

      const state = (cellVal >> 24) & 0xFF;

      // AUTOPOIESIS: Resonance Shielding
      // Read average phase from spatial grid average slot (slot 31)
      let spatialIdx = y * GRID_W + x;
      let avgPhase = atomic.load<i32>(
        SPATIAL_GRID_OFFSET + (spatialIdx << 7) + (31 << 2) as usize,
      );

      let decay = 10;
      if (avgPhase > 128) decay = 2; // Shielded

      let nextCharge = currentCharge > decay ? currentCharge - decay : 0;

      // --- ERA 34: Structural Memory Leakage ---
      // If density is low but not yet zero, leak memory logic into signal grid.
      if (nextCharge > 0 && nextCharge < 50) {
        const memoryPtr = MEMORY_GRID_OFF + (i << 3) as usize;
        const gridIdx = i * 9;
        const targetSignalOff = SIGNAL_GRID_OFF + (gridIdx as usize);

        for (let b: usize = 0; b < 8; b++) {
          const logicByte = load<u8>(memoryPtr + b);
          if (logicByte != 0) {
            atomic.store<u8>(targetSignalOff + b, logicByte);
          }
        }
        // Set intensity (byte 8 of the 9-byte viral/signal cell)
        atomic.store<u8>(targetSignalOff + 8, (50 - nextCharge) as u8);
      }

      if (nextCharge == 0) {
        // Clear memory if structure is gone
        const memoryPtr = MEMORY_GRID_OFF + (i << 3) as usize;
        store<u64>(memoryPtr, 0);
      }

      if (type == STR_SOURCE) {
        nextCharge = 255;
      } else if (
        type == STR_WIRE || type == STR_NODE || type == STR_CAPACITOR
      ) {
        let maxNeighborCharge: i32 = 0;
        let chargedCount: i32 = 0;

        for (let n = 0; n < 4; n++) {
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
            if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
            if (nCharge > 50) chargedCount++;
          }
        }

        if (type == STR_WIRE) {
          let flow = maxNeighborCharge - 5;
          if (flow > nextCharge) nextCharge = flow;
        } else if (type == STR_NODE) {
          if (state == 1) { // AND
            if (chargedCount >= 2) nextCharge = 255;
          } else { // OR
            if (chargedCount >= 1) nextCharge = 255;
          }
        } else if (type == STR_CAPACITOR) {
          let flow = maxNeighborCharge - 2;
          if (flow > nextCharge) nextCharge = flow;
        }
      } else if (type == STR_DIODE) {
        // direction = state (0:L, 1:R, 2:U, 3:D)
        let nx = x;
        let ny = y;
        if (state == 0) nx--;
        else if (state == 1) nx++;
        else if (state == 2) ny--;
        else if (state == 3) ny++;

        if (in_grid(nx, ny)) {
          let ni = ny * GRID_W + nx;
          let nCharge = read_structure_charge(ni);
          let flow = nCharge - 5;
          if (flow > nextCharge) nextCharge = flow;
        }
      } else if (type == STR_INVERTER) {
        let maxNeighborCharge: i32 = 0;
        for (let n = 0; n < 4; n++) {
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
            if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
          }
        }
        if (maxNeighborCharge < 50) nextCharge = 255;
        else nextCharge = 0;
      } else if (type == STR_LATCH) {
        let newState = state;
        // n=0 (Left): SET
        let setX = x + dir4_x(0);
        let setY = y + dir4_y(0);
        if (in_grid(setX, setY)) {
          if (read_structure_charge(setY * GRID_W + setX) > 100) newState = 1;
        }
        // n=1 (Right): RESET
        let rstX = x + dir4_x(1);
        let rstY = y + dir4_y(1);
        if (in_grid(rstX, rstY)) {
          if (read_structure_charge(rstY * GRID_W + rstX) > 100) newState = 0;
        }
        if (newState != state) {
          cellVal = (cellVal & 0x00FFFFFF) | (newState << 24);
        }
        if (newState == 1) nextCharge = 255;
        else nextCharge = 0;
      }

      if (type != STR_SOURCE && nextCharge == 0) {
        let stabilized = false;
        for (let n = 0; n < 4; n++) {
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
            if (nCharge > 15) {
                stabilized = true;
                break;
            }
          }
        }

        if (stabilized) {
            nextCharge = decay;
        } else {
            type = STR_VOID;
        }
      }

      const nextVal = type | (nextCharge << 16) | (state << 24);
      if (nextVal != cellVal) {
        atomic.store<i32>(cellPtr, nextVal);
      }
    }
  }
```

```

---

## FILE: src/ontology/spatial/clamp_world_x.md

```markdown
---
id: clamp_world_x
type: pure_fn
description: "Constrain an X coordinate to the absolute global bounds"
deps: 
  - GRID_METRICS
  - math_clamp
vars:
  - WORLD_MAX_X
  - math_clamp
args:
  x: i32
returns: i32
tests:
  - [-5, 0]
---

### Rust
```rust
math_clamp(x, 0, WORLD_MAX_X)
```

### TypeScript
```typescript
return math_clamp(x, 0, WORLD_MAX_X);
```

### AssemblyScript
```assemblyscript
return math_clamp(x, 0, WORLD_MAX_X);
```

```

---

## FILE: src/ontology/spatial/clamp_world_y.md

```markdown
---
id: clamp_world_y
type: pure_fn
description: "Constrain a Y coordinate to the absolute global bounds"
deps: 
  - GRID_METRICS
  - math_clamp
vars:
  - WORLD_MAX_Y
  - math_clamp
args:
  y: i32
returns: i32
tests:
  - [-5, 0]
---

### Rust
```rust
math_clamp(y, 0, WORLD_MAX_Y)
```

### TypeScript
```typescript
return math_clamp(y, 0, WORLD_MAX_Y);
```

### AssemblyScript
```assemblyscript
return math_clamp(y, 0, WORLD_MAX_Y);
```

```

---

## FILE: src/ontology/spatial/dir4_x.md

```markdown
---
id: dir4_x
type: pure_fn
description: "Resolve cardinal X-axis direction (-1, 0, 1) from 4-way compass index: 0=West, 1=East"
deps: []
args:
  n: i32
returns: i32
tests:
  - [0, -1]
  - [1, 1]
  - [2, 0]
  - [3, 0]
---

### Rust
```rust
if n == 0 {
    -1
} else if n == 1 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 0) return -1;
if (n == 1) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 0) return -1;
if (n == 1) return 1;
return 0;
```

```

---

## FILE: src/ontology/spatial/dir4_y.md

```markdown
---
id: dir4_y
type: pure_fn
description: "Resolve cardinal Y-axis direction (-1, 0, 1) from 4-way compass index: 2=North, 3=South"
deps: []
args:
  n: i32
returns: i32
tests:
  - [0, 0]
  - [1, 0]
  - [2, -1]
  - [3, 1]
---

### Rust
```rust
if n == 2 {
    -1
} else if n == 3 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 2) return -1;
if (n == 3) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 2) return -1;
if (n == 3) return 1;
return 0;
```

```

---

## FILE: src/ontology/spatial/dir8_x.md

```markdown
---
id: dir8_x
type: pure_fn
description: "Resolve X-axis direction (-1, 0, 1) from 8-way compass index: 0=NW, 1=NE, 2=N, 3=S, 4=W, 5=E, 6=SW, 7=SE"
deps: []
args:
  n: i32
returns: i32
tests:
  - [0, -1]
  - [1, 1]
  - [2, 0]
  - [3, 0]
---

### Rust
```rust
if n == 0 || n == 4 || n == 6 {
    -1
} else if n == 1 || n == 5 || n == 7 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 0 || n == 4 || n == 6) return -1;
if (n == 1 || n == 5 || n == 7) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 0 || n == 4 || n == 6) return -1;
if (n == 1 || n == 5 || n == 7) return 1;
return 0;
```

```

---

## FILE: src/ontology/spatial/dir8_y.md

```markdown
---
id: dir8_y
type: pure_fn
description: "Resolve Y-axis direction (-1, 0, 1) from 8-way compass index"
deps: []
args:
  n: i32
returns: i32
tests:
  - [2, -1]
  - [4, -1]
  - [5, -1]
  - [3, 1]
  - [6, 1]
  - [7, 1]
---

### Rust
```rust
if n == 2 || n == 4 || n == 5 {
    -1
} else if n == 3 || n == 6 || n == 7 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 2 || n == 4 || n == 5) return -1;
if (n == 3 || n == 6 || n == 7) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 2 || n == 4 || n == 5) return -1;
if (n == 3 || n == 6 || n == 7) return 1;
return 0;
```

```

---

## FILE: src/ontology/spatial/in_grid.md

```markdown
---
id: in_grid
type: pure_fn
description: "Verify if provided coordinates fall within the topological cell grid bounds"
deps: 
  - SYSTEM_CONSTANTS
vars:
  - GRID_W
  - GRID_H
args:
  x: i32
  y: i32
returns: boolean
tests:
  - [-1, 5, false]
  - [5, -1, false]
---

### Rust
```rust
x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
```

### TypeScript
```typescript
return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
```

### AssemblyScript
```assemblyscript
return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
```

```

---

## FILE: src/ontology/spatial/store_clamped_pos.md

```markdown
---
id: store_clamped_pos
type: pure_fn
description: "Store an atom's physical coordinates directly into shared memory with strict bounding enforcement"
deps: 
  - OMEGA_MEMORY_LAYOUT
  - clamp_world_x
  - clamp_world_y
vars:
  - XS_OFFSET
  - YS_OFFSET
  - clamp_world_x
  - clamp_world_y
args:
  idx: i32
  x: i32
  y: i32
returns: void
---

### Rust
```rust
// Requires mutable pointer to the SharedArray lattice not naturally bound to pure_fns yet.
// TODO: Extend DAG to inject &mut [i8] for memory mutating commands.
()
```

### TypeScript
```typescript
/*
This function mutates shared WASM buffer memory and assumes 'store<i16>' exists in the execution environment window.
AssemblyScript exports are intended to run natively. In Deno TS contexts this is ignored.
*/
return;
```

### AssemblyScript
```assemblyscript
store<i16>(XS_OFFSET + (<usize>idx << 1), <i16>clamp_world_x(x));
store<i16>(YS_OFFSET + (<usize>idx << 1), <i16>clamp_world_y(y));
```

```

---

