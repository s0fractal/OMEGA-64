# OMEGA-64 | ARCHITECTURE LORE (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-13T14:13:22.610Z*
*Exported Files in Category: 106*
*Total Exported Files: 493*
*Runtime Roots: 10*
*Runtime Closure Files: 318*
*Non-Runtime Code Files: 69*
*Runtime-Support Code Files: 10*
*Experimental Code Files: 59*
*Manifest SHA256: 39b9ee6963a688da2ecdc24e66b2f51b41a8b035978a4bc3a418688653156c74*
*Export Set SHA256: edabd03000eb576e1659081cca04b5998d8daedd01a5a977073859225d9277f5*
*Export Content SHA256: ad6e427053753de1e1fe52499a804cfbd60a2104297dc70c114f4f61173429d3*
*Git Commit: a3716e81b0c5*

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

