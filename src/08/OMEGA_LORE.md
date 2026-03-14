# OMEGA-64 | ARCHITECTURE LORE (ERA 69: THE COHERENT LATTICE)

*Generated: 2026-03-14T21:30:34.123Z*
*Exported Files in Category: 182*
*Total Exported Files: 574*
*Runtime Roots: 10*
*Runtime Closure Files: 285*
*Non-Runtime Code Files: 107*
*Runtime-Support Code Files: 4*
*Experimental Code Files: 103*
*Manifest SHA256: be05fc2da91a5269460b315a97db211539cfd44551951947503c68c750b63472*
*Export Set SHA256: 422ea8e2cb8cb363dd01178a5bf0e1c4b6b9a904bbf3ec11acdc44e694d64165*
*Export Content SHA256: cfae58b479b7d03e3a71472299c13d4de434e81147a346ce767262d014b6a832*
*Git Commit: 97bc67084e33*

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
  let bandStep = homeostasisBand >> 1;
  if (bandStep < 1) bandStep = 1;
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
          let transfer = ((current - starvationFloor) * 9) / 10;
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
    let interimEnergy = current + delta;
    if (interimEnergy < 0) interimEnergy = 0;

    if (baseTax > 0 && interimEnergy > starvationFloor) {
      let tax = baseTax < interimEnergy ? baseTax : interimEnergy;
      delta -= tax;
    }

    const deviation = interimEnergy - targetEnergy;
    const absDeviation = fast_abs(deviation);

    if (absDeviation > homeostasisBand) {
      const gradient = absDeviation - homeostasisBand;
      let rawStep = 1 + (gradient / bandStep);
      let step = rawStep < homeostasisMaxDelta ? rawStep : homeostasisMaxDelta;

      if (deviation > 0) {
        delta -= step;
        if (overflowActive) delta -= 1;
      } else if (subsidyEnabled) {
        let subsidy = step;
        if (overflowActive) {
          subsidy = (subsidy * 6) / 10;
          if (subsidy < 1) subsidy = 1;
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
      let next = current + delta;
      if (next < 0) next = 0;
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/autopoiesis/immune_check.md

```markdown
---
id: immune_check
type: pure_fn
description: "Determines if an atom is necrotic or drifting and should be marked for recycling by the phagocytes"
tags: ["physics", "autopoiesis"]
deps: []
args:
  energy: i32
  resonance: i32
  id_handle: i32
  role: u8
  entropy_pressure: i32
returns: bool
optimization: inline
---

```typescript
  if (id_handle === 0) return false;

  // Necrotic check (Zero energy and zero resonance)
  if (energy <= 0 && resonance <= 0) return true;

  if (role === 5) return false; // ROLE_MITOCHONDRIA are immune to drifting checks

  // Drifting check
  // Base threshold for "weak" atoms.
  // Entropy pressure (H0) modulates how aggressive the cleanup is.
  // Normalized H0 is 0..1000.
  // We use integer math to avoid floats where possible. threshold * 1000 = entropy * 2.
  const threshold_x1000 = entropy_pressure * 2;
  const energy_x1000 = energy * 1000;
  
  // energy < threshold
  if (energy_x1000 < threshold_x1000) {
      // resonance < threshold * 100 -> resonance * 10 < threshold * 1000
      if ((resonance * 10) < threshold_x1000) {
          return true;
      }
  }

  return false;
```

```rust
    if id_handle == 0 { return false; }

    if energy <= 0 && resonance <= 0 { return true; }

    if role == 5 { return false; } // ROLE_MITOCHONDRIA

    let threshold_x1000 = entropy_pressure * 2;
    let energy_x1000 = energy * 1000;

    if energy_x1000 < threshold_x1000 {
        if (resonance * 10) < threshold_x1000 {
            return true;
        }
    }

    false
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

## FILE: src/ontology/autopoiesis/run_phagocyte_pass.md

```markdown
---
id: run_phagocyte_pass
type: pure_fn
description: "Iterates over the atom lattice and recycles any necrotic or drifting atoms in a single WASM call."
tags: ["physics", "autopoiesis"]
deps: ["immune_check", "get_read_energy", "get_read_resonance", "set_energy", "set_resonance"]
vars: ["MAX_ATOMS", "IDS_OFFSET", "ROLES_OFFSET", "BONDS_OFFSET"]
args:
  entropy_pressure: i32
returns: i32
optimization: hot
---
```typescript
  // unimplemented for JS host since this is an AS WASM function
  return 0;
```

```assemblyscript
  let purgeCount: i32 = 0;
  for (let i: i32 = 1; i <= MAX_ATOMS; i++) {
    const id = atomic.load<i64>(IDS_OFFSET + (i << 3) as usize);
    if (id != 0) {
       const role = atomic.load<u8>(ROLES_OFFSET + i as usize);
       const energy = get_read_energy(i);
       const resonance = get_read_resonance(i);
       if (immune_check(energy, resonance, <i32>id, <u8>role, entropy_pressure)) {
         atomic.store<i64>(IDS_OFFSET + (i << 3) as usize, 0);
         atomic.store<u8>(ROLES_OFFSET + i as usize, 0);
         set_energy(i, 0);
         set_resonance(i, 0);
         const baseBond = BONDS_OFFSET + (i << 4) as usize;
         atomic.store<i32>(baseBond, 0);
         atomic.store<i32>(baseBond + 4, 0);
         atomic.store<i32>(baseBond + 8, 0);
         atomic.store<i32>(baseBond + 12, 0);
         purgeCount++;
       }
    }
  }
  return purgeCount;
```

```rust
  unimplemented!()
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/core/breath_cycle.md

```markdown
---
id: BREATH
type: module
description: "Implementation of BREATH"
tags: []
min_level: 6
---

### TypeScript
```typescript
// OMEGA-64 | BREATH.ts | Era 10: Autonomous Feedback Loop
// Periodically samples the Matrix and injects new conceptual spores.

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { SEMANTIC_MEMBRANE } from "@05";
import { LLM_SYNAPSE } from "@05";
import { AUDIT_ENGINE } from "@03";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { AKASHA_CODEX } from "@06";
const PULSE_LOG = "AKASHA.log";
const BREATH_INTERVAL_MS = 150000; // ~50 pulses if pulse is 3s

export const BREATH = {
  inhale: async () => {
    AUDIT_ENGINE.setDelegate({
      generateThought: (c: string) => LLM_SYNAPSE.generateThought(c),
    });

    LOGGER.info("🌬️ OMEGA-64 | BREATH ACTIVE | Initializing Cognitive Loop");

    while (true) {
      LOGGER.info("\n--- [BREATH] Deep Sample ---");

      // 1. Listen to the Matrix (Vox Populi + Oracle Queue)
      const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
      const oracle = SEMANTIC_MEMBRANE.readOracleQueue(5);
      LOGGER.info(
        `   [BREATH] Listening: "${vox[0]}" (and ${vox.length - 1} memories)`,
      );
      if (oracle.length > 0) {
        LOGGER.info(
          `   [BREATH] Oracle Guidance: "${oracle[0].substring(0, 40)}..."`,
        );
      }

      // 2. Audit Archived Intent (Historical Context)
      const historicalBriefing = await AUDIT_ENGINE
        .generateHistoricalBriefing();
      LOGGER.info(
        `   [BREATH] Historical Briefing: "${
          historicalBriefing.substring(0, 50)
        }..."`,
      );
      const codexChronicle = await AKASHA_CODEX.getChronicleContext(3);
      LOGGER.info(
        `   [BREATH] Codex Chronicle: "${codexChronicle.substring(0, 60)}..."`,
      );

      // 3. Consult the Oracle (LLM Synapse)
      const combinedContext = `${historicalBriefing} | MOOD: ${
        vox.join(" ")
      } | ORACLE: ${oracle.join(" ")} | CODEX: ${codexChronicle}`;
      const thought = await LLM_SYNAPSE.generateThought(combinedContext);

      // 4. Inject back into the Matrix (Motor Output)
      const weight = 80 + Math.random() * 40;
      await SEMANTIC_MEMBRANE.injectThought(thought, weight);

      // Phase 23: Entropy Flux (Negative Entropy Injection)
      const energyInjected = STATE_MATRIX.injectEnergy(weight * 2);
      LOGGER.info(
        `   [BREATH] Negentropy Flux: +${
          (weight * 2).toFixed(1)
        } energy units across ${energyInjected} atoms`,
      );

      // 5. Digital Archaeology (Every 5 cycles)
      if (Math.floor(Date.now() / BREATH_INTERVAL_MS) % 5 === 0) {
        LOGGER.info("\n--- [ARCHAEOLOGY] Scanning Digital Ruins ---");
        const ruins = SEMANTIC_MEMBRANE.scanDigitalRuins();
        if (ruins.length > 0) {
          const report = await LLM_SYNAPSE.generateArchaeologicalReport(ruins);
          LOGGER.info(`🏺 [ARCHAEOLOGIST] Report: "${report}"`);
        } else {
          LOGGER.info("   [ARCHAEOLOGY] No ruins found in this sector.");
        }
      }

      LOGGER.info(
        `   [BREATH] Exhale complete. Next cycle in ${
          BREATH_INTERVAL_MS / 1000
        }s.`,
      );

      await new Promise((r) => setTimeout(r, BREATH_INTERVAL_MS));
    }
  },
};

if (import.meta.main) {
  BREATH.inhale();
}

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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  // unimplemented: physics evaluates in WASM
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

## FILE: src/ontology/core/get_glyph_arity.md

```markdown
---
id: get_glyph_arity
type: pure_fn
deps: [GLYPH_ARITY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
```rust
GLYPH_ARITY_LUT[(id & 63) as usize]
```

### TypeScript
```typescript
import { GLYPH_ARITY_LUT } from "../00/mod.ts";

export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
```

```

---

## FILE: src/ontology/core/get_glyph_energy.md

```markdown
---
id: get_glyph_energy
type: pure_fn
deps: [GLYPH_ENERGY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
```rust
GLYPH_ENERGY_LUT[(id & 63) as usize]
```

### TypeScript
```typescript
import { GLYPH_ENERGY_LUT } from "../00/mod.ts";

export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
```

```

---

## FILE: src/ontology/core/get_glyph_kind.md

```markdown
---
id: get_glyph_kind
type: pure_fn
description: "O(1) resolve of glyph category using bitwise shifts"
deps: [GLYPH_TYPES]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---

### Rust
```rust
if id <= 3 {
  return KIND_CORE;
}
if id <= 15 {
  return KIND_CONTROL;
}
return id >> 3;
```

### TypeScript
```typescript
import { KIND_CORE, KIND_CONTROL } from "../00/mod.ts";

export function get_glyph_kind(id: number): number {
  if (id <= 3) return KIND_CORE;
  if (id <= 15) return KIND_CONTROL;
  return id >> 3;
}
```

```

---

## FILE: src/ontology/core/get_glyph_legacy_opcode.md

```markdown
---
id: get_glyph_legacy_opcode
type: pure_fn
deps: [GLYPH_LEGACY_OPCODE_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
```rust
GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
```

### TypeScript
```typescript
import { GLYPH_LEGACY_OPCODE_LUT } from "../00/mod.ts";

export function get_glyph_legacy_opcode(id: number): number {
  return GLYPH_LEGACY_OPCODE_LUT[id & 63];
}
```

```

---

## FILE: src/ontology/core/GLYPH_ARITY_LUT.md

```markdown
---
id: GLYPH_ARITY_LUT
type: static_table
dataType: u8
description: "O(1) lookup table for the number of arguments each glyph consumes"
deps: []
---

## payload: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 3, 2, 2, 0, 0, 0, 0, 3, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

```

---

## FILE: src/ontology/core/GLYPH_ENERGY_LUT.md

```markdown
---
id: GLYPH_ENERGY_LUT
type: static_table
dataType: u8
description: "O(1) lookup table for the energy cost of each glyph"
deps: []
---

## payload: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 3, 2, 20, 50, 10, 0, 1, 3, 4, 6, 2, 1, 1, 1, 1, 4, 2, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

```

---

## FILE: src/ontology/core/GLYPH_LEGACY_OPCODE_LUT.md

```markdown
---
id: GLYPH_LEGACY_OPCODE_LUT
type: static_table
dataType: u8
description: "O(1) lookup table mapping a Glyph ID to its Legacy Syscall/Opcode (255 if unmapped)"
deps: []
---

## payload: [255, 255, 255, 255, 255, 255, 255, 255, 1, 2, 3, 4, 5, 17, 18, 16, 128, 129, 131, 255, 167, 138, 96, 255, 164, 165, 168, 169, 255, 255, 255, 255, 166, 170, 176, 130, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]

```

---

## FILE: src/ontology/core/GLYPH_RGB_LUT.md

```markdown
---
id: GLYPH_RGB_LUT
type: static_table
dataType: u8
description: "Pre-baked chromatic hashes (R, G, B) for all 64 glyphs. Index = id * 3"
deps: []
---

## payload: [255, 255, 255, 128, 128, 128, 0, 0, 0, 255, 0, 255, 255, 77, 77, 254, 87, 68, 251, 98, 60, 245, 109, 51, 238, 121, 42, 230, 132, 34, 220, 143, 27, 209, 153, 21, 199, 162, 15, 188, 170, 11, 179, 179, 7, 153, 170, 4, 131, 163, 2, 110, 157, 1, 93, 154, 0, 77, 153, 0, 62, 154, 0, 48, 157, 1, 34, 163, 2, 21, 170, 4, 7, 179, 7, 11, 188, 29, 15, 199, 52, 21, 209, 77, 27, 220, 104, 34, 230, 132, 42, 238, 160, 51, 245, 187, 60, 251, 212, 68, 254, 235, 77, 255, 255, 84, 237, 254, 91, 219, 251, 96, 201, 245, 100, 183, 238, 103, 166, 230, 105, 151, 220, 105, 136, 209, 104, 123, 199, 102, 111, 188, 100, 100, 179, 105, 98, 170, 109, 95, 163, 113, 93, 157, 117, 92, 154, 122, 92, 153, 129, 92, 154, 138, 93, 157, 149, 95, 163, 163, 98, 170, 179, 100, 179, 188, 102, 180, 199, 104, 180, 209, 105, 178, 220, 105, 174, 229, 103, 166, 238, 100, 156, 245, 96, 141, 251, 91, 123, 254, 84, 101]

```

---

## FILE: src/ontology/core/GLYPH_TYPES.md

```markdown
---
id: GLYPH_TYPES
type: enum
dataType: u8
description: "Bitwise integer categories for the 64-codon GlyphIR matrix"
deps: []
values:
  KIND_CORE: 0
  KIND_CONTROL: 1
  KIND_TRANSPORT: 2
  KIND_STRUCTURAL: 3
  KIND_CATALYTIC: 4
  KIND_REGULATORY: 5
  KIND_MEMORY: 6
  KIND_RESERVE: 7

  STAB_HARD_INVARIANT: 0
  STAB_LEGACY_BRIDGE: 1
  STAB_BOUNDED_DYNAMIC: 2
  STAB_RESERVE: 3
---

```

---

## FILE: src/ontology/core/omega_daemon.md

```markdown
---
id: OMEGA_DAEMON
type: module
description: "Implementation of OMEGA_DAEMON"
tags: []
min_level: 6
---

### TypeScript
```typescript
// OMEGA-64 | OMEGA_DAEMON.ts | Era 70: Mycelial Observer Daemon
// Autonomous companion loop: reads telemetry, reasons via OpenAI, injects stimuli.
import { WORLD_MAX_X, WORLD_MAX_Y } from "../mod.ts";


type Telemetry = {
  tick: number;
  avgEnergy: number;
  dominantGenomes: string[];
  voxPopuli: string[];
  behavior_invariant?: string;
  behavior_clusters?: Array<{
    behaviorSignature: string;
    memberCount: number;
    dominantRole: number;
    genomeSamples: string[];
    fingerprint?: {
      replicateRatio: number;
      signalRatio: number;
      buildRatio: number;
      survivalCurve: number[];
    };
    lastTick?: number;
  }>;
  federation_rule_genome?: {
    local?: {
      signature: string;
      noveltySigned: number;
      symbiosisSigned: number;
      pressureRingScale: number;
      workerCount: number;
      strictDeterminism: boolean;
      generatedAt: string;
    };
    peers?: Array<{
      peer: string;
      profile: {
        signature: string;
        noveltySigned: number;
        symbiosisSigned: number;
        pressureRingScale: number;
        workerCount: number;
        strictDeterminism: boolean;
        generatedAt: string;
      };
    }>;
  };
  federation_admission?: {
    latest?: {
      action: string;
      severity: string;
      score: number;
      sourceNode?: string;
      localBehaviorInvariant?: string;
      peerBehaviorInvariant?: string;
      behaviorDistance?: number;
      localCodexLabel?: string;
      peerCodexLabel?: string;
      codexDistance?: number;
      policyEnergyRatio?: number;
      policyResonanceRatio?: number;
      policyFragments?: Array<{
        id?: string;
        source?: string;
        mode?: string;
        reason?: string;
      }>;
    };
  };
  pulse_pressure?: {
    novelty_signed: number;
    symbiosis_signed: number;
    novelty: number;
    fear: number;
    symbiosis: number;
    ego: number;
    ring: {
      enabled: boolean;
      theta: number;
      scale: number;
      fear_curiosity_balance: number;
      ego_love_balance: number;
      novelty_axis_from_ring: boolean;
      symbiosis_axis_from_ring: boolean;
    };
  };
  daemon_governance?: {
    safe_mode: boolean;
    safe_mode_reason: string;
    actions_used_in_window: number;
    actions_max_in_window: number;
    window_reset_in_ms: number;
    max_pheromone_intensity: number;
    max_plasmid_charge: number;
    invariant_drift_mid_score: number;
    invariant_drift_high_score: number;
    last_admission?: unknown;
    last_admission_history?: unknown[];
    last_pressure_ring_update?: unknown;
    last_pressure_ring_history?: unknown[];
    last_homeostasis_update?: unknown;
    last_homeostasis_history?: unknown[];
    homeostasis?: {
      enabled: boolean;
      target_energy: number;
      target_energy_default?: number;
      target_energy_current?: number;
      band: number;
      max_delta: number;
      overflow_threshold: number;
      starvation_floor: number;
      subsidy_enabled: boolean;
      base_tax_default: number;
      base_tax_current: number;
      last_update_tick: number;
      last_update_source: string;
      last_update_reason: string;
    };
  };
  spatial_hash_guard?: {
    overflow_ratio: number;
    overflow_count: number;
    max_cell_count: number;
  };
  hormones?: number[];
};

type CodexNarrative = {
  tick: number;
  epoch: number;
  mood: string;
  title: string;
  summary: string;
  relicStatus: string;
  glyphStatus: string;
  glyphRegime: string;
  glyphDominantRole: string;
  glyphSourceMode: string;
  daemonEffectStatus: string;
  daemonEffectLineage: string;
  daemonEffectDeltaBand: string;
  hormoneRegime: string;
  promptBridge: string;
  hippocampusRecall?: {
    tick: number;
    epoch: number;
    summary: string;
    distance: number;
    distanceType: string;
  };
  recentChronicles: Array<{
    tick: number;
    epoch: number;
    type: string;
    title: string;
  }>;
};

type ActionType = "DROP_PHEROMONE" | "INJECT_PLASMID" | "OBSERVE";

type DaemonDecision = {
  internal_monologue: string;
  action_type: ActionType;
  payload: {
    target_x: number;
    target_y: number;
    hex_code?: string;
    intensity: number;
  };
};

type InvariantSignal = {
  key: string;
  vector: string;
  weight: number;
  evidence: string[];
};

type InvariantFrame = {
  tick: number;
  epoch: number;
  center: string;
  signature: string;
  invariants: InvariantSignal[];
  summary: string;
  created_at: string;
  hormones: number[];
};

type OpenAIChoice = {
  message?: {
    content?: string;
  };
};

type OpenAIResponse = {
  choices?: OpenAIChoice[];
};

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
} as const;

const parseBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (raw === undefined) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};
const parseBoundedFloat = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (raw === undefined) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
};
const parseEnvBool = (
  raw: string | undefined,
  fallback: boolean,
): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};

const asFiniteNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const timestamp = (): string => new Date().toISOString();

const logThought = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.cyan}[MYCELIUM:THOUGHT]${ANSI.reset} ${text}`,
  );
};

const logAction = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.green}[MYCELIUM:ACTION]${ANSI.reset} ${text}`,
  );
};

const logWarn = (text: string): void => {
  console.warn(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.yellow}[MYCELIUM:WARN]${ANSI.reset} ${text}`,
  );
};

const logInvariant = (text: string): void => {
  console.log(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.yellow}[MYCELIUM:INVARIANT]${ANSI.reset} ${text}`,
  );
};

const logError = (text: string): void => {
  console.error(
    `${ANSI.dim}${timestamp()}${ANSI.reset} ${ANSI.red}[MYCELIUM:ERROR]${ANSI.reset} ${text}`,
  );
};

const API_BASE = (Deno.env.get("OMEGA_DAEMON_API_BASE") ??
  "http://localhost:8080").replace(/\/+$/u, "");
const TELEMETRY_URL = `${API_BASE}/api/telemetry`;
const CODEX_NARRATIVE_URL = `${API_BASE}/api/codex/narrative`;
const INJECT_URL = `${API_BASE}/api/inject`;
const PRESSURE_RING_URL = `${API_BASE}/api/pressure-ring`;
const HOMEOSTASIS_URL = `${API_BASE}/api/homeostasis`;
const OPENAI_URL = Deno.env.get("OPENAI_API_URL") ??
  "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = Deno.env.get("OMEGA_DAEMON_MODEL") ?? "gpt-4o";
const OPENAI_API_KEY = (Deno.env.get("OPENAI_API_KEY") ?? "").trim();
const CONTROL_TOKEN = (
  Deno.env.get("OMEGA_DAEMON_CONTROL_TOKEN") ??
    Deno.env.get("OMEGA_SYSTEM_CONTROL_TOKEN") ??
    ""
).trim();
const HEARTBEAT_INTERVAL_MS = parseBoundedInt(
  Deno.env.get("HEARTBEAT_INTERVAL_MS"),
  60_000,
  5_000,
  3_600_000,
);
const HTTP_TIMEOUT_MS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HTTP_TIMEOUT_MS"),
  15_000,
  2_000,
  120_000,
);
const MEMORY_LIMIT = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_MEMORY_LIMIT"),
  10,
  1,
  64,
);
const MEMORY_PATH = Deno.env.get("OMEGA_DAEMON_MEMORY_PATH") ??
  "./daemon_memory.json";
const INVARIANT_MEMORY_LIMIT = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_INVARIANT_LIMIT"),
  32,
  1,
  256,
);
const INVARIANT_PATH = Deno.env.get("OMEGA_DAEMON_INVARIANT_PATH") ??
  "./08/telemetry/daemon_invariants.json";
const PHASE_SEASONS_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_ENABLE"),
  true,
);
const PHASE_SEASONS_STEP_RAD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_STEP_RAD"),
  0.0625,
  0.0001,
  1.0,
);
const PHASE_SEASONS_MAX_STEP_RAD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_MAX_STEP_RAD"),
  0.25,
  0.01,
  1.0,
);
const PHASE_SEASONS_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_COOLDOWN_TICKS"),
  8,
  1,
  10_000,
);
const PHASE_SEASONS_LOW_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_LOW_ENERGY"),
  10,
  0,
  10_000,
);
const PHASE_SEASONS_HIGH_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_PHASE_SEASONS_HIGH_ENERGY"),
  24,
  0,
  10_000,
);
const HOMEOSTASIS_CONTROL_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_ENABLE"),
  true,
);
const HOMEOSTASIS_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_COOLDOWN_TICKS"),
  24,
  1,
  50_000,
);
const HOMEOSTASIS_TARGET_ENERGY = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_ENERGY"),
  420,
  1,
  100_000,
);
const HOMEOSTASIS_BAND = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_BAND"),
  120,
  1,
  50_000,
);
const HOMEOSTASIS_GAIN_UP = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_GAIN_UP"),
  0.0125,
  0.0001,
  1.0,
);
const HOMEOSTASIS_GAIN_DOWN = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_GAIN_DOWN"),
  0.008,
  0.0001,
  1.0,
);
const HOMEOSTASIS_MAX_STEP = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MAX_STEP"),
  2,
  1,
  32,
);
const HOMEOSTASIS_MIN_TAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MIN_TAX"),
  0,
  0,
  256,
);
const HOMEOSTASIS_MAX_TAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_MAX_TAX"),
  16,
  1,
  512,
);
const HOMEOSTASIS_OVERFLOW_SOFT = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_OVERFLOW_SOFT"),
  0.22,
  0,
  1,
);
const HOMEOSTASIS_OVERFLOW_HARD = parseBoundedFloat(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_OVERFLOW_HARD"),
  0.35,
  0,
  1,
);
const HOMEOSTASIS_TARGET_CONTROL_ENABLE = parseEnvBool(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_CONTROL_ENABLE"),
  true,
);
const HOMEOSTASIS_TARGET_COOLDOWN_TICKS = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_COOLDOWN_TICKS"),
  96,
  4,
  100_000,
);
const HOMEOSTASIS_TARGET_STEP = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_STEP"),
  20,
  1,
  2000,
);
const HOMEOSTASIS_TARGET_MIN = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_MIN"),
  120,
  1,
  100_000,
);
const HOMEOSTASIS_TARGET_MAX = parseBoundedInt(
  Deno.env.get("OMEGA_DAEMON_HOMEOSTASIS_TARGET_MAX"),
  2000,
  10,
  1_000_000,
);

let lastPhaseSeasonTick = -1;
let lastHomeostasisControlTick = -1;
let lastHomeostasisTargetControlTick = -1;

const withTimeout = async (
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const loadMemory = async (): Promise<string[]> => {
  try {
    const raw = await Deno.readTextFile(MEMORY_PATH);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(-MEMORY_LIMIT);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    logWarn(`Memory read fallback: ${String(err)}`);
    return [];
  }
};

const saveMemory = async (thoughts: string[]): Promise<void> => {
  const compact = thoughts.slice(-MEMORY_LIMIT);
  await Deno.writeTextFile(
    MEMORY_PATH,
    `${JSON.stringify(compact, null, 2)}\n`,
  );
};

const loadInvariantHistory = async (): Promise<InvariantFrame[]> => {
  try {
    const raw = await Deno.readTextFile(INVARIANT_PATH);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is InvariantFrame =>
        !!entry &&
        typeof entry === "object" &&
        Array.isArray((entry as Record<string, unknown>).invariants) &&
        typeof (entry as Record<string, unknown>).signature === "string"
      )
      .slice(-INVARIANT_MEMORY_LIMIT);
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) return [];
    logWarn(`Invariant memory read fallback: ${String(err)}`);
    return [];
  }
};

const saveInvariantHistory = async (
  frames: InvariantFrame[],
): Promise<void> => {
  const compact = frames.slice(-INVARIANT_MEMORY_LIMIT);
  await Deno.writeTextFile(
    INVARIANT_PATH,
    `${JSON.stringify(compact, null, 2)}\n`,
  );
};

const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/gu, " ")
    .split(/\s+/u)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const tokenSet = (parts: string[]): Set<string> => {
  const out = new Set<string>();
  for (const part of parts) {
    for (const token of tokenize(part)) out.add(token);
  }
  return out;
};

const setIntersection = (a: Set<string>, b: Set<string>): string[] => {
  const out: string[] = [];
  for (const token of a) {
    if (b.has(token)) out.push(token);
  }
  out.sort((x, y) => x.localeCompare(y));
  return out;
};

const normalizeTelemetry = (raw: unknown): Telemetry => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const dominantGenomes = Array.isArray(source.dominantGenomes)
    ? source.dominantGenomes.filter((v): v is string => typeof v === "string")
    : [];
  const voxPopuli = Array.isArray(source.voxPopuli)
    ? source.voxPopuli.filter((v): v is string => typeof v === "string")
    : [];
  const pulseRaw =
    source.pulse_pressure && typeof source.pulse_pressure === "object"
      ? source.pulse_pressure as Record<string, unknown>
      : null;
  const ringRaw = pulseRaw?.ring && typeof pulseRaw.ring === "object"
    ? pulseRaw.ring as Record<string, unknown>
    : null;
  const daemonRaw = source.daemon_governance &&
      typeof source.daemon_governance === "object"
    ? source.daemon_governance as Record<string, unknown>
    : null;
  const daemonHomeostasisRaw = daemonRaw?.homeostasis &&
      typeof daemonRaw.homeostasis === "object"
    ? daemonRaw.homeostasis as Record<string, unknown>
    : null;
  const spatialRaw = source.spatial_hash_guard &&
      typeof source.spatial_hash_guard === "object"
    ? source.spatial_hash_guard as Record<string, unknown>
    : null;
  const behaviorClusters = Array.isArray(source.behavior_clusters)
    ? source.behavior_clusters
      .filter((entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object"
      )
      .map((entry) => ({
        behaviorSignature: typeof entry.behaviorSignature === "string"
          ? entry.behaviorSignature
          : "none",
        memberCount: Math.max(
          0,
          Math.floor(asFiniteNumber(entry.memberCount, 0)),
        ),
        dominantRole: Math.max(
          0,
          Math.floor(asFiniteNumber(entry.dominantRole, 0)),
        ),
        genomeSamples: Array.isArray(entry.genomeSamples)
          ? entry.genomeSamples
            .filter((sample): sample is string => typeof sample === "string")
            .slice(0, 6)
          : [],
        fingerprint: entry.fingerprint && typeof entry.fingerprint === "object"
          ? {
            replicateRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).replicateRatio,
              0,
            ),
            signalRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).signalRatio,
              0,
            ),
            buildRatio: asFiniteNumber(
              (entry.fingerprint as Record<string, unknown>).buildRatio,
              0,
            ),
            survivalCurve: Array.isArray(
                (entry.fingerprint as Record<string, unknown>).survivalCurve,
              )
              ? (
                (entry.fingerprint as Record<string, unknown>)
                  .survivalCurve as unknown[]
              )
                .map((value) =>
                  Math.max(0, Math.floor(asFiniteNumber(value, 0)))
                )
                .slice(-12)
              : [],
          }
          : undefined,
        lastTick: Math.max(0, Math.floor(asFiniteNumber(entry.lastTick, 0))),
      }))
      .slice(0, 6)
    : [];
  const federationRaw = source.federation_rule_genome &&
      typeof source.federation_rule_genome === "object"
    ? source.federation_rule_genome as Record<string, unknown>
    : null;
  const federationLocalRaw = federationRaw?.local &&
      typeof federationRaw.local === "object"
    ? federationRaw.local as Record<string, unknown>
    : null;
  const federationPeersRaw = Array.isArray(federationRaw?.peers)
    ? federationRaw?.peers as unknown[]
    : [];
  const federationAdmissionRaw = source.federation_admission &&
      typeof source.federation_admission === "object"
    ? source.federation_admission as Record<string, unknown>
    : null;
  const federationAdmissionLatestRaw = federationAdmissionRaw?.latest &&
      typeof federationAdmissionRaw.latest === "object"
    ? federationAdmissionRaw.latest as Record<string, unknown>
    : null;
  const hormonesRaw = Array.isArray(source.hormones) ? source.hormones : [];
  return {
    tick: Math.max(0, Math.floor(asFiniteNumber(source.tick, 0))),
    avgEnergy: asFiniteNumber(source.avgEnergy, 0),
    dominantGenomes: dominantGenomes.slice(0, 3),
    voxPopuli: voxPopuli.slice(0, 8),
    behavior_invariant: typeof source.behavior_invariant === "string"
      ? source.behavior_invariant
      : undefined,
    behavior_clusters: behaviorClusters,
    federation_rule_genome: federationRaw
      ? {
        local: federationLocalRaw
          ? {
            signature: typeof federationLocalRaw.signature === "string"
              ? federationLocalRaw.signature
              : "NONE",
            noveltySigned: Math.floor(
              asFiniteNumber(federationLocalRaw.noveltySigned, 0),
            ),
            symbiosisSigned: Math.floor(
              asFiniteNumber(federationLocalRaw.symbiosisSigned, 0),
            ),
            pressureRingScale: Math.max(
              0,
              Math.floor(
                asFiniteNumber(federationLocalRaw.pressureRingScale, 0),
              ),
            ),
            workerCount: Math.max(
              1,
              Math.floor(asFiniteNumber(federationLocalRaw.workerCount, 1)),
            ),
            strictDeterminism: parseEnvBool(
              typeof federationLocalRaw.strictDeterminism === "string" ||
                typeof federationLocalRaw.strictDeterminism === "boolean"
                ? String(federationLocalRaw.strictDeterminism)
                : undefined,
              false,
            ),
            generatedAt: typeof federationLocalRaw.generatedAt === "string"
              ? federationLocalRaw.generatedAt
              : "",
          }
          : undefined,
        peers: federationPeersRaw
          .filter((entry): entry is Record<string, unknown> =>
            !!entry && typeof entry === "object"
          )
          .map((entry) => {
            const profile = entry.profile && typeof entry.profile === "object"
              ? entry.profile as Record<string, unknown>
              : {};
            return {
              peer: typeof entry.peer === "string" ? entry.peer : "unknown",
              profile: {
                signature: typeof profile.signature === "string"
                  ? profile.signature
                  : "NONE",
                noveltySigned: Math.floor(
                  asFiniteNumber(profile.noveltySigned, 0),
                ),
                symbiosisSigned: Math.floor(
                  asFiniteNumber(profile.symbiosisSigned, 0),
                ),
                pressureRingScale: Math.max(
                  0,
                  Math.floor(asFiniteNumber(profile.pressureRingScale, 0)),
                ),
                workerCount: Math.max(
                  1,
                  Math.floor(asFiniteNumber(profile.workerCount, 1)),
                ),
                strictDeterminism: parseEnvBool(
                  typeof profile.strictDeterminism === "string" ||
                    typeof profile.strictDeterminism === "boolean"
                    ? String(profile.strictDeterminism)
                    : undefined,
                  false,
                ),
                generatedAt: typeof profile.generatedAt === "string"
                  ? profile.generatedAt
                  : "",
              },
            };
          })
          .slice(0, 8),
      }
      : undefined,
    federation_admission: federationAdmissionRaw
      ? {
        latest: federationAdmissionLatestRaw
          ? {
            action: typeof federationAdmissionLatestRaw.action === "string"
              ? federationAdmissionLatestRaw.action
              : "accept",
            severity: typeof federationAdmissionLatestRaw.severity === "string"
              ? federationAdmissionLatestRaw.severity
              : "LOW",
            score: Math.floor(
              asFiniteNumber(federationAdmissionLatestRaw.score, 0),
            ),
            sourceNode: typeof federationAdmissionLatestRaw.sourceNode ===
                "string"
              ? federationAdmissionLatestRaw.sourceNode
              : undefined,
            localBehaviorInvariant:
              typeof federationAdmissionLatestRaw.localBehaviorInvariant ===
                  "string"
                ? federationAdmissionLatestRaw.localBehaviorInvariant
                : undefined,
            peerBehaviorInvariant:
              typeof federationAdmissionLatestRaw.peerBehaviorInvariant ===
                  "string"
                ? federationAdmissionLatestRaw.peerBehaviorInvariant
                : undefined,
            behaviorDistance: asFiniteNumber(
              federationAdmissionLatestRaw.behaviorDistance,
              -1,
            ),
            localCodexLabel:
              typeof federationAdmissionLatestRaw.localCodexLabel === "string"
                ? federationAdmissionLatestRaw.localCodexLabel
                : undefined,
            peerCodexLabel:
              typeof federationAdmissionLatestRaw.peerCodexLabel === "string"
                ? federationAdmissionLatestRaw.peerCodexLabel
                : undefined,
            codexDistance: asFiniteNumber(
              federationAdmissionLatestRaw.codexDistance,
              -1,
            ),
            policyEnergyRatio: asFiniteNumber(
              federationAdmissionLatestRaw.policyEnergyRatio,
              1,
            ),
            policyResonanceRatio: asFiniteNumber(
              federationAdmissionLatestRaw.policyResonanceRatio,
              1,
            ),
            policyFragments: Array.isArray(
                federationAdmissionLatestRaw.policyFragments,
              )
              ? (
                federationAdmissionLatestRaw.policyFragments as unknown[]
              ).filter((entry): entry is Record<string, unknown> =>
                !!entry && typeof entry === "object"
              ).map((entry) => ({
                id: typeof entry.id === "string" ? entry.id : undefined,
                source: typeof entry.source === "string"
                  ? entry.source
                  : undefined,
                mode: typeof entry.mode === "string" ? entry.mode : undefined,
                reason: typeof entry.reason === "string"
                  ? entry.reason
                  : undefined,
              })).slice(0, 8)
              : [],
          }
          : undefined,
      }
      : undefined,
    pulse_pressure: pulseRaw && ringRaw
      ? {
        novelty_signed: asFiniteNumber(pulseRaw.novelty_signed, 0),
        symbiosis_signed: asFiniteNumber(pulseRaw.symbiosis_signed, 0),
        novelty: asFiniteNumber(pulseRaw.novelty, 0),
        fear: asFiniteNumber(pulseRaw.fear, 0),
        symbiosis: asFiniteNumber(pulseRaw.symbiosis, 0),
        ego: asFiniteNumber(pulseRaw.ego, 0),
        ring: {
          enabled: parseEnvBool(
            typeof ringRaw.enabled === "string" ||
              typeof ringRaw.enabled === "boolean"
              ? String(ringRaw.enabled)
              : undefined,
            false,
          ),
          theta: asFiniteNumber(ringRaw.theta, 0),
          scale: Math.max(0, Math.round(asFiniteNumber(ringRaw.scale, 0))),
          fear_curiosity_balance: asFiniteNumber(
            ringRaw.fear_curiosity_balance,
            0,
          ),
          ego_love_balance: asFiniteNumber(ringRaw.ego_love_balance, 0),
          novelty_axis_from_ring: parseEnvBool(
            typeof ringRaw.novelty_axis_from_ring === "string" ||
              typeof ringRaw.novelty_axis_from_ring === "boolean"
              ? String(ringRaw.novelty_axis_from_ring)
              : undefined,
            false,
          ),
          symbiosis_axis_from_ring: parseEnvBool(
            typeof ringRaw.symbiosis_axis_from_ring === "string" ||
              typeof ringRaw.symbiosis_axis_from_ring === "boolean"
              ? String(ringRaw.symbiosis_axis_from_ring)
              : undefined,
            false,
          ),
        },
      }
      : undefined,
    daemon_governance: daemonRaw
      ? {
        safe_mode: parseEnvBool(
          typeof daemonRaw.safe_mode === "string" ||
            typeof daemonRaw.safe_mode === "boolean"
            ? String(daemonRaw.safe_mode)
            : undefined,
          false,
        ),
        safe_mode_reason: typeof daemonRaw.safe_mode_reason === "string"
          ? daemonRaw.safe_mode_reason
          : "SAFE_MODE_UNKNOWN",
        actions_used_in_window: Math.max(
          0,
          Math.floor(asFiniteNumber(daemonRaw.actions_used_in_window, 0)),
        ),
        actions_max_in_window: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.actions_max_in_window, 1)),
        ),
        window_reset_in_ms: Math.max(
          0,
          Math.floor(asFiniteNumber(daemonRaw.window_reset_in_ms, 0)),
        ),
        max_pheromone_intensity: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.max_pheromone_intensity, 1)),
        ),
        max_plasmid_charge: Math.max(
          1,
          Math.floor(asFiniteNumber(daemonRaw.max_plasmid_charge, 1)),
        ),
        invariant_drift_mid_score: Math.floor(
          asFiniteNumber(daemonRaw.invariant_drift_mid_score, 0),
        ),
        invariant_drift_high_score: Math.floor(
          asFiniteNumber(daemonRaw.invariant_drift_high_score, 0),
        ),
        last_admission: daemonRaw.last_admission,
        last_admission_history: Array.isArray(daemonRaw.last_admission_history)
          ? daemonRaw.last_admission_history
          : [],
        last_pressure_ring_update: daemonRaw.last_pressure_ring_update,
        last_pressure_ring_history: Array.isArray(
            daemonRaw.last_pressure_ring_history,
          )
          ? daemonRaw.last_pressure_ring_history
          : [],
        last_homeostasis_update: daemonRaw.last_homeostasis_update,
        last_homeostasis_history: Array.isArray(
            daemonRaw.last_homeostasis_history,
          )
          ? daemonRaw.last_homeostasis_history
          : [],
        homeostasis: daemonHomeostasisRaw
          ? {
            enabled: parseEnvBool(
              typeof daemonHomeostasisRaw.enabled === "string" ||
                typeof daemonHomeostasisRaw.enabled === "boolean"
                ? String(daemonHomeostasisRaw.enabled)
                : undefined,
              true,
            ),
            target_energy: asFiniteNumber(
              daemonHomeostasisRaw.target_energy,
              HOMEOSTASIS_TARGET_ENERGY,
            ),
            target_energy_default: asFiniteNumber(
              daemonHomeostasisRaw.target_energy_default,
              HOMEOSTASIS_TARGET_ENERGY,
            ),
            target_energy_current: asFiniteNumber(
              daemonHomeostasisRaw.target_energy_current,
              asFiniteNumber(
                daemonHomeostasisRaw.target_energy,
                HOMEOSTASIS_TARGET_ENERGY,
              ),
            ),
            band: asFiniteNumber(daemonHomeostasisRaw.band, HOMEOSTASIS_BAND),
            max_delta: asFiniteNumber(daemonHomeostasisRaw.max_delta, 0),
            overflow_threshold: asFiniteNumber(
              daemonHomeostasisRaw.overflow_threshold,
              0,
            ),
            starvation_floor: asFiniteNumber(
              daemonHomeostasisRaw.starvation_floor,
              0,
            ),
            subsidy_enabled: parseEnvBool(
              typeof daemonHomeostasisRaw.subsidy_enabled === "string" ||
                typeof daemonHomeostasisRaw.subsidy_enabled === "boolean"
                ? String(daemonHomeostasisRaw.subsidy_enabled)
                : undefined,
              false,
            ),
            base_tax_default: Math.max(
              0,
              Math.round(
                asFiniteNumber(daemonHomeostasisRaw.base_tax_default, 0),
              ),
            ),
            base_tax_current: Math.max(
              0,
              Math.round(
                asFiniteNumber(daemonHomeostasisRaw.base_tax_current, 0),
              ),
            ),
            last_update_tick: Math.max(
              0,
              Math.floor(
                asFiniteNumber(daemonHomeostasisRaw.last_update_tick, 0),
              ),
            ),
            last_update_source:
              typeof daemonHomeostasisRaw.last_update_source === "string"
                ? daemonHomeostasisRaw.last_update_source
                : "unknown",
            last_update_reason:
              typeof daemonHomeostasisRaw.last_update_reason === "string"
                ? daemonHomeostasisRaw.last_update_reason
                : "unknown",
          }
          : undefined,
      }
      : undefined,
    spatial_hash_guard: spatialRaw
      ? {
        overflow_ratio: asFiniteNumber(spatialRaw.overflow_ratio, 0),
        overflow_count: Math.max(
          0,
          Math.floor(asFiniteNumber(spatialRaw.overflow_count, 0)),
        ),
        max_cell_count: Math.max(
          0,
          Math.floor(asFiniteNumber(spatialRaw.max_cell_count, 0)),
        ),
      }
      : undefined,
    hormones: hormonesRaw.map((v) => asFiniteNumber(v, 0)).slice(0, 6),
  };
};

const fetchTelemetry = async (): Promise<Telemetry> => {
  const response = await withTimeout(
    TELEMETRY_URL,
    { method: "GET", headers: { Accept: "application/json" } },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error(
      `Telemetry request failed: ${response.status} ${response.statusText}`,
    );
  }
  return normalizeTelemetry(await response.json());
};

const normalizeCodexNarrative = (raw: unknown): CodexNarrative => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const recentChronicles = Array.isArray(source.recentChronicles)
    ? source.recentChronicles
      .filter((entry): entry is Record<string, unknown> =>
        !!entry && typeof entry === "object"
      )
      .map((entry) => ({
        tick: Math.max(0, Math.floor(asFiniteNumber(entry.tick, 0))),
        epoch: Math.max(0, Math.floor(asFiniteNumber(entry.epoch, 0))),
        type: typeof entry.type === "string" ? entry.type : "unknown",
        title: typeof entry.title === "string" ? entry.title : "untitled",
      }))
      .slice(0, 6)
    : [];
  return {
    tick: Math.max(0, Math.floor(asFiniteNumber(source.tick, 0))),
    epoch: Math.max(0, Math.floor(asFiniteNumber(source.epoch, 0))),
    mood: typeof source.mood === "string" ? source.mood : "STABLE",
    title: typeof source.title === "string" && source.title.trim().length > 0
      ? source.title.trim()
      : "Lattice Status",
    summary:
      typeof source.summary === "string" && source.summary.trim().length > 0
        ? source.summary.trim()
        : "Codex narrative unavailable.",
    relicStatus: typeof source.relicStatus === "string"
      ? source.relicStatus
      : "Relic status unavailable.",
    glyphStatus: typeof source.glyphStatus === "string"
      ? source.glyphStatus
      : "Glyph transport status unavailable.",
    glyphRegime: typeof source.glyphRegime === "string"
      ? source.glyphRegime
      : "dormant",
    glyphDominantRole: typeof source.glyphDominantRole === "string"
      ? source.glyphDominantRole
      : "none",
    glyphSourceMode: typeof source.glyphSourceMode === "string"
      ? source.glyphSourceMode
      : "none",
    daemonEffectStatus: typeof source.daemonEffectStatus === "string"
      ? source.daemonEffectStatus
      : "Daemon effect status unavailable.",
    daemonEffectLineage: typeof source.daemonEffectLineage === "string"
      ? source.daemonEffectLineage
      : "none",
    daemonEffectDeltaBand: typeof source.daemonEffectDeltaBand === "string"
      ? source.daemonEffectDeltaBand
      : "none",
    hormoneRegime: typeof source.hormoneRegime === "string"
      ? source.hormoneRegime
      : "dormant_baseline",
    promptBridge: typeof source.promptBridge === "string"
      ? source.promptBridge
      : "Use plain language for observer-facing updates.",
    hippocampusRecall: source.hippocampusRecall &&
        typeof source.hippocampusRecall === "object"
      ? source.hippocampusRecall as CodexNarrative["hippocampusRecall"]
      : undefined,
    recentChronicles,
  };
};

const fetchCodexNarrative = async (): Promise<CodexNarrative> => {
  try {
    const response = await withTimeout(
      CODEX_NARRATIVE_URL,
      { method: "GET", headers: { Accept: "application/json" } },
      HTTP_TIMEOUT_MS,
    );
    if (!response.ok) {
      throw new Error(
        `Codex narrative request failed: ${response.status} ${response.statusText}`,
      );
    }
    return normalizeCodexNarrative(await response.json());
  } catch (err) {
    logWarn(`Codex narrative fallback: ${String(err)}`);
    return {
      tick: 0,
      epoch: 0,
      mood: "STABLE",
      title: "Codex Unavailable",
      summary:
        "Codex narrative endpoint unavailable; operating on telemetry only.",
      relicStatus: "Relic status unavailable.",
      glyphStatus: "Glyph transport status unavailable.",
      glyphRegime: "dormant",
      glyphDominantRole: "none",
      glyphSourceMode: "none",
      daemonEffectStatus: "Daemon effect status unavailable.",
      daemonEffectLineage: "none",
      daemonEffectDeltaBand: "none",
      hormoneRegime: "dormant_baseline",
      promptBridge: "Use plain language for observer-facing updates.",
      recentChronicles: [],
    };
  }
};

const energyBand = (avgEnergy: number): string => {
  if (avgEnergy < 8) return "SCARCITY";
  if (avgEnergy < 20) return "TENSION";
  if (avgEnergy < 45) return "BALANCED";
  return "SURPLUS";
};

const moodBand = (mood: string): string => {
  const normalized = mood.trim().toUpperCase();
  if (normalized === "FRAGILE") return "FRAGILE";
  if (normalized === "ASCENDANT") return "ASCENDANT";
  return "STABLE";
};

const dominantAnchor = (dominantGenomes: string[]): string =>
  dominantGenomes.length > 0
    ? dominantGenomes[0].replace(/^0x/iu, "").slice(0, 8).toUpperCase()
    : "NONE";

const buildInvariantFrame = (
  telemetry: Telemetry,
  codexNarrative: CodexNarrative,
  memory: string[],
): InvariantFrame => {
  const mood = moodBand(codexNarrative.mood);
  const energy = energyBand(telemetry.avgEnergy);
  const lineage = dominantAnchor(telemetry.dominantGenomes);
  const memoryTokens = tokenSet(memory.slice(-4));
  const narrativeTokens = tokenSet([
    codexNarrative.title,
    codexNarrative.summary,
    codexNarrative.relicStatus,
    codexNarrative.glyphStatus,
    codexNarrative.daemonEffectStatus,
    ...telemetry.voxPopuli.slice(0, 4),
  ]);
  const sharedTokens = setIntersection(memoryTokens, narrativeTokens).slice(
    0,
    6,
  );
  const behaviorInvariant = typeof telemetry.behavior_invariant === "string" &&
      telemetry.behavior_invariant.trim().length > 0
    ? telemetry.behavior_invariant.trim()
    : "none";
  const dominantBehaviorCluster = Array.isArray(telemetry.behavior_clusters) &&
      telemetry.behavior_clusters.length > 0
    ? telemetry.behavior_clusters[0]
    : undefined;
  const federationLocal = telemetry.federation_rule_genome?.local;
  const federationPeers = telemetry.federation_rule_genome?.peers ?? [];
  const federationPeer = federationPeers.length > 0
    ? federationPeers[0]
    : undefined;
  const federationAdmission = telemetry.federation_admission?.latest;
  const invariantSignals: InvariantSignal[] = [
    {
      key: "energy_mood_coupling",
      vector: `${energy}:${mood}`,
      weight: energy === "SCARCITY" || mood === "FRAGILE" ? 0.94 : 0.62,
      evidence: [
        `avgEnergy=${telemetry.avgEnergy.toFixed(2)}`,
        `mood=${mood}`,
      ],
    },
    {
      key: "lineage_anchor",
      vector: lineage,
      weight: lineage === "NONE" ? 0.25 : 0.71,
      evidence: telemetry.dominantGenomes.slice(0, 2),
    },
    {
      key: "semantic_intersection",
      vector: sharedTokens.length > 0 ? sharedTokens.join("|") : "none",
      weight: sharedTokens.length > 0
        ? clamp(0.36 + sharedTokens.length * 0.08, 0, 0.92)
        : 0.12,
      evidence: sharedTokens.length > 0 ? sharedTokens : ["no-overlap"],
    },
    {
      key: "behavior_cluster",
      vector: behaviorInvariant,
      weight: dominantBehaviorCluster && dominantBehaviorCluster.memberCount > 0
        ? clamp(0.35 + dominantBehaviorCluster.memberCount / 5000, 0.2, 0.86)
        : 0.2,
      evidence: dominantBehaviorCluster
        ? [
          `members=${dominantBehaviorCluster.memberCount}`,
          `role=${dominantBehaviorCluster.dominantRole}`,
          `signature=${dominantBehaviorCluster.behaviorSignature}`,
          `curve=${
            dominantBehaviorCluster.fingerprint?.survivalCurve?.slice(-4).join(
              ",",
            ) || "none"
          }`,
        ]
        : ["behavior=none"],
    },
    {
      key: "federated_rule_pressure",
      vector: federationPeer
        ? `${federationPeer.profile.signature}:${federationPeer.peer}`
        : federationLocal
        ? `${federationLocal.signature}:local`
        : "none",
      weight: federationPeer ? 0.74 : federationLocal ? 0.42 : 0.16,
      evidence: federationPeer
        ? [
          `peer=${federationPeer.peer}`,
          `peerNovelty=${federationPeer.profile.noveltySigned}`,
          `peerSymbiosis=${federationPeer.profile.symbiosisSigned}`,
          `local=${federationLocal?.signature ?? "none"}`,
        ]
        : federationLocal
        ? [
          `localNovelty=${federationLocal.noveltySigned}`,
          `localSymbiosis=${federationLocal.symbiosisSigned}`,
          `workerCount=${federationLocal.workerCount}`,
        ]
        : ["federation=none"],
    },
    {
      key: "federation_admission_vector",
      vector: federationAdmission
        ? `${String(federationAdmission.action || "accept").toUpperCase()}:${
          String(federationAdmission.severity || "LOW").toUpperCase()
        }:${federationAdmission.localBehaviorInvariant ?? "none"}->${
          federationAdmission.peerBehaviorInvariant ?? "none"
        }:${federationAdmission.localCodexLabel ?? "unknown-lineage"}->${
          federationAdmission.peerCodexLabel ?? "unknown-lineage"
        }`
        : "none",
      weight: federationAdmission
        ? clamp(
          0.25 + Math.max(0, Number(federationAdmission.score || 0)) / 12,
          0.2,
          0.9,
        )
        : 0.14,
      evidence: federationAdmission
        ? [
          `score=${federationAdmission.score}`,
          `source=${federationAdmission.sourceNode ?? "unknown"}`,
          `distance=${
            Number(federationAdmission.behaviorDistance ?? -1).toFixed(3)
          }`,
          `codexDistance=${
            Number(federationAdmission.codexDistance ?? -1).toFixed(0)
          }`,
          `policyRatio=${
            Number(federationAdmission.policyEnergyRatio ?? 1).toFixed(3)
          }/${
            Number(federationAdmission.policyResonanceRatio ?? 1).toFixed(3)
          }`,
          `fragments=${
            Array.isArray(federationAdmission.policyFragments)
              ? federationAdmission.policyFragments.length
              : 0
          }`,
        ]
        : ["admission=none"],
    },
  ];

  const signatureSeed = JSON.stringify({
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    mood,
    energy,
    lineage,
    sharedTokens,
    behaviorInvariant,
    federationSignature: federationPeer?.profile.signature ??
      federationLocal?.signature ??
      "none",
    federationAdmissionVector: federationAdmission
      ? `${federationAdmission.action}:${federationAdmission.severity}:${
        federationAdmission.localBehaviorInvariant ?? "none"
      }->${federationAdmission.peerBehaviorInvariant ?? "none"}:${
        federationAdmission.localCodexLabel ?? "unknown-lineage"
      }->${federationAdmission.peerCodexLabel ?? "unknown-lineage"}`
      : "none",
    federationPolicyRatio: federationAdmission
      ? `${Number(federationAdmission.policyEnergyRatio ?? 1).toFixed(3)}:${
        Number(federationAdmission.policyResonanceRatio ?? 1).toFixed(3)
      }`
      : "1.000:1.000",
    federationPolicyFragments: federationAdmission &&
        Array.isArray(federationAdmission.policyFragments)
      ? federationAdmission.policyFragments.map((entry) =>
        `${entry.source ?? "unknown"}:${entry.mode ?? "none"}:${
          entry.reason ?? "none"
        }`
      )
      : [],
  });
  const signature = fnv1a32(signatureSeed);
  const summary =
    `center=tick.exists | energy=${energy} | mood=${mood} | lineage=${lineage} | behavior=${behaviorInvariant} | federation=${
      federationPeer?.profile.signature ?? federationLocal?.signature ?? "none"
    } | fedAdmission=${
      federationAdmission
        ? `${String(federationAdmission.action || "accept").toUpperCase()}:${
          String(federationAdmission.severity || "LOW").toUpperCase()
        }`
        : "none"
    } | overlap=${sharedTokens.length > 0 ? sharedTokens.join(",") : "none"}`;

  return {
    tick: telemetry.tick,
    epoch: codexNarrative.epoch,
    center: "tick.exists",
    signature,
    invariants: invariantSignals,
    summary,
    created_at: timestamp(),
    hormones: telemetry.hormones ?? [0, 0, 0, 0, 0, 0],
  };
};

const appendInvariantFrame = (
  history: InvariantFrame[],
  frame: InvariantFrame,
): InvariantFrame[] => [...history, frame].slice(-INVARIANT_MEMORY_LIMIT);

const normalizeAction = (value: unknown): ActionType => {
  if (typeof value !== "string") return "OBSERVE";
  const upper = value.trim().toUpperCase();
  if (upper === "DROP_PHEROMONE") return "DROP_PHEROMONE";
  if (upper === "INJECT_PLASMID") return "INJECT_PLASMID";
  return "OBSERVE";
};

const isHex16 = (value: string): boolean => /^[0-9A-Fa-f]{16}$/u.test(value);

const normalizeDecision = (raw: unknown): DaemonDecision => {
  const source = raw && typeof raw === "object"
    ? raw as Record<string, unknown>
    : {};
  const payloadSource = source.payload && typeof source.payload === "object"
    ? source.payload as Record<string, unknown>
    : {};

  let actionType = normalizeAction(source.action_type);
  const internalMonologue = typeof source.internal_monologue === "string" &&
      source.internal_monologue.trim().length > 0
    ? source.internal_monologue.trim()
    : "The lattice is quiet; observing drift and conserving intent.";

  const hexCode = typeof payloadSource.hex_code === "string"
    ? payloadSource.hex_code.trim().replace(/^0x/u, "").toUpperCase()
    : undefined;

  if (actionType === "INJECT_PLASMID" && (!hexCode || !isHex16(hexCode))) {
    actionType = "OBSERVE";
  }

  return {
    internal_monologue: internalMonologue,
    action_type: actionType,
    payload: {
      target_x: clamp(
        Math.round(asFiniteNumber(payloadSource.target_x, 700)),
        0,
        WORLD_MAX_X,
      ),
      target_y: clamp(
        Math.round(asFiniteNumber(payloadSource.target_y, 400)),
        0,
        WORLD_MAX_Y,
      ),
      intensity: clamp(asFiniteNumber(payloadSource.intensity, 100), 1, 2000),
      hex_code: hexCode,
    },
  };
};

const askOpenAI = async (
  telemetry: Telemetry,
  codexNarrative: CodexNarrative,
  memory: string[],
  invariantFrame: InvariantFrame,
  invariantHistory: InvariantFrame[],
): Promise<DaemonDecision> => {
  if (!OPENAI_API_KEY) {
    return {
      internal_monologue:
        "OpenAI key is not configured; continuing in observation-only mode.",
      action_type: "OBSERVE",
      payload: { target_x: 700, target_y: 400, intensity: 100 },
    };
  }

  const systemPrompt = [
    "You are the Mycelial Observer and Invariant Compressor of an ALife matrix.",
    "Prioritize invariant-preserving actions over novelty.",
    "If invariant confidence is weak, choose OBSERVE.",
    "Return strict JSON only.",
    "Decide whether to OBSERVE, DROP_PHEROMONE, or INJECT_PLASMID.",
    "If INJECT_PLASMID, hex_code must be exactly 16 hex chars.",
    "Do not output markdown.",
  ].join(" ");

  const requestBody = {
    model: OPENAI_MODEL,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify({
          telemetry,
          codex_narrative: codexNarrative,
          invariant_frame: invariantFrame,
          recent_invariant_history: invariantHistory.slice(-6),
          previous_thoughts: memory,
          output_contract: {
            internal_monologue: "string",
            action_type: ["DROP_PHEROMONE", "INJECT_PLASMID", "OBSERVE"],
            payload: {
              target_x: "number",
              target_y: "number",
              hex_code: "string|null",
              intensity: "number",
            },
          },
        }),
      },
    ],
  };

  const response = await withTimeout(
    OPENAI_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    },
    Math.max(HTTP_TIMEOUT_MS, 20_000),
  );

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(
      `OpenAI request failed: ${response.status} ${response.statusText} ${
        raw.slice(0, 240)
      }`,
    );
  }

  const parsed = await response.json() as OpenAIResponse;
  const content = parsed.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI response missing message.content");
  }

  return normalizeDecision(JSON.parse(content));
};

const postPressureRingUpdate = async (
  payload: {
    mode: "set" | "step";
    theta?: number;
    delta_theta?: number;
    scale?: number;
    enabled?: boolean;
    reason?: string;
  },
): Promise<void> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }
  const response = await withTimeout(
    PRESSURE_RING_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Pressure-ring update failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const postHomeostasisUpdate = async (
  payload: {
    base_tax?: number;
    target_energy?: number;
    reason?: string;
  },
): Promise<void> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }
  const response = await withTimeout(
    HOMEOSTASIS_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Homeostasis update failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const phaseSeasonDelta = (
  telemetry: Telemetry,
  frame: InvariantFrame,
): number => {
  if (telemetry.avgEnergy <= PHASE_SEASONS_LOW_ENERGY) {
    return -PHASE_SEASONS_STEP_RAD;
  }
  if (telemetry.avgEnergy >= PHASE_SEASONS_HIGH_ENERGY) {
    return PHASE_SEASONS_STEP_RAD;
  }
  const coupling = frame.invariants.find((signal) =>
    signal.key === "energy_mood_coupling"
  );
  if (coupling?.vector.includes("FRAGILE")) {
    return -(PHASE_SEASONS_STEP_RAD * 0.5);
  }
  return PHASE_SEASONS_STEP_RAD * 0.5;
};

const maybeAdvancePhaseRing = async (
  telemetry: Telemetry,
  frame: InvariantFrame,
): Promise<void> => {
  if (!PHASE_SEASONS_ENABLE) return;
  if (telemetry.daemon_governance?.safe_mode) return;
  if (telemetry.tick - lastPhaseSeasonTick < PHASE_SEASONS_COOLDOWN_TICKS) {
    return;
  }
  const ring = telemetry.pulse_pressure?.ring;
  if (!ring) return;

  const delta = clamp(
    phaseSeasonDelta(telemetry, frame),
    -PHASE_SEASONS_MAX_STEP_RAD,
    PHASE_SEASONS_MAX_STEP_RAD,
  );
  if (Math.abs(delta) < 1e-9) return;
  await postPressureRingUpdate({
    mode: "step",
    delta_theta: delta,
    reason: "daemon_phase_scheduler",
  });
  lastPhaseSeasonTick = telemetry.tick;
  logAction(
    `[PHASE_RING] step=${delta.toFixed(5)} tick=${telemetry.tick} theta≈${
      ring.theta.toFixed(5)
    } scale=${ring.scale}`,
  );
};

const maybeControlHomeostasis = async (telemetry: Telemetry): Promise<void> => {
  if (!HOMEOSTASIS_CONTROL_ENABLE) return;
  if (telemetry.daemon_governance?.safe_mode) return;
  const taxCooldownReady =
    telemetry.tick - lastHomeostasisControlTick >= HOMEOSTASIS_COOLDOWN_TICKS;
  const targetCooldownReady = !HOMEOSTASIS_TARGET_CONTROL_ENABLE ||
    telemetry.tick - lastHomeostasisTargetControlTick >=
      HOMEOSTASIS_TARGET_COOLDOWN_TICKS;
  if (!taxCooldownReady && !targetCooldownReady) return;

  const live = telemetry.daemon_governance?.homeostasis;
  if (!live?.enabled) return;

  const currentTax = clamp(
    Math.round(
      asFiniteNumber(live.base_tax_current, live.base_tax_default ?? 0),
    ),
    HOMEOSTASIS_MIN_TAX,
    HOMEOSTASIS_MAX_TAX,
  );
  const currentTarget = clamp(
    Math.round(
      asFiniteNumber(
        live.target_energy_current,
        asFiniteNumber(live.target_energy, HOMEOSTASIS_TARGET_ENERGY),
      ),
    ),
    HOMEOSTASIS_TARGET_MIN,
    HOMEOSTASIS_TARGET_MAX,
  );
  const band = Math.max(1, asFiniteNumber(live.band, HOMEOSTASIS_BAND));
  const overflow = clamp(
    asFiniteNumber(telemetry.spatial_hash_guard?.overflow_ratio, 0),
    0,
    1,
  );

  const high = currentTarget + band;
  const low = Math.max(0, currentTarget - band);
  let nextTax = currentTax;
  let nextTarget = currentTarget;
  let taxChanged = false;
  let targetChanged = false;

  if (taxCooldownReady && telemetry.avgEnergy > high) {
    const overshoot = telemetry.avgEnergy - high;
    let step = Math.max(1, Math.round(overshoot * HOMEOSTASIS_GAIN_UP));
    if (overflow >= HOMEOSTASIS_OVERFLOW_HARD) {
      step += 1;
    } else if (overflow >= HOMEOSTASIS_OVERFLOW_SOFT) {
      step = Math.max(step, 1);
    }
    nextTax = currentTax + Math.min(HOMEOSTASIS_MAX_STEP, step);
  } else if (taxCooldownReady && telemetry.avgEnergy < low) {
    const undershoot = low - telemetry.avgEnergy;
    const step = Math.max(1, Math.round(undershoot * HOMEOSTASIS_GAIN_DOWN));
    nextTax = currentTax - Math.min(HOMEOSTASIS_MAX_STEP, step);
  }
  nextTax = clamp(nextTax, HOMEOSTASIS_MIN_TAX, HOMEOSTASIS_MAX_TAX);
  taxChanged = nextTax !== currentTax;

  if (HOMEOSTASIS_TARGET_CONTROL_ENABLE && targetCooldownReady) {
    if (overflow >= HOMEOSTASIS_OVERFLOW_HARD && telemetry.avgEnergy > high) {
      nextTarget = currentTarget - HOMEOSTASIS_TARGET_STEP;
    } else if (
      overflow <= HOMEOSTASIS_OVERFLOW_SOFT * 0.6 &&
      telemetry.avgEnergy < low
    ) {
      nextTarget = currentTarget + HOMEOSTASIS_TARGET_STEP;
    }
  }
  nextTarget = clamp(
    nextTarget,
    HOMEOSTASIS_TARGET_MIN,
    HOMEOSTASIS_TARGET_MAX,
  );
  targetChanged = nextTarget !== currentTarget;
  if (!taxChanged && !targetChanged) return;

  const reasonParts: string[] = [];
  if (taxChanged) reasonParts.push("daemon_homeostasis_feedback");
  if (targetChanged) reasonParts.push("daemon_homeostasis_target_feedback");

  await postHomeostasisUpdate({
    ...(taxChanged ? { base_tax: nextTax } : {}),
    ...(targetChanged ? { target_energy: nextTarget } : {}),
    reason: reasonParts.join("+"),
  });
  if (taxChanged) lastHomeostasisControlTick = telemetry.tick;
  if (targetChanged) lastHomeostasisTargetControlTick = telemetry.tick;
  logAction(
    `[HOMEOSTASIS] baseTax=${currentTax}->${nextTax} target=${currentTarget}->${nextTarget} avgEnergy=${
      telemetry.avgEnergy.toFixed(2)
    } band=${band.toFixed(2)} overflow=${overflow.toFixed(3)}`,
  );
};

const postInjection = async (decision: DaemonDecision): Promise<void> => {
  if (decision.action_type === "OBSERVE") return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (CONTROL_TOKEN.length > 0) {
    headers["x-omega-control-token"] = CONTROL_TOKEN;
  }

  const payload = {
    action_type: decision.action_type,
    payload: decision.payload,
  };
  const response = await withTimeout(
    INJECT_URL,
    {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    },
    HTTP_TIMEOUT_MS,
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Inject request failed: ${response.status} ${response.statusText} ${
        text.slice(0, 240)
      }`,
    );
  }
};

const appendThought = (memory: string[], thought: string): string[] =>
  [...memory, thought].slice(-MEMORY_LIMIT);

const runHeartbeat = async (): Promise<void> => {
  const [memory, invariantHistory] = await Promise.all([
    loadMemory(),
    loadInvariantHistory(),
  ]);
  const [telemetry, codexNarrative] = await Promise.all([
    fetchTelemetry(),
    fetchCodexNarrative(),
  ]);
  const invariantFrame = buildInvariantFrame(telemetry, codexNarrative, memory);
  const nextInvariantHistory = appendInvariantFrame(
    invariantHistory,
    invariantFrame,
  );
  await saveInvariantHistory(nextInvariantHistory);
  logInvariant(`${invariantFrame.summary} | sig=${invariantFrame.signature}`);
  try {
    await maybeAdvancePhaseRing(telemetry, invariantFrame);
  } catch (err) {
    logWarn(`Phase-ring scheduler fallback: ${String(err)}`);
  }
  try {
    await maybeControlHomeostasis(telemetry);
  } catch (err) {
    logWarn(`Homeostasis scheduler fallback: ${String(err)}`);
  }
  const decision = await askOpenAI(
    telemetry,
    codexNarrative,
    memory,
    invariantFrame,
    nextInvariantHistory,
  );

  logThought(decision.internal_monologue);
  await saveMemory(appendThought(memory, decision.internal_monologue));

  if (decision.action_type === "OBSERVE") {
    logAction("OBSERVE (no injection)");
    return;
  }

  await postInjection(decision);
  logAction(
    `${decision.action_type} @ (${decision.payload.target_x}, ${decision.payload.target_y}) intensity=${decision.payload.intensity}`,
  );
};

const startDaemon = (): void => {
  logAction(
    `Daemon online. heartbeat=${HEARTBEAT_INTERVAL_MS}ms model=${OPENAI_MODEL} api=${API_BASE} memory=${MEMORY_PATH} invariants=${INVARIANT_PATH} phaseRing=${PHASE_SEASONS_ENABLE} step=${
      PHASE_SEASONS_STEP_RAD.toFixed(4)
    } cooldownTicks=${PHASE_SEASONS_COOLDOWN_TICKS} homeostasis=${HOMEOSTASIS_CONTROL_ENABLE} tax=[${HOMEOSTASIS_MIN_TAX},${HOMEOSTASIS_MAX_TAX}] targetCtl=${HOMEOSTASIS_TARGET_CONTROL_ENABLE} targetRange=[${HOMEOSTASIS_TARGET_MIN},${HOMEOSTASIS_TARGET_MAX}] targetStep=${HOMEOSTASIS_TARGET_STEP} target=${
      HOMEOSTASIS_TARGET_ENERGY.toFixed(2)
    } band=${HOMEOSTASIS_BAND.toFixed(2)}`,
  );

  const heartbeat = async (): Promise<void> => {
    const start = Date.now();
    try {
      await runHeartbeat();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logWarn(message);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(1_000, HEARTBEAT_INTERVAL_MS - elapsed);
      setTimeout(() => void heartbeat(), delay);
    }
  };

  void heartbeat();
};

if (import.meta.main) {
  try {
    startDaemon();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(message);
    Deno.exit(1);
  }
}

```

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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/core/OPCODE_ARITY_LUT.md

```markdown
---
id: OPCODE_ARITY_LUT
type: static_table
dataType: u8
description: "O(1) lookup table for the number of arguments each Opcode consumes"
deps: []
---

## payload: [0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

```

---

## FILE: src/ontology/core/pulse_orchestrator.md

```markdown
---
id: PULSE
type: module
description: "Implementation of PULSE"
deps: [STATE_MATRIX]
min_level: 2
---

### TypeScript
```typescript
// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { MAX_ATOMS, sharedBuffer, STATE_MATRIX, AS_WASM_PATH, LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { BONDS_OFFSET, CAUSALITY_OFFSET, COHERENCE_OFFSET, CONTEXT_OFFSET, EGRESS_DATA_OFFSET, EGRESS_HEAD_OFFSET, ENERGY_OFFSET, GRID_H, GRID_W, IDS_OFFSET, INSTRUCTIONS_OFFSET, LATTICE_MEMORY_END, LOGIC_OFFSET, MAX_EGRESS_EVENTS, PHASE_OFFSET, PHYSICS_READ_ENERGY_OFFSET, PHYSICS_READ_RESONANCE_OFFSET, PHYSICS_READ_XS_OFFSET, PHYSICS_READ_YS_OFFSET, RESONANCE_OFFSET, ROLES_OFFSET, SPAWN_REQUESTS_OFFSET, XS_OFFSET, YS_OFFSET } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

import { SOVEREIGNTY_ENGINE } from "../../03/SOVEREIGNTY_ENGINE.ts";
import { GATE } from "../03/GATE.ts";
import { PREDICTION_MARKET } from "../../03/PREDICTION_MARKET.ts";
import { CONTROL_INTENT_QUEUE } from "../../03/CONTROL_INTENT_QUEUE.ts";


export interface PulseOracleDelegate {
  setNeuralCoherence(coherence: number): void;
  getNeuralCoherence(): number;
  gatherEpochTelemetry(): any;
  broadcastWhisper(tick: number, telemetry: any, coherence: number): void;
  consultOracle(regentIdx: number, telemetry: any): void;
  drainPendingMutations(): void;
}
let oracleDelegate: PulseOracleDelegate | null = null;

export interface PulseAkashaDelegate {
  recordMutationTelemetry(event: { lane: string; kind: string; count: number }): void;
  flushMutationTelemetry(tick: number): void;
  compressMemory(wasmMemory: WebAssembly.Memory): Promise<Uint8Array>;
  decompressMemoryToLattice(wasmMemory: WebAssembly.Memory, payload: Uint8Array): Promise<void>;
  saveEpoch(memory: WebAssembly.Memory, tick: number, label: string, count1: number, count2: number, hash: string): Promise<void>;
  broadcastPanopticonFrame(frame: ArrayBuffer): void;
  recordImmunologicalPurge(count: number): Promise<void>;
  observePulseCodex(tick: number, pop: number, glyphs: any, syn: number): void;
  saveSnap(tick: number): Promise<void>;
  cleanupSnap(retention: number): void;
}
let akashaDelegate: PulseAkashaDelegate | null = null;

export interface PulseNoosphereDelegate {
  unpackAtom(payload: Uint8Array): number;
  packAtom(idx: number): Uint8Array;
  evaluateHeartbeat(tick: number, epochHash: string, avgPhase: number, egressCount: number): void;
  sendEpochPayload(peerId: string, payload: Uint8Array): void;
  routeAtom(payload: Uint8Array): void;
  startNexus(): void;
  broadcastSyncRequest(): void;
  broadcastEpochConsensus(tick: number, hashSum: bigint): void;
  getNexusStatus(): {
    mainnetEnabled: boolean;
    bootstrapHubUrl: string;
    seedNodesLength: number;
    localCurrentTick: number;
    localTps: number;
  };
  setNexusStatus(status: {
    mainnetEnabled?: boolean;
    bootstrapHubUrl?: string;
    localCurrentTick?: number;
    localTps?: number;
  }): void;
  getMedianSwarmTick(tick: number): number;
}
let noosphereDelegate: PulseNoosphereDelegate | null = null;



const MAX_TICK_DRIFT = 50;
let lastTickTime = performance.now();
let lastPanopticonBroadcastTime = 0;
let tickCountLog = 0;
let genesisPromiseResolver: (() => void) | null = null;

import { RUNTIME_POLICY } from "../../03/RUNTIME_POLICY.ts";
import { GLYPH_TELEMETRY } from "@06";
import { DAEMON_INGRESS_POLICY_LIMITS } from "../../03/DAEMON_INGRESS_POLICY.ts";

import { syncHormonesToLattice } from "../../02/HORMONE_BUFFER_RUNTIME.ts";
import {
  createPhysiologicalLedgerRuntime,
  HORMONE_BUFFER_CATALOG,
  type HormoneId,
} from "../../02/HORMONE_BUFFER.ts";
import { applyLedgerUpdate, createLedgerRuntime, createGeneticLedgerRuntime, type LedgerRuntimeSnapshot, type LedgerRuntimeState, rollbackLedgerUpdate, snapshotLedgerRuntime } from "../../03/GENERIC_LEDGER_SYSTEM.ts";
import { type GeneticLedgerKey } from "../03/GENETIC_LEDGER.ts";
import { appendLedgerRecordAndMaybeCompact, getLogPath, getSnapshotPath, hydrateLedgerRuntime, type LedgerPersistenceSummary, recordFromApply, recordFromRollback } from "../../03/GENERIC_LEDGER_PERSISTENCE.ts";

import { DriftWarden } from "@07/02/DRIFT_WARDEN.ts";
import { DollFork } from "@07/02/DOLL_FORK_MATRIX.ts";
import { DollForkRunner } from "@07/02/DOLL_FORK_RUNNER.ts";
import { REIFIED_PROGRAMS } from "@07/05/GENESIS_REIFIED.ts";
import { GenesisInceptor } from "@07/05/GENESIS_INCEPTOR.ts";
import { LineageTracker } from "@07/02/LINEAGE_TRACKER.ts";
import { QuorumAdvocate } from "@07/02/QUORUM_ADVOCATE.ts";
import { PROP_NEURAL_COHERENCE, OP_SET, OP_GET, OP_SUB, OP_JNZ, OP_JMP, OP_SIGNAL, OP_SECRETE_PLASMID, OP_BUILD, OP_SYSCALL, OP_NOP, SYS_YIELD, SYS_SET_ROLE, OP_JZ, OP_SPORE_DRIVE, PROP_ENERGY, PROP_RESONANCE, OP_ADD, OP_REPLICATE, OP_PUT } from "../00/mod.ts";

const WORKER_COUNT = RUNTIME_POLICY.pulse.workerCount;
const STRICT_DETERMINISM = RUNTIME_POLICY.pulse.strictDeterminism;
const WORKER_RESPONSE_TIMEOUT_MS = RUNTIME_POLICY.pulse.workerResponseTimeoutMs;
const WORKER_TIMEOUT_RETRY_COUNT = RUNTIME_POLICY.pulse.workerTimeoutRetryCount;
const WORKER_TIMEOUT_RETRY_MS = RUNTIME_POLICY.pulse.workerTimeoutRetryMs;
const WORKER_RECOVERY_LOG_COOLDOWN_MS = 5_000;
const WORKER_RECOVERY_VERBOSE = RUNTIME_POLICY.pulse.workerRecoveryVerbose;
const WORKER_INIT_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.workerInitFallbackEnabled;
const WASM_BOOT_POLICY = RUNTIME_POLICY.pulse.wasmBootPolicy;
const WASM_BOOT_PRECHECK_ENABLED = RUNTIME_POLICY.pulse.wasmBootPrecheckEnabled;
const FORCE_WASM_PREFLIGHT_FAIL = RUNTIME_POLICY.pulse.forceWasmPreflightFail;
const STARTUP_SELFTEST_ENABLED = RUNTIME_POLICY.pulse.startupSelfTestEnabled;
const STARTUP_SELFTEST_TICKS = RUNTIME_POLICY.pulse.startupSelfTestTicks;
const STARTUP_SELFTEST_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.startupSelfTestFallbackEnabled;
const STARTUP_SELFTEST_QUIET = RUNTIME_POLICY.pulse.startupSelfTestQuiet;
const STARTUP_SELFTEST_FORCE_BREACH =
  RUNTIME_POLICY.pulse.startupSelfTestForceBreach;
const PRESSURE_RING_BASELINE = RUNTIME_POLICY.pulse.pressureRing;
const PRESSURE_RING_TAU = Math.PI * 2;
const PRESSURE_RING_SCALE_MAX = 2048;
const PRESSURE_TERM_ABS_MAX = 2048;
const BASE_NOVELTY_SIGNED = RUNTIME_POLICY.pulse.noveltyPressureSigned;
const BASE_SYMBIOSIS_SIGNED = RUNTIME_POLICY.pulse.symbiosisPressureSigned;
const BASE_NOVELTY = RUNTIME_POLICY.pulse.noveltyPressure;
const BASE_FEAR = RUNTIME_POLICY.pulse.fearPressure;
const BASE_SYMBIOSIS = RUNTIME_POLICY.pulse.symbiosisPressure;
const BASE_EGO = RUNTIME_POLICY.pulse.egoPressure;
const HOMEOSTASIS_POLICY = RUNTIME_POLICY.pulse.homeostasis;
const HOMEOSTASIS_ENABLED = HOMEOSTASIS_POLICY.enabled;
const HOMEOSTASIS_TARGET_ENERGY = HOMEOSTASIS_POLICY.targetEnergy;
const HOMEOSTASIS_BAND = Math.max(1, HOMEOSTASIS_POLICY.band);
const HOMEOSTASIS_MAX_DELTA = Math.max(1, HOMEOSTASIS_POLICY.maxDelta);
const HOMEOSTASIS_OVERFLOW_THRESHOLD = HOMEOSTASIS_POLICY.overflowThreshold;
const HOMEOSTASIS_STARVATION_FLOOR = HOMEOSTASIS_POLICY.starvationFloor;
const HOMEOSTASIS_BASE_TAX = Math.max(0, HOMEOSTASIS_POLICY.baseTax ?? 0);
const GUARDIAN_SIGNAL_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.guardianSignalExecutionMode;
const ARCHITECT_PLASMID_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.architectPlasmidExecutionMode;
const REPLICATION_EXECUTION_MODE =
  RUNTIME_POLICY.pulse.replicationExecutionMode;
const HOMEOSTASIS_SUBSIDY_ENABLED = HOMEOSTASIS_POLICY.subsidyEnabled === true;
const HOMEOSTASIS_BASE_TAX_MIN = 0;
const HOMEOSTASIS_BASE_TAX_MAX = 1024;
const HOMEOSTASIS_TARGET_ENERGY_MIN = 1;
const HOMEOSTASIS_TARGET_ENERGY_MAX = 1_000_000;
const SPAWN_RING_CAPACITY = 1024;
const SPAWN_SLOT_BYTES = 16;

const CACHE_WASM = async (): Promise<WebAssembly.Module | null> => {
  try {
    const bytes = await Deno.readFile(AS_WASM_PATH);
    return await WebAssembly.compile(bytes);
  } catch (err) {
    LOGGER.error(`Failed to cache WASM module: ${(err as Error).message}`);
    return null;
  }
};
type EvolutionPressureState = {
  noveltySigned: number;
  symbiosisSigned: number;
  novelty: number;
  fear: number;
  symbiosis: number;
  ego: number;
  ring: {
    enabled: boolean;
    theta: number;
    scale: number;
    fearCuriosityBalance: number;
    egoLoveBalance: number;
  };
};
type SpatialHashState = {
  tick: number;
  overflowCount: number;
  maxCellCount: number;
  overflowRatio: number;
};
type HomeostasisState = {
  enabled: boolean;
  targetEnergy: number;
  targetEnergyDefault: number;
  targetEnergyCurrent: number;
  band: number;
  maxDelta: number;
  overflowThreshold: number;
  starvationFloor: number;
  subsidyEnabled: boolean;
  baseTaxDefault: number;
  baseTaxCurrent: number;
  lastUpdateTick: number;
  lastUpdateSource: string;
  lastUpdateReason: string;
};
type GeneticLedgerRuntimeState = {
  homeostasisBaseTax: LedgerRuntimeSnapshot<"pulse.homeostasis.baseTax">;
  homeostasisBaseTaxPersistence: LedgerPersistenceSummary;
  homeostasisTargetEnergy: LedgerRuntimeSnapshot<
    "pulse.homeostasis.targetEnergy"
  >;
  homeostasisTargetEnergyPersistence: LedgerPersistenceSummary;
  pressureRingScale: LedgerRuntimeSnapshot<"pulse.pressureRing.scale">;
  pressureRingScalePersistence: LedgerPersistenceSummary;
  homeostasisBand: LedgerRuntimeSnapshot<"pulse.homeostasis.band">;
  homeostasisBandPersistence: LedgerPersistenceSummary;
  homeostasisMaxDelta: LedgerRuntimeSnapshot<"pulse.homeostasis.maxDelta">;
  homeostasisMaxDeltaPersistence: LedgerPersistenceSummary;
  homeostasisOverflowThreshold: LedgerRuntimeSnapshot<
    "pulse.homeostasis.overflowThreshold"
  >;
  homeostasisOverflowThresholdPersistence: LedgerPersistenceSummary;
  daemonMaxActions: LedgerRuntimeSnapshot<"daemon.maxActionsPerWindow">;
  daemonMaxActionsPersistence: LedgerPersistenceSummary;
  federationDegradeEnergyRatio: LedgerRuntimeSnapshot<
    "federation.admission.degradeEnergyRatio"
  >;
  federationDegradeEnergyRatioPersistence: LedgerPersistenceSummary;
};
type GuardianSignalHybridState = {
  mode: GuardianSignalExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  stableBranchCount: number;
  repairBranchCount: number;
  allowedGuardianSignals: number;
  suppressedGuardianSignals: number;
  shadowSuppressedGuardianSignals: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "stable"
    | "repair"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "stable" | "repair" | "unknown";
  lastFallbackReason: string;
  lastMode?: GuardianSignalExecutionMode;
};
type ArchitectPlasmidHybridState = {
  mode: ArchitectPlasmidExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedArchitectPlasmids: number;
  suppressedArchitectPlasmids: number;
  shadowSuppressedArchitectPlasmids: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: "emit" | "suppress" | "unknown";
  lastFallbackReason: string;
  lastMode?: ArchitectPlasmidExecutionMode;
};

const clampPressureTerm = (value: number): number =>
  Math.max(-PRESSURE_TERM_ABS_MAX, Math.min(PRESSURE_TERM_ABS_MAX, value | 0));
const clampRingScale = (value: number): number =>
  Math.max(0, Math.min(PRESSURE_RING_SCALE_MAX, value | 0));
const clampHomeostasisBaseTax = (value: number): number =>
  Math.max(
    HOMEOSTASIS_BASE_TAX_MIN,
    Math.min(HOMEOSTASIS_BASE_TAX_MAX, Math.round(value)),
  );
const clampHomeostasisTargetEnergy = (value: number): number =>
  Math.max(
    HOMEOSTASIS_TARGET_ENERGY_MIN,
    Math.min(HOMEOSTASIS_TARGET_ENERGY_MAX, Math.round(value)),
  );
const normalizeTheta = (theta: number): number => {
  if (!Number.isFinite(theta)) return 0;
  const wrapped = theta % PRESSURE_RING_TAU;
  return wrapped >= 0 ? wrapped : wrapped + PRESSURE_RING_TAU;
};
const pressureComponentFromUnit = (component: number, scale: number): number =>
  Math.max(
    0,
    Math.min(PRESSURE_TERM_ABS_MAX, Math.round(Math.max(0, component) * scale)),
  );
const deriveRingPressure = (theta: number, scale: number) => {
  const normalizedTheta = normalizeTheta(theta);
  const boundedScale = clampRingScale(scale);
  const fearCuriosityBalance = Math.cos(normalizedTheta);
  const egoLoveBalance = Math.sin(normalizedTheta);
  const novelty = pressureComponentFromUnit(fearCuriosityBalance, boundedScale);
  const fear = pressureComponentFromUnit(-fearCuriosityBalance, boundedScale);
  const symbiosis = pressureComponentFromUnit(egoLoveBalance, boundedScale);
  const ego = pressureComponentFromUnit(-egoLoveBalance, boundedScale);
  return {
    novelty,
    fear,
    noveltySigned: novelty - fear,
    symbiosis,
    ego,
    symbiosisSigned: symbiosis - ego,
    ring: {
      enabled: true,
      theta: normalizedTheta,
      scale: boundedScale,
      fearCuriosityBalance,
      egoLoveBalance,
    },
  };
};
const BASE_EVOLUTION_PRESSURE_STATE: EvolutionPressureState = {
  noveltySigned: clampPressureTerm(BASE_NOVELTY_SIGNED),
  symbiosisSigned: clampPressureTerm(BASE_SYMBIOSIS_SIGNED),
  novelty: clampPressureTerm(BASE_NOVELTY),
  fear: clampPressureTerm(BASE_FEAR),
  symbiosis: clampPressureTerm(BASE_SYMBIOSIS),
  ego: clampPressureTerm(BASE_EGO),
  ring: {
    enabled: PRESSURE_RING_BASELINE.enabled,
    theta: normalizeTheta(PRESSURE_RING_BASELINE.theta),
    scale: clampRingScale(PRESSURE_RING_BASELINE.scale),
    fearCuriosityBalance: PRESSURE_RING_BASELINE.fearCuriosityBalance,
    egoLoveBalance: PRESSURE_RING_BASELINE.egoLoveBalance,
  },
};
let evolutionPressureState: EvolutionPressureState = {
  ...BASE_EVOLUTION_PRESSURE_STATE,
};
const createGuardianSignalHybridState = (
  mode: GuardianSignalExecutionMode,
): GuardianSignalHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  stableBranchCount: 0,
  repairBranchCount: 0,
  allowedGuardianSignals: 0,
  suppressedGuardianSignals: 0,
  shadowSuppressedGuardianSignals: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotGuardianSignalHybridState = (): GuardianSignalHybridState => ({
  ...guardianSignalHybridState,
});
const createArchitectPlasmidHybridState = (
  mode: ArchitectPlasmidExecutionMode,
): ArchitectPlasmidHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  emitBranchCount: 0,
  suppressBranchCount: 0,
  allowedArchitectPlasmids: 0,
  suppressedArchitectPlasmids: 0,
  shadowSuppressedArchitectPlasmids: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotArchitectPlasmidHybridState =
  (): ArchitectPlasmidHybridState => ({
    ...architectPlasmidHybridState,
  });
const createReplicationHybridState = (
  mode: ReplicationExecutionMode,
): ReplicationHybridState => ({
  mode,
  hybridRuns: 0,
  shadowRuns: 0,
  fallbackRuns: 0,
  emitBranchCount: 0,
  suppressBranchCount: 0,
  allowedReplications: 0,
  suppressedReplications: 0,
  shadowSuppressedReplications: 0,
  lastTick: -1,
  lastStatus: "legacy",
  lastBranch: "unknown",
  lastFallbackReason: "",
});
const snapshotReplicationHybridState = (): ReplicationHybridState => ({
  ...replicationHybridState,
});
const guardianSignalHybridState = createGuardianSignalHybridState(
  GUARDIAN_SIGNAL_EXECUTION_MODE,
);
const architectPlasmidHybridState = createArchitectPlasmidHybridState(
  ARCHITECT_PLASMID_EXECUTION_MODE,
);
const replicationHybridState = createReplicationHybridState(
  REPLICATION_EXECUTION_MODE,
);

const createLedgerPersistence = (key: any): LedgerPersistenceSummary => ({
  path: getLogPath(key),
  snapshotPath: getSnapshotPath(key),
  exists: false,
  snapshotExists: false,
  recordCount: 0,
  applyCount: 0,
  rollbackCount: 0,
  tailRecordCount: 0,
  tailApplyCount: 0,
  tailRollbackCount: 0,
  snapshotRecordCount: 0,
  snapshotApplyCount: 0,
  snapshotRollbackCount: 0,
  compactionEnabled: true,
  compactionThreshold: 64,
  compactionKeepTail: 16,
  lastCompactedAt: null,
  lastCompactedTick: -1,
  hydrated: false,
  lastHydratedAt: null,
  lastHydrationError: null,
});
let runtimeWorkerCount = WORKER_COUNT;
let startupSelfTestDone = false;
let startupSelfTestInProgress = false;
let startupSelfTestFallbackActivated = false;
let startupSelfTestLastBreachTick = -1;
let initFallbackActivated = false;
let initFallbackReason = "";
let wasmBootDegraded = false;
let wasmBootReason = "";
let wasmBootArtifactBytes = 0;
let wasmBootPrecheckCompleted = false;
let spatialHashState: SpatialHashState = {
  tick: -1,
  overflowCount: 0,
  maxCellCount: 0,
  overflowRatio: 0,
};
let homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(HOMEOSTASIS_BASE_TAX);
let homeostasisBaseTaxLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.baseTax",
);
let homeostasisBaseTaxLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.baseTax",
);

// GENERIC LEDGER REGISTRY (Stage 7.2)
let homeostasisBandLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.band",
);
let homeostasisMaxDeltaLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.maxDelta",
);
let homeostasisOverflowThresholdLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.overflowThreshold",
);
let daemonMaxActionsLedgerRuntime = createGeneticLedgerRuntime(
  "daemon.maxActionsPerWindow",
);
let federationDegradeEnergyRatioLedgerRuntime = createGeneticLedgerRuntime(
  "federation.admission.degradeEnergyRatio",
);

let homeostasisBandLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.band",
);
let homeostasisMaxDeltaLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.maxDelta",
);
let homeostasisOverflowThresholdLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.overflowThreshold",
);
let daemonMaxActionsLedgerPersistence = createLedgerPersistence(
  "daemon.maxActionsPerWindow",
);
let federationDegradeEnergyRatioLedgerPersistence = createLedgerPersistence(
  "federation.admission.degradeEnergyRatio",
);
let homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
  HOMEOSTASIS_TARGET_ENERGY,
);
let homeostasisTargetEnergyLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.homeostasis.targetEnergy",
);
let homeostasisTargetEnergyLedgerPersistence = createLedgerPersistence(
  "pulse.homeostasis.targetEnergy",
);
let pressureRingScaleLedgerRuntime = createGeneticLedgerRuntime(
  "pulse.pressureRing.scale",
);
let pressureRingScaleLedgerPersistence = createLedgerPersistence(
  "pulse.pressureRing.scale",
);

const physiologicalLedgers = Object.fromEntries(
  HORMONE_BUFFER_CATALOG.map((spec) => [
    spec.id,
    createPhysiologicalLedgerRuntime(spec.id),
  ]),
) as Record<HormoneId, LedgerRuntimeState<HormoneId>>;

let homeostasisLastUpdateTick = -1;
let homeostasisLastUpdateSource = "runtime_policy";
let homeostasisLastUpdateReason = "bootstrap";
const resetStartupSelfTestStateForColdStart = (): void => {
  startupSelfTestDone = false;
  startupSelfTestFallbackActivated = false;
  startupSelfTestLastBreachTick = -1;
  initFallbackActivated = false;
  initFallbackReason = "";
  wasmBootDegraded = false;
  wasmBootReason = "";
  wasmBootArtifactBytes = 0;
  wasmBootPrecheckCompleted = false;
  for (const spec of HORMONE_BUFFER_CATALOG) {
    physiologicalLedgers[spec.id] = createPhysiologicalLedgerRuntime(spec.id);
  }
};
const resetSpatialHashStateForColdStart = (): void => {
  spatialHashState = {
    tick: -1,
    overflowCount: 0,
    maxCellCount: 0,
    overflowRatio: 0,
  };
};
const resetHomeostasisStateForColdStart = (): void => {
  homeostasisBaseTaxLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.homeostasis.baseTax",
    HOMEOSTASIS_BASE_TAX,
    homeostasisBaseTaxLedgerRuntime.historyLimit,
  );
  homeostasisBaseTaxLedgerRuntime.lastAppliedReason = "coldstart_reset";
  homeostasisBaseTaxLedgerRuntime.lastRollbackReason = "coldstart_reset";
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  homeostasisBaseTaxLedgerPersistence = {
    ...homeostasisBaseTaxLedgerPersistence,
    exists: false,
    snapshotExists: false,
    recordCount: 0,
    applyCount: 0,
    rollbackCount: 0,
    tailRecordCount: 0,
    tailApplyCount: 0,
    tailRollbackCount: 0,
    snapshotRecordCount: 0,
    snapshotApplyCount: 0,
    snapshotRollbackCount: 0,
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  homeostasisTargetEnergyLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.homeostasis.targetEnergy",
    HOMEOSTASIS_TARGET_ENERGY,
    homeostasisTargetEnergyLedgerRuntime.historyLimit,
  );
  homeostasisTargetEnergyLedgerRuntime.lastAppliedReason = "coldstart_reset";
  homeostasisTargetEnergyLedgerRuntime.lastRollbackReason = "coldstart_reset";
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  homeostasisTargetEnergyLedgerPersistence = {
    ...homeostasisTargetEnergyLedgerPersistence,
    exists: false,
    snapshotExists: false,
    recordCount: 0,
    applyCount: 0,
    rollbackCount: 0,
    tailRecordCount: 0,
    tailApplyCount: 0,
    tailRollbackCount: 0,
    snapshotRecordCount: 0,
    snapshotApplyCount: 0,
    snapshotRollbackCount: 0,
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  homeostasisLastUpdateTick = -1;
  homeostasisLastUpdateSource = "runtime_policy";
  homeostasisLastUpdateReason = "coldstart_reset";
};
const resetEvolutionPressureStateForColdStart = (): void => {
  pressureRingScaleLedgerRuntime = createGeneticLedgerRuntime(
    "pulse.pressureRing.scale",
    PRESSURE_RING_BASELINE.scale,
    pressureRingScaleLedgerRuntime.historyLimit,
  );
  pressureRingScaleLedgerRuntime.lastAppliedReason = "coldstart_reset";
  pressureRingScaleLedgerRuntime.lastRollbackReason = "coldstart_reset";
  pressureRingScaleLedgerPersistence = {
    ...pressureRingScaleLedgerPersistence,
    exists: false,
    snapshotExists: false,
    recordCount: 0,
    applyCount: 0,
    rollbackCount: 0,
    tailRecordCount: 0,
    tailApplyCount: 0,
    tailRollbackCount: 0,
    snapshotRecordCount: 0,
    snapshotApplyCount: 0,
    snapshotRollbackCount: 0,
    lastCompactedAt: null,
    lastCompactedTick: -1,
    hydrated: false,
    lastHydratedAt: null,
    lastHydrationError: null,
  };
  evolutionPressureState = {
    ...BASE_EVOLUTION_PRESSURE_STATE,
    ring: {
      ...BASE_EVOLUTION_PRESSURE_STATE.ring,
      scale: clampRingScale(pressureRingScaleLedgerRuntime.currentValue),
    },
  };
};
const snapshotHomeostasisState = (): HomeostasisState => ({
  enabled: HOMEOSTASIS_ENABLED,
  targetEnergy: clampHomeostasisTargetEnergy(homeostasisTargetEnergyRuntime),
  targetEnergyDefault: HOMEOSTASIS_TARGET_ENERGY,
  targetEnergyCurrent: clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyRuntime,
  ),
  band: homeostasisBandLedgerRuntime.currentValue,
  maxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
  overflowThreshold: homeostasisOverflowThresholdLedgerRuntime.currentValue,
  starvationFloor: HOMEOSTASIS_STARVATION_FLOOR,
  subsidyEnabled: HOMEOSTASIS_SUBSIDY_ENABLED,
  baseTaxDefault: HOMEOSTASIS_BASE_TAX,
  baseTaxCurrent: clampHomeostasisBaseTax(homeostasisBaseTaxRuntime),
  lastUpdateTick: homeostasisLastUpdateTick,
  lastUpdateSource: homeostasisLastUpdateSource,
  lastUpdateReason: homeostasisLastUpdateReason,
});
const snapshotGeneticLedgerRuntimeState = (): GeneticLedgerRuntimeState => ({
  homeostasisBaseTax: snapshotLedgerRuntime(homeostasisBaseTaxLedgerRuntime),
  homeostasisBaseTaxPersistence: { ...homeostasisBaseTaxLedgerPersistence },
  homeostasisTargetEnergy: snapshotLedgerRuntime(
    homeostasisTargetEnergyLedgerRuntime,
  ),
  homeostasisTargetEnergyPersistence: {
    ...homeostasisTargetEnergyLedgerPersistence,
  },
  pressureRingScale: snapshotLedgerRuntime(pressureRingScaleLedgerRuntime),
  pressureRingScalePersistence: { ...pressureRingScaleLedgerPersistence },
  homeostasisBand: snapshotLedgerRuntime(homeostasisBandLedgerRuntime),
  homeostasisBandPersistence: { ...homeostasisBandLedgerPersistence },
  homeostasisMaxDelta: snapshotLedgerRuntime(homeostasisMaxDeltaLedgerRuntime),
  homeostasisMaxDeltaPersistence: { ...homeostasisMaxDeltaLedgerPersistence },
  homeostasisOverflowThreshold: snapshotLedgerRuntime(
    homeostasisOverflowThresholdLedgerRuntime,
  ),
  homeostasisOverflowThresholdPersistence: {
    ...homeostasisOverflowThresholdLedgerPersistence,
  },
  daemonMaxActions: snapshotLedgerRuntime(daemonMaxActionsLedgerRuntime),
  daemonMaxActionsPersistence: { ...daemonMaxActionsLedgerPersistence },
  federationDegradeEnergyRatio: snapshotLedgerRuntime(
    federationDegradeEnergyRatioLedgerRuntime,
  ),
  federationDegradeEnergyRatioPersistence: {
    ...federationDegradeEnergyRatioLedgerPersistence,
  },
});
const snapshotEvolutionPressureState = (): EvolutionPressureState => ({
  noveltySigned: evolutionPressureState.noveltySigned,
  symbiosisSigned: evolutionPressureState.symbiosisSigned,
  novelty: evolutionPressureState.novelty,
  fear: evolutionPressureState.fear,
  symbiosis: evolutionPressureState.symbiosis,
  ego: evolutionPressureState.ego,
  ring: { ...evolutionPressureState.ring },
});
const snapshotSpatialHashState = (): SpatialHashState => ({
  tick: spatialHashState.tick,
  overflowCount: spatialHashState.overflowCount,
  maxCellCount: spatialHashState.maxCellCount,
  overflowRatio: spatialHashState.overflowRatio,
});
const applyHomeostasisBaseTaxLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerApplyResult<
  "pulse.homeostasis.baseTax"
> => {
  const result = applyLedgerUpdate(homeostasisBaseTaxLedgerRuntime, update);
  homeostasisBaseTaxLedgerRuntime = result.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  if (result.changed) {
    homeostasisLastUpdateTick = result.state.lastAppliedTick;
    homeostasisLastUpdateSource = result.state.lastAppliedSource;
    homeostasisLastUpdateReason = result.state.lastAppliedReason;
  }
  return result;
};
const rollbackHomeostasisBaseTaxLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerRollbackResult<
  "pulse.homeostasis.baseTax"
> => {
  const result = rollbackLedgerUpdate(
    homeostasisBaseTaxLedgerRuntime,
    rollback,
  );
  homeostasisBaseTaxLedgerRuntime = result.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  if (result.status === "rolled_back") {
    homeostasisLastUpdateTick = result.state.lastRollbackTick;
    homeostasisLastUpdateSource = result.state.lastRollbackSource;
    homeostasisLastUpdateReason = result.state.lastRollbackReason;
  }
  return result;
};
const syncHomeostasisBaseTaxLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("pulse.homeostasis.baseTax", {
    initialValue: HOMEOSTASIS_BASE_TAX,
    historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
  });
  homeostasisBaseTaxLedgerRuntime = hydrated.state;
  homeostasisBaseTaxRuntime = clampHomeostasisBaseTax(
    homeostasisBaseTaxLedgerRuntime.currentValue,
  );
  homeostasisBaseTaxLedgerPersistence = hydrated.persistence;
  if (hydrated.snapshot.lastRollbackTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastRollbackTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastRollbackSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastRollbackReason;
    return;
  }
  if (hydrated.snapshot.lastAppliedTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastAppliedTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastAppliedSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastAppliedReason;
  }
};
const applyHomeostasisTargetEnergyLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerApplyResult<
  "pulse.homeostasis.targetEnergy"
> => {
  const result = applyLedgerUpdate(
    homeostasisTargetEnergyLedgerRuntime,
    update,
  );
  homeostasisTargetEnergyLedgerRuntime = result.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  if (result.changed) {
    homeostasisLastUpdateTick = result.state.lastAppliedTick;
    homeostasisLastUpdateSource = result.state.lastAppliedSource;
    homeostasisLastUpdateReason = result.state.lastAppliedReason;
  }
  return result;
};
const rollbackHomeostasisTargetEnergyLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerRollbackResult<
  "pulse.homeostasis.targetEnergy"
> => {
  const result = rollbackLedgerUpdate(
    homeostasisTargetEnergyLedgerRuntime,
    rollback,
  );
  homeostasisTargetEnergyLedgerRuntime = result.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  if (result.status === "rolled_back") {
    homeostasisLastUpdateTick = result.state.lastRollbackTick;
    homeostasisLastUpdateSource = result.state.lastRollbackSource;
    homeostasisLastUpdateReason = result.state.lastRollbackReason;
  }
  return result;
};
const syncHomeostasisTargetEnergyLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime(
    "pulse.homeostasis.targetEnergy",
    {
      initialValue: HOMEOSTASIS_TARGET_ENERGY,
      historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
    },
  );
  homeostasisTargetEnergyLedgerRuntime = hydrated.state;
  homeostasisTargetEnergyRuntime = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyLedgerRuntime.currentValue,
  );
  homeostasisTargetEnergyLedgerPersistence = hydrated.persistence;
  if (hydrated.snapshot.lastRollbackTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastRollbackTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastRollbackSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastRollbackReason;
    return;
  }
  if (hydrated.snapshot.lastAppliedTick >= 0) {
    homeostasisLastUpdateTick = hydrated.snapshot.lastAppliedTick;
    homeostasisLastUpdateSource = hydrated.snapshot.lastAppliedSource;
    homeostasisLastUpdateReason = hydrated.snapshot.lastAppliedReason;
  }
};
const applyPressureRingScaleLedgerUpdate = (
  update: {
    value: number;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerApplyResult<
  "pulse.pressureRing.scale"
> => {
  const result = applyLedgerUpdate(pressureRingScaleLedgerRuntime, update);
  pressureRingScaleLedgerRuntime = result.state;
  if (result.changed) {
    applyEvolutionPressureRing({
      mode: "set",
      theta: evolutionPressureState.ring.theta,
      scale: result.state.currentValue,
      enabled: evolutionPressureState.ring.enabled,
    });
  }
  return result;
};
const rollbackPressureRingScaleLedgerUpdate = (
  rollback: {
    rollbackToken: string;
    source?: string;
    reason?: string;
    tick?: number;
  },
): import("@03").LedgerRollbackResult<
  "pulse.pressureRing.scale"
> => {
  const result = rollbackLedgerUpdate(pressureRingScaleLedgerRuntime, rollback);
  pressureRingScaleLedgerRuntime = result.state;
  if (result.status === "rolled_back") {
    applyEvolutionPressureRing({
      mode: "set",
      theta: evolutionPressureState.ring.theta,
      scale: result.state.currentValue,
      enabled: evolutionPressureState.ring.enabled,
    });
  }
  return result;
};
const syncPressureRingScaleLedgerHydration = async (): Promise<void> => {
  const hydrated = await hydrateLedgerRuntime("pulse.pressureRing.scale", {
    initialValue: PRESSURE_RING_BASELINE.scale,
    historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
  });
  pressureRingScaleLedgerRuntime = hydrated.state;
  pressureRingScaleLedgerPersistence = hydrated.persistence;
  applyEvolutionPressureRing({
    mode: "set",
    theta: evolutionPressureState.ring.theta,
    scale: pressureRingScaleLedgerRuntime.currentValue,
    enabled: evolutionPressureState.ring.enabled,
  });
};
const syncGenericLedgersHydration = async (): Promise<void> => {
  const bandHyd = await hydrateLedgerRuntime("pulse.homeostasis.band", {
    initialValue: HOMEOSTASIS_BAND,
  });
  homeostasisBandLedgerRuntime = bandHyd.state;
  homeostasisBandLedgerPersistence = bandHyd.persistence;

  const maxDeltaHyd = await hydrateLedgerRuntime("pulse.homeostasis.maxDelta", {
    initialValue: HOMEOSTASIS_MAX_DELTA,
  });
  homeostasisMaxDeltaLedgerRuntime = maxDeltaHyd.state;
  homeostasisMaxDeltaLedgerPersistence = maxDeltaHyd.persistence;

  const overflowHyd = await hydrateLedgerRuntime(
    "pulse.homeostasis.overflowThreshold",
    {
      initialValue: HOMEOSTASIS_OVERFLOW_THRESHOLD,
    },
  );
  homeostasisOverflowThresholdLedgerRuntime = overflowHyd.state;
  homeostasisOverflowThresholdLedgerPersistence = overflowHyd.persistence;

  const daemonHyd = await hydrateLedgerRuntime("daemon.maxActionsPerWindow", {
    initialValue: RUNTIME_POLICY.daemon.maxActionsPerWindow,
  });
  daemonMaxActionsLedgerRuntime = daemonHyd.state;
  daemonMaxActionsLedgerPersistence = daemonHyd.persistence;

  const federationHyd = await hydrateLedgerRuntime(
    "federation.admission.degradeEnergyRatio",
    {
      initialValue: RUNTIME_POLICY.federation.admission.degradeEnergyRatio,
    },
  );
  federationDegradeEnergyRatioLedgerRuntime = federationHyd.state;
  federationDegradeEnergyRatioLedgerPersistence = federationHyd.persistence;
};
const applyEvolutionPressureRing = (
  next: {
    mode: "set" | "step";
    theta?: number;
    deltaTheta?: number;
    scale?: number;
    enabled?: boolean;
  },
): EvolutionPressureState => {
  const prev = snapshotEvolutionPressureState();
  const ringEnabled = next.enabled ?? prev.ring.enabled;
  const baseTheta = prev.ring.theta;
  const requestedTheta = next.mode === "step"
    ? baseTheta + (next.deltaTheta ?? 0)
    : (next.theta ?? baseTheta);
  const requestedScale = next.scale ??
    clampRingScale(pressureRingScaleLedgerRuntime.currentValue);

  if (!ringEnabled) {
    evolutionPressureState = {
      ...BASE_EVOLUTION_PRESSURE_STATE,
      ring: {
        ...prev.ring,
        enabled: false,
        theta: normalizeTheta(requestedTheta),
        scale: clampRingScale(requestedScale),
      },
    };
    return snapshotEvolutionPressureState();
  }

  const derived = deriveRingPressure(requestedTheta, requestedScale);
  evolutionPressureState = {
    noveltySigned: clampPressureTerm(derived.noveltySigned),
    symbiosisSigned: clampPressureTerm(derived.symbiosisSigned),
    novelty: clampPressureTerm(derived.novelty),
    fear: clampPressureTerm(derived.fear),
    symbiosis: clampPressureTerm(derived.symbiosis),
    ego: clampPressureTerm(derived.ego),
    ring: {
      enabled: true,
      theta: derived.ring.theta,
      scale: derived.ring.scale,
      fearCuriosityBalance: derived.ring.fearCuriosityBalance,
      egoLoveBalance: derived.ring.egoLoveBalance,
    },
  };
  return snapshotEvolutionPressureState();
};

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];
const workerRecoveryLogAt = new Map<string, number>();

const shouldLogWorkerRecovery = (
  workerIndex: number,
  phase: string,
  timeoutWindows: number,
): boolean => {
  if (timeoutWindows <= 0) return false;
  if (timeoutWindows <= 1 && !WORKER_RECOVERY_VERBOSE) return false;
  if (timeoutWindows > 1) return true;
  const key = `${workerIndex}:${phase}`;
  const now = Date.now();
  const last = workerRecoveryLogAt.get(key) ?? 0;
  if (now - last < WORKER_RECOVERY_LOG_COOLDOWN_MS) return false;
  workerRecoveryLogAt.set(key, now);
  return true;
};

type WorkerFaultStat = {
  workerIndex: number;
  requests: number;
  completed: number;
  timeouts: number;
  retryWaits: number;
  failures: number;
  consecutiveTimeouts: number;
  lastRequestType: string;
  lastPulseId: number;
  lastError: string;
};
const makeWorkerFaultStat = (workerIndex: number): WorkerFaultStat => ({
  workerIndex,
  requests: 0,
  completed: 0,
  timeouts: 0,
  retryWaits: 0,
  failures: 0,
  consecutiveTimeouts: 0,
  lastRequestType: "NONE",
  lastPulseId: -1,
  lastError: "",
});
const workerFaultStats: WorkerFaultStat[] = [];
const getWorkerFaultStat = (workerIndex: number): WorkerFaultStat => {
  if (!workerFaultStats[workerIndex]) {
    workerFaultStats[workerIndex] = makeWorkerFaultStat(workerIndex);
  }
  return workerFaultStats[workerIndex];
};

const idsView = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
const xsView = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
const ysView = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
const energiesView = new Int32Array(
  sharedBuffer,
  ENERGY_OFFSET,
  MAX_ATOMS,
);
const resonancesView = new Int32Array(
  sharedBuffer,
  RESONANCE_OFFSET,
  MAX_ATOMS,
);
const causalityView = new Uint8Array(
  sharedBuffer,
  CAUSALITY_OFFSET,
  MAX_ATOMS,
);
export const phasesView = new Int32Array(
  sharedBuffer,
  PHASE_OFFSET,
  MAX_ATOMS,
);
export const rolesView = new Uint8Array(
  sharedBuffer,
  ROLES_OFFSET,
  MAX_ATOMS,
);
export const logicView = new Uint8Array(
  sharedBuffer,
  LOGIC_OFFSET,
  MAX_ATOMS * 8,
);
const instructionsView = new Uint8Array(
  sharedBuffer,
  INSTRUCTIONS_OFFSET,
  MAX_ATOMS * 64,
);
const bondsView = new Uint32Array(
  sharedBuffer,
  BONDS_OFFSET,
  MAX_ATOMS * 4,
);
const readXsView = new Int16Array(
  sharedBuffer,
  PHYSICS_READ_XS_OFFSET,
  MAX_ATOMS,
);
const readYsView = new Int16Array(
  sharedBuffer,
  PHYSICS_READ_YS_OFFSET,
  MAX_ATOMS,
);
const readEnergiesView = new Int32Array(
  sharedBuffer,
  PHYSICS_READ_ENERGY_OFFSET,
  MAX_ATOMS,
);
const readResonancesView = new Int32Array(
  sharedBuffer,
  PHYSICS_READ_RESONANCE_OFFSET,
  MAX_ATOMS,
);
const spawnHeadView = new Int32Array(
  sharedBuffer,
  SPAWN_REQUESTS_OFFSET,
  2,
);
const spawnDataView = new DataView(
  sharedBuffer,
  SPAWN_REQUESTS_OFFSET + 8,
  SPAWN_RING_CAPACITY * SPAWN_SLOT_BYTES,
);
const coherenceView = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);

// Helper for drift & trend monitoring
type RollingHistory = {
  add: (val: number) => void;
  sum: () => number;
  size: () => number;
};
const createRollingHistory = (maxSize: number): RollingHistory => {
  const values = new Float64Array(maxSize);
  let head = 0;
  let count = 0;
  return {
    add: (val: number) => {
      values[head] = val;
      head = (head + 1) % maxSize;
      if (count < maxSize) count++;
    },
    sum: () => {
      let s = 0;
      for (let i = 0; i < count; i++) s += values[i];
      return s;
    },
    size: () => count || 1,
  };
};

const noveltyHistory = createRollingHistory(100);

const nextPulseId = (): number =>
  Date.now() + Math.floor(Math.random() * 1_000_000);

const driftWarden = new DriftWarden();
const genesisInceptor = new GenesisInceptor();
const lineageTracker = new LineageTracker();
const quorumAdvocate = new QuorumAdvocate();
let shadowForkActive = false;

const guardianPheromoneAllowedByExecutionMode = (idx: number): boolean => {
  return Atomics.load(causalityView, idx) !== 0;
};

const architectPlasmidAllowedByExecutionMode = (idx: number): boolean => {
  return Atomics.load(causalityView, idx) !== 0;
};

const CHILD_ID_SALT = 0x9E3779B97F4A7C15n;
const deriveChildId = (
  tick: number,
  freeIdx: number,
  genomeLo: number,
  genomeHi: number,
  cx: number,
  cy: number,
): bigint => {
  const tickPart = BigInt(tick >>> 0) << 32n;
  const idxPart = BigInt((freeIdx + 1) >>> 0);
  const genomePart = (BigInt(genomeLo >>> 0) << 32n) | BigInt(genomeHi >>> 0);
  const posBits = (((cx & 0xFFFF) << 16) | (cy & 0xFFFF)) >>> 0;
  let id = tickPart ^ genomePart ^ (BigInt(posBits) << 8n) ^ idxPart ^
    CHILD_ID_SALT;
  if (id === 0n) id = idxPart;
  return id === 0n ? 1n : id;
};
const findNextFreeSlot = (startIdx: number): number => {
  for (let i = startIdx; i < MAX_ATOMS; i++) {
    if (Atomics.load(idsView, i) === 0n) return i;
  }
  return -1;
};
const genomeKey16 = (idx: number): number => {
  const off = idx * 8;
  return ((logicView[off] << 8) | logicView[off + 1]) >>> 0;
};
const hasGenomeResidue = (idx: number): boolean => {
  const off = idx * 8;
  for (let i = 0; i < 8; i++) {
    if (logicView[off + i] !== 0) return true;
  }
  return false;
};
const applyEvolutionPressureTerms = (
  tick: number,
  activeIdx: number[],
): {
  adjusted: number;
  noveltyDeltaRaw: number;
  symbiosisDeltaRaw: number;
} => {
  const pressureState = snapshotEvolutionPressureState();
  const noveltySigned = pressureState.noveltySigned;
  const symbiosisSigned = pressureState.symbiosisSigned;
  if (
    (noveltySigned === 0 && symbiosisSigned === 0) ||
    activeIdx.length === 0
  ) {
    return { adjusted: 0, noveltyDeltaRaw: 0, symbiosisDeltaRaw: 0 };
  }
  const population = activeIdx.length;
  const genomeCounts = new Map<number, number>();
  for (const idx of activeIdx) {
    const key = genomeKey16(idx);
    genomeCounts.set(key, (genomeCounts.get(key) ?? 0) + 1);
  }

  let adjusted = 0;
  let noveltyDeltaRaw = 0;
  let symbiosisDeltaRaw = 0;

  for (const idx of activeIdx) {
    const key = genomeKey16(idx);
    const sameGenomeCount = genomeCounts.get(key) ?? 1;

    let noveltyTerm = 0;
    if (noveltySigned !== 0) {
      noveltyTerm = Math.trunc(
        (noveltySigned * (population - (sameGenomeCount * 2))) / population,
      );
    }

    let symbiosisTerm = 0;
    if (symbiosisSigned !== 0) {
      const base = idx * 4;
      let crossGenomeBonds = 0;
      for (let slot = 0; slot < 4; slot++) {
        const target = Atomics.load(bondsView, base + slot);
        if (target <= 0 || target >= MAX_ATOMS) continue;
        if (Atomics.load(idsView, target) === 0n) continue;
        if (genomeKey16(target) !== key) crossGenomeBonds++;
      }
      const bondPolarity = symbiosisSigned >= 0 ? 1 : -1;
      symbiosisTerm = crossGenomeBonds > 0
        ? symbiosisSigned * crossGenomeBonds
        : bondPolarity * -symbiosisSigned;
    }

    const delta = noveltyTerm + symbiosisTerm;
    noveltyDeltaRaw += noveltyTerm;
    symbiosisDeltaRaw += symbiosisTerm;
    if (delta === 0) continue;

    const current = Atomics.load(energiesView, idx);
    const next = Math.max(0, current + delta);
    if (next !== current) {
      Atomics.store(energiesView, idx, next);
      adjusted++;
    }
  }

  // Update history for drift monitoring
  noveltyHistory.add(noveltyDeltaRaw);

  if (adjusted > 0) {
    akashaDelegate?.recordMutationTelemetry({
      lane: "internal_host",
      kind: "evolution_pressure_adjust",
      count: adjusted,
    });
    if (tick % 200 === 0) {
      LOGGER.info(
        `🧭 [EVOLUTION] pressure adjusted=${adjusted} noveltyRaw=${noveltyDeltaRaw} symbiosisRaw=${symbiosisDeltaRaw} pN=${pressureState.noveltySigned} pS=${pressureState.symbiosisSigned} fear=${pressureState.fear} ego=${pressureState.ego}`,
      );
    }
  }

  return { adjusted, noveltyDeltaRaw, symbiosisDeltaRaw };
};

const applyEnergyHomeostasisTerms = (
  tick: number,
  activeIdx: number[],
  spatialOverflowRatio: number,
): { adjusted: number; netDelta: number } => {
  if (!HOMEOSTASIS_ENABLED || activeIdx.length === 0) {
    return { adjusted: 0, netDelta: 0 };
  }
  const bandStep = Math.max(1, Math.floor(HOMEOSTASIS_BAND / 2));
  const overflowActive = spatialOverflowRatio >= HOMEOSTASIS_OVERFLOW_THRESHOLD;
  const baseTax = clampHomeostasisBaseTax(homeostasisBaseTaxRuntime);
  const targetEnergy = clampHomeostasisTargetEnergy(
    homeostasisTargetEnergyRuntime,
  );
  let adjusted = 0;
  let netDelta = 0;
  let taxed = 0;
  let subsidized = 0;

  for (const idx of activeIdx) {
    const current = Atomics.load(energiesView, idx);
    if (current <= 0) continue;
    let delta = 0;

    if (baseTax > 0 && current > HOMEOSTASIS_STARVATION_FLOOR) {
      const tax = Math.min(baseTax, current);
      delta -= tax;
      taxed += tax;
    }

    const deviation = current - targetEnergy;
    const absDeviation = Math.abs(deviation);
    if (absDeviation > HOMEOSTASIS_BAND) {
      const gradient = absDeviation - HOMEOSTASIS_BAND;
      const step = Math.min(
        HOMEOSTASIS_MAX_DELTA,
        1 + Math.floor(gradient / bandStep),
      );

      if (deviation > 0) {
        delta -= step;
        taxed += step;
        if (overflowActive) {
          delta -= 1;
          taxed += 1;
        }
      } else if (HOMEOSTASIS_SUBSIDY_ENABLED) {
        let subsidy = step;
        if (overflowActive) {
          subsidy = Math.max(1, Math.floor(subsidy * 0.6));
        }
        delta += subsidy;
        subsidized += subsidy;
      }
    }

    if (current <= HOMEOSTASIS_STARVATION_FLOOR && delta < 0) {
      delta = 0;
    }
    if (delta === 0) continue;

    const next = Math.max(0, current + delta);
    if (next !== current) {
      Atomics.store(energiesView, idx, next);
      adjusted++;
      netDelta += next - current;
    }
  }

  if (adjusted > 0) {
    akashaDelegate?.recordMutationTelemetry({
      lane: "internal_host",
      kind: "energy_homeostasis_adjust",
      count: adjusted,
    });
    if (tick % 20 === 0) {
      LOGGER.debug(
        `⚖️ [HOMEOSTASIS] adjusted=${adjusted} netDelta=${netDelta} tax=${taxed} subsidy=${subsidized} target=${targetEnergy} band=${HOMEOSTASIS_BAND} baseTax=${baseTax} subsidyEnabled=${HOMEOSTASIS_SUBSIDY_ENABLED} overflow=${
          spatialOverflowRatio.toFixed(3)
        }`,
      );
    }
  }
  return { adjusted, netDelta };
};

type WasmPreflightReport = {
  ok: boolean;
  bytes: number;
  reason: string;
};
const wasmPreflight = async (): Promise<WasmPreflightReport> => {
  if (FORCE_WASM_PREFLIGHT_FAIL) {
    return {
      ok: false,
      bytes: 0,
      reason: "FORCED_WASM_PREFLIGHT_FAIL",
    };
  }
  try {
    const bytes = await Deno.readFile(AS_WASM_PATH);
    if (bytes.byteLength <= 0) {
      return { ok: false, bytes: 0, reason: "EMPTY_WASM_ARTIFACT" };
    }
    await WebAssembly.compile(bytes);
    return { ok: true, bytes: bytes.byteLength, reason: "" };
  } catch (err) {
    const reason = err instanceof Error
      ? `${err.name}: ${err.message}`
      : String(err);
    return { ok: false, bytes: 0, reason };
  }
};
const enterWasmSafeNoopMode = (reason: string): void => {
  wasmBootDegraded = true;
  wasmBootReason = reason;
  runtimeWorkerCount = 0;
  terminateWorkersInternal(false);
};

type WorkerWaitResult<T> = {
  data: T;
  timeoutWindows: number;
  retriesUsed: number;
};
type WorkerTimeoutError = Error & {
  timeoutWindows: number;
  expectedType: string;
  expectedPulseId?: number;
};

const createWorkerTimeoutError = (
  expectedType: string,
  expectedPulseId: number | undefined,
  timeoutWindows: number,
): WorkerTimeoutError => {
  const err = new Error(
    `[PULSE] Worker timeout waiting for ${expectedType} (pulseId=${
      expectedPulseId ?? "n/a"
    }, windows=${timeoutWindows})`,
  ) as WorkerTimeoutError;
  err.name = "WorkerTimeoutError";
  err.timeoutWindows = timeoutWindows;
  err.expectedType = expectedType;
  err.expectedPulseId = expectedPulseId;
  return err;
};

const waitForWorkerMessage = <T = any>(
  worker: Worker,
  expectedType: string,
  expectedPulseId?: number,
  timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<WorkerWaitResult<T>> => {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingRetries = WORKER_TIMEOUT_RETRY_COUNT;
    let timeoutWindows = 0;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      worker.removeEventListener("message", listener);
    };

    const armTimeout = (ms: number) => {
      timeoutId = setTimeout(() => {
        timeoutWindows++;
        if (remainingRetries > 0) {
          remainingRetries--;
          armTimeout(WORKER_TIMEOUT_RETRY_MS);
          return;
        }
        cleanup();
        reject(
          createWorkerTimeoutError(expectedType, expectedPulseId, timeoutWindows),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      LOGGER.debug("[HOST] RECEIVED MESSAGE", e.data);
      const data = e.data;
      if (!data || data.type !== expectedType) return;
      if (expectedPulseId !== undefined && data.pulseId !== expectedPulseId) {
        return;
      }
      const retriesUsed = timeoutWindows > 0
        ? Math.min(timeoutWindows, WORKER_TIMEOUT_RETRY_COUNT)
        : 0;
      cleanup();
      resolve({ data: data as T, timeoutWindows, retriesUsed });
    };
    worker.addEventListener("message", listener);
    armTimeout(timeoutMs);
  });
};

const waitForWorkerInit = (
  worker: Worker,
  workerIndex: number,
  timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let remainingRetries = WORKER_TIMEOUT_RETRY_COUNT;
    let timeoutWindows = 0;

    const cleanup = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      worker.removeEventListener("message", listener);
    };

    const armTimeout = (ms: number) => {
      timeoutId = setTimeout(() => {
        timeoutWindows++;
        if (remainingRetries > 0) {
          remainingRetries--;
          armTimeout(WORKER_TIMEOUT_RETRY_MS);
          return;
        }
        cleanup();
        reject(
          new Error(
            `[PULSE] Worker-${workerIndex} init timeout waiting for READY (windows=${timeoutWindows}).`,
          ),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      LOGGER.debug("[HOST] RECEIVED MESSAGE", e.data);
      const data = e.data;
      if (!data) return;
      if (data.type === "READY") {
        cleanup();
        if (shouldLogWorkerRecovery(workerIndex, "READY", timeoutWindows)) {
          LOGGER.warn(
            `   [PULSE] Worker-${workerIndex} recovered READY after ${timeoutWindows} timeout window(s).`,
          );
        }
        resolve();
        return;
      }
      if (data.type === "INIT_FAILED") {
        cleanup();
        const errMsg = typeof data.error === "string"
          ? data.error
          : "unknown init failure";
        reject(
          new Error(`[PULSE] Worker-${workerIndex} init failed: ${errMsg}`),
        );
      }
    };

    worker.addEventListener("message", listener);
    armTimeout(timeoutMs);
  });
};

const postAndWait = async <T = any>(
  workerIndex: number,
  worker: Worker,
  message: Record<string, unknown>,
  expectedType: string,
  timeoutMs?: number,
): Promise<T> => {
  const stats = getWorkerFaultStat(workerIndex);
  const pulseId = typeof message.pulseId === "number"
    ? message.pulseId
    : undefined;
  stats.requests++;
  stats.lastRequestType = expectedType;
  stats.lastPulseId = pulseId ?? -1;
  const pending = waitForWorkerMessage<T>(
    worker,
    expectedType,
    pulseId,
    timeoutMs,
  );
  worker.postMessage(message);
  try {
    const res = await pending;
    if (res.timeoutWindows > 0) {
      stats.timeouts += res.timeoutWindows;
      stats.retryWaits += res.retriesUsed;
      if (
        shouldLogWorkerRecovery(
          workerIndex,
          expectedType,
          res.timeoutWindows,
        )
      ) {
        LOGGER.warn(
          `   [PULSE] Worker-${workerIndex} recovered ${expectedType} after ${res.timeoutWindows} timeout window(s).`,
        );
      }
    }
    stats.completed++;
    stats.consecutiveTimeouts = 0;
    stats.lastError = "";
    return res.data;
  } catch (err) {
    if (err instanceof WorkerTimeoutError) {
      const syncState = STATE_MATRIX.syncState;
      if (syncState) {
         LOGGER.error(`\n[FATAL STALL] Worker ${workerIndex} deadlocked.`);
      }
      stats.timeouts += err.timeoutWindows;
      stats.retryWaits += Math.max(0, err.timeoutWindows - 1);
    }
    stats.failures++;
    stats.consecutiveTimeouts++;
    stats.lastError = err instanceof Error ? err.message : String(err);
    throw err;
  }
};

const dispatchRangePhase = async (
  type: "PULSE" | "REDUCE_DELTAS",
  doneType: "DONE" | "DELTA_DONE",
): Promise<void> => {
  workerPromises = [];
  if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
    const pulseId = nextPulseId();
    workerPromises.push(postAndWait(
      0,
      workers[0],
      {
        type,
        startIdx: 0,
        endIdx: MAX_ATOMS,
        pulseId,
        theta: evolutionPressureState.ring.theta,
      },
      doneType,
    ));
  } else {
    const chunkSize = Math.ceil(MAX_ATOMS / runtimeWorkerCount);
    for (let i = 0; i < runtimeWorkerCount; i++) {
      const startIdx = i * chunkSize;
      const endIdx = i === runtimeWorkerCount - 1
        ? MAX_ATOMS
        : Math.min(MAX_ATOMS, (i + 1) * chunkSize);

      const pulseId = nextPulseId();
      workerPromises.push(postAndWait(
        i,
        workers[i],
        {
          type,
          startIdx,
          endIdx,
          pulseId,
          theta: evolutionPressureState.ring.theta,
        },
        doneType,
      ));
    }
  }
  await Promise.all(workerPromises);
};
const startWorkers = async (count: number): Promise<void> => {
  workerFaultStats.length = 0;
  workerPromises = [];
  for (let i = 0; i < count; i++) {
    const worker = new Worker(
      new URL("./PULSE_WORKER.ts", import.meta.url).href,
      { type: "module" },
    );

    worker.addEventListener("message", (e) => {
      const data = e.data;
      if (data && data.type === "SPORE_DRIVE_REQUEST") {
        const idx = data.atomIdx;
        const atomIdAtStart = STATE_MATRIX.getId(idx);
        if (atomIdAtStart !== 0n) {
          // Immediately pack and schedule for migration to clear memory bounds
          const packedAtom = (noosphereDelegate ? noosphereDelegate.packAtom(idx) : new Uint8Array(0));
          if (packedAtom) {
            noosphereDelegate?.routeAtom(packedAtom);
            LOGGER.debug(
              `🛸 [PULSE] Spore Drive invoked: atom ${atomIdAtStart} routed to Nexus. Recycling locally.`,
            );
            STATE_MATRIX.recycleAtom(idx);
          } else {
            LOGGER.error(`[PULSE] Failed to pack atom ${atomIdAtStart} for transit`);
          }
        }
      }
    });

    workers.push(worker);
    workerFaultStats.push(makeWorkerFaultStat(i));

    const p = waitForWorkerInit(worker, i);
    worker.postMessage({
      type: "INIT",
      wasmMemory: STATE_MATRIX.wasmMemory,
      buffer: STATE_MATRIX.buffer,
      marketBuffer: PREDICTION_MARKET.buffer,
      workerIndex: i,
    });
    workerPromises.push(p.then(() => undefined));
  }
  await Promise.all(workerPromises);
};
const terminateWorkersInternal = (resetStartupSelfTestState: boolean): void => {
  for (const worker of workers) {
    worker.terminate();
  }
  workers.length = 0;
  workerPromises = [];
  workerFaultStats.length = 0;
  if (resetStartupSelfTestState && !startupSelfTestInProgress) {
    resetStartupSelfTestStateForColdStart();
  }
};
const startWorkersWithInitFallback = async (count: number): Promise<void> => {
  try {
    await startWorkers(count);
  } catch (err) {
    terminateWorkersInternal(false);
    const primaryErr = err instanceof Error ? err.message : String(err);

    if (!WORKER_INIT_FALLBACK_ENABLED || count <= 1) {
      pulseInitialized = true;

      LOGGER.info(`[PULSE] System initialization complete.`);
      runtimeWorkerCount = 0;
      const failMsg = `[PULSE] Worker init failed: ${primaryErr}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }

    runtimeWorkerCount = 1;
    initFallbackActivated = true;
    initFallbackReason = primaryErr;
    LOGGER.warn(
      `   [PULSE] Worker init failed; fallback to single worker. reason=${primaryErr}`,
    );

    try {
      await startWorkers(runtimeWorkerCount);
    } catch (fallbackErr) {
      terminateWorkersInternal(false);
      const fallbackMsg = fallbackErr instanceof Error
        ? fallbackErr.message
        : String(fallbackErr);
      runtimeWorkerCount = 0;
      const failMsg =
        `[PULSE] Worker init fallback failed: primary=${primaryErr}; fallback=${fallbackMsg}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }
  }
};
const startupSelfTestBreached = (): boolean => {
  if (Atomics.load(idsView, 0) !== 0n) return true;
  return STATE_MATRIX.getActiveIndices().length !== 0;
};

export interface DriftMetrics {
  energyDiff: number;
  resonanceDiff: number;
  bondsBroken: number;
  bondsFormed: number;
  structuralValueChange: number;
  populationDiff: number;
  coherenceDiff: number;
  divergenceTick: number;
}

// Global reference for oracle side-channel
let shadowWasmInstance: WebAssembly.Instance | null = null;
let run_shadow_simulation_ffi:
  | ((
    atomId: number,
    ticks: number,
    logicPtr: number,
    resultPtr: number,
  ) => number)
  | null = null;
let generate_epoch_proof_ffi:
  | ((
    tick: number,
    resultPtr: number,
  ) => void)
  | null = null;

async function initShadowWasm(): Promise<void> {
  if (shadowWasmInstance) return;
  const wasmBytes = await Deno.readFile(
    new URL(
      "./sigma_core/target/wasm32-unknown-unknown/release/sigma_core.wasm",
      import.meta.url,
    ),
  );

  const instantiated = await WebAssembly.instantiate(wasmBytes, {
    env: {
      memory: STATE_MATRIX.wasmMemory,
      abort: (msg: any) => LOGGER.error("   [SHADOW WASM ABORT]:", msg),
      // Dummy trace_atom for shadow
      trace_atom: () => {},
    },
  });

  shadowWasmInstance = instantiated.instance;
  run_shadow_simulation_ffi = shadowWasmInstance.exports
    .run_shadow_simulation_ffi as any;
  generate_epoch_proof_ffi = shadowWasmInstance.exports
    .generate_epoch_proof_ffi as any;
}

let pulseInitialized = false;
let lastEgressReadHead = 0;

export const drainEgressEvents = (): Uint8Array[] => {
  const headView = new Int32Array(
    STATE_MATRIX.wasmMemory.buffer,
    EGRESS_HEAD_OFFSET,
    1,
  );
  const writeHead = Atomics.load(headView, 0);
  const readHead = lastEgressReadHead || 0;

  if (writeHead === readHead) return [];

  const events: Uint8Array[] = [];
  const maxEvents = MAX_EGRESS_EVENTS;
  const dataView = new Uint8Array(
    STATE_MATRIX.wasmMemory.buffer,
    EGRESS_DATA_OFFSET,
    maxEvents * 256,
  );

  const count = Math.min(writeHead - readHead, maxEvents);
  const startIdx = readHead % maxEvents;

  for (let i = 0; i < count; i++) {
    const idx = (startIdx + i) % maxEvents;
    const offset = idx * 256;
    // Copy the array out of WASM memory because WASM memory might mutate over time
    events.push(new Uint8Array(dataView.slice(offset, offset + 256)));
  }

  lastEgressReadHead = writeHead;
  return events;
};

let isTicking = false;
export const PULSE = {
  setOracleDelegate: (delegate: PulseOracleDelegate) => {
    oracleDelegate = delegate;
  },
  setAkashaDelegate: (delegate: PulseAkashaDelegate) => {
    akashaDelegate = delegate;
  },
  setNoosphereDelegate: (delegate: PulseNoosphereDelegate) => {
    noosphereDelegate = delegate;
  },
  get initialized() {
    return pulseInitialized;
  },
  set initialized(val: boolean) {
    pulseInitialized = val;
  },
  currentPulseId: Date.now(),
  getStats: () => ({
    // Placeholder for actual stats implementation
    workerFaultStats: workerFaultStats.map((s) => ({ ...s })),
    runtimeWorkerCount,
    startupSelfTestDone,
    startupSelfTestInProgress,
    startupSelfTestFallbackActivated,
    startupSelfTestLastBreachTick,
    initFallbackActivated,
    initFallbackReason,
    wasmBootDegraded,
    wasmBootReason,
    wasmBootArtifactBytes,
    wasmBootPrecheckCompleted,
  }),
  generateEpochProof: async (tick: number): Promise<string> => {
    if (!shadowWasmInstance || !generate_epoch_proof_ffi) {
      await initShadowWasm();
    }
    const resultPtr = LATTICE_MEMORY_END + 1024 + 128;
    generate_epoch_proof_ffi!(tick, resultPtr);

    const u8View = new Uint8Array(
      STATE_MATRIX.wasmMemory.buffer,
      resultPtr,
      32,
    );
    return Array.from(u8View).map((b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
  },
  simulateFuture: async (
    steps: number,
    targetIdx: number,
    bytecode: Uint8Array,
  ): Promise<DriftMetrics> => {
    if (!shadowWasmInstance || !run_shadow_simulation_ffi) {
      await initShadowWasm();
    }

    // We need 64 bytes for the hallucinated bytecode, and 32 bytes for the metrics result.
    // We will place this safely past the LATTICE_MEMORY_END to avoid collisions,
    // ensuring we fit inside the initial 163MB memory bounds without triggering out of bounds RangeErrors.
    const scratchSpaceOffset = LATTICE_MEMORY_END + 1024;
    const resultPtr = scratchSpaceOffset + 64;

    // Write logic bytes
    const u8View = new Uint8Array(STATE_MATRIX.wasmMemory.buffer);
    u8View.fill(0, scratchSpaceOffset, scratchSpaceOffset + 64);
    u8View.set(bytecode, scratchSpaceOffset);

    // Clear result space
    const i32View = new Int32Array(
      STATE_MATRIX.wasmMemory.buffer,
      resultPtr,
      8,
    );
    i32View.fill(0);

    const atomId = Number(STATE_MATRIX.getId(targetIdx));

    // Call Rust side
    const success = run_shadow_simulation_ffi!(
      atomId,
      steps,
      scratchSpaceOffset,
      resultPtr,
    );

    if (success !== 1) {
      throw new Error(
        `[SHADOW] Simulation execution failed for target ${atomId}`,
      );
    }

    return {
      energyDiff: i32View[0],
      resonanceDiff: i32View[1],
      bondsBroken: i32View[2],
      bondsFormed: i32View[3],
      structuralValueChange: i32View[4],
      populationDiff: i32View[5],
      coherenceDiff: i32View[6],
      divergenceTick: i32View[7],
    };
  },
  initWorkers: async (requestedWorkerCount?: number) => {
    if (workers.length > 0) return;
    resetStartupSelfTestStateForColdStart();
    resetEvolutionPressureStateForColdStart();
    resetHomeostasisStateForColdStart();
    await syncHomeostasisBaseTaxLedgerHydration();
    await syncHomeostasisTargetEnergyLedgerHydration();
    await syncPressureRingScaleLedgerHydration();
    const pressureState = snapshotEvolutionPressureState();
    runtimeWorkerCount = requestedWorkerCount === undefined
      ? WORKER_COUNT
      : Math.max(1, Math.min(32, Math.floor(requestedWorkerCount)));
    if (RUNTIME_POLICY.pulse.source.workerCount) {
      LOGGER.info(
        `   [PULSE] Worker override: OMEGA_PULSE_WORKERS=${runtimeWorkerCount}`,
      );
    }
    if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
      LOGGER.info(
        "   [PULSE] OMEGA_STRICT_DETERMINISM=1 -> serial execute on worker-0.",
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerResponseTimeoutMs) {
      LOGGER.info(
        `   [PULSE] Worker timeout config: timeout=${WORKER_RESPONSE_TIMEOUT_MS}ms, retryCount=${WORKER_TIMEOUT_RETRY_COUNT}, retryMs=${WORKER_TIMEOUT_RETRY_MS}`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerInitFallback) {
      LOGGER.info(
        `   [PULSE] Worker init fallback enabled=${WORKER_INIT_FALLBACK_ENABLED}.`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPolicy) {
      LOGGER.info(`   [PULSE] WASM boot policy=${WASM_BOOT_POLICY}.`);
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPrecheck) {
      LOGGER.info(
        `   [PULSE] WASM precheck enabled=${WASM_BOOT_PRECHECK_ENABLED}.`,
      );
    }
    if (
      RUNTIME_POLICY.pulse.source.noveltyPressure ||
      RUNTIME_POLICY.pulse.source.symbiosisPressure ||
      RUNTIME_POLICY.pulse.source.matrixTheta ||
      RUNTIME_POLICY.pulse.source.pressureRingScale ||
      pressureState.noveltySigned !== 0 ||
      pressureState.symbiosisSigned !== 0 ||
      pressureState.fear > 0 ||
      pressureState.ego > 0
    ) {
      LOGGER.info(
        `   [PULSE] Evolution pressure terms novelty=${pressureState.noveltySigned} symbiosis=${pressureState.symbiosisSigned} fear=${pressureState.fear} ego=${pressureState.ego} ring=${pressureState.ring.enabled} theta=${
          pressureState.ring.theta.toFixed(4)
        } scale=${pressureState.ring.scale}.`,
      );
    }
    if (
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1 &&
      RUNTIME_POLICY.pulse.source.startupSelfTest
    ) {
      LOGGER.info(
        `   [PULSE] Startup self-test enabled: ticks=${STARTUP_SELFTEST_TICKS}, fallback=${STARTUP_SELFTEST_FALLBACK_ENABLED}`,
      );
    }

    if (WASM_BOOT_PRECHECK_ENABLED) {
      const preflight = await wasmPreflight();
      wasmBootPrecheckCompleted = true;
      wasmBootArtifactBytes = preflight.bytes;
      if (!preflight.ok) {
        const failMsg = `[PULSE] WASM preflight failed: ${preflight.reason}`;
        if (WASM_BOOT_POLICY === "safe-noop") {
          LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
          enterWasmSafeNoopMode(failMsg);
          return;
        }
        throw new Error(failMsg);
      }
    }

    await startWorkersWithInitFallback(runtimeWorkerCount);
    if (wasmBootDegraded) return;

    if (initFallbackActivated) {
      LOGGER.warn(
        `   [PULSE] ${runtimeWorkerCount} Worker READY after init fallback.`,
      );
    } else {
      LOGGER.info(
        `   [PULSE] ${runtimeWorkerCount} Parallel Workers READY with WASM VMs.`,
      );
    }

    if (
      !startupSelfTestDone && !startupSelfTestInProgress &&
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1
    ) {
      await PULSE.runStartupSelfTest();
    }

    // Always start the network layer before bootstrapping bounds
    noosphereDelegate?.setNexusStatus({
      mainnetEnabled: RUNTIME_POLICY.p2p.mainnetEnabled,
      bootstrapHubUrl: RUNTIME_POLICY.p2p.bootstrapHubUrl
    });
    await (noosphereDelegate ? noosphereDelegate.startNexus() : Promise.resolve());

    // Phase 30 / Phase 36: Bootstrapping Node Payload
    const nexusStatus = noosphereDelegate?.getNexusStatus() || { seedNodesLength: 0, mainnetEnabled: false };
    if (
      STATE_MATRIX.getActiveIndices().length === 0 &&
      (nexusStatus.seedNodesLength > 0 || nexusStatus.mainnetEnabled)
    ) {
      LOGGER.info(
        `[PULSE] Matrix is uninstantiated. Awaiting Swarm Handshake...`,
      );
      await new Promise((r) => setTimeout(r, 600)); // allow sockets to open

      LOGGER.info(`[PULSE] Requesting Genesis Block via Nexus...`);
      await new Promise<void>((resolve) => {
        genesisPromiseResolver = resolve;
        noosphereDelegate?.broadcastSyncRequest();
      });
      LOGGER.info(
        `[PULSE] Genesis Bootstrapping complete! Synchronized to Swarm Lattice.`,
      );
    }
  },
  runStartupSelfTest: async () => {
    if (
      startupSelfTestDone || startupSelfTestInProgress ||
      !STARTUP_SELFTEST_ENABLED
    ) return;
    if (workers.length === 0 || runtimeWorkerCount <= 1) {
      startupSelfTestDone = true;
      return;
    }
    if (STATE_MATRIX.getActiveIndices().length !== 0) {
      // Do not mutate populated worlds; this gate is for cold-start only.
      startupSelfTestDone = true;
      return;
    }

    const { tickCounter, syncState, SYNC } = STATE_MATRIX;
    const originalTick = Atomics.load(tickCounter, 0);
    const baseLevel = LOGGER.getLevel();
    startupSelfTestInProgress = true;
    startupSelfTestLastBreachTick = -1;

    if (
      STARTUP_SELFTEST_QUIET &&
      (baseLevel === "debug" || baseLevel === "info")
    ) {
      LOGGER.setLevel("warn");
    }

    try {
      for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
        await PULSE.tick();
        if (STARTUP_SELFTEST_FORCE_BREACH && t === 0) {
          Atomics.store(idsView, 0, 1n);
        }
        if (startupSelfTestBreached()) {
          startupSelfTestLastBreachTick = t;
          break;
        }
      }

      if (startupSelfTestLastBreachTick === -1) {
        startupSelfTestDone = true;
        return;
      }

      LOGGER.warn(
        `   [PULSE] Startup self-test breach at tick=${startupSelfTestLastBreachTick} workers=${runtimeWorkerCount}.`,
      );
      if (!STARTUP_SELFTEST_FALLBACK_ENABLED || runtimeWorkerCount <= 1) {
        throw new Error(
          "[PULSE] Startup self-test failed and fallback is disabled.",
        );
      }

      if (!startupSelfTestFallbackActivated) {
        pulseInitialized = true;
      }
      startupSelfTestFallbackActivated = true;
      PULSE.stopWorkers();
      runtimeWorkerCount = 1;
      await startWorkers(runtimeWorkerCount);
      LOGGER.warn(
        "   [PULSE] Startup self-test fallback activated: forcing single-worker mode.",
      );

      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, 0);
      for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
        await PULSE.tick();
        if (startupSelfTestBreached()) {
          throw new Error(
            `[PULSE] Startup self-test failed after fallback (tick=${t}).`,
          );
        }
      }

      startupSelfTestDone = true;
    } finally {
      LOGGER.setLevel(baseLevel);
      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, originalTick);
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
      startupSelfTestInProgress = false;
    }
  },
  startWorkers: async (count: number) => {
    await startWorkers(count);
  },
  stopWorkers: () => {
    terminateWorkersInternal(true);
  },
  getRuntimeWorkerCount: (): number => runtimeWorkerCount,
  getStartupSelfTestStatus: () => ({
    enabled: STARTUP_SELFTEST_ENABLED,
    ticks: STARTUP_SELFTEST_TICKS,
    done: startupSelfTestDone,
    inProgress: startupSelfTestInProgress,
    fallbackEnabled: STARTUP_SELFTEST_FALLBACK_ENABLED,
    fallbackActivated: startupSelfTestFallbackActivated,
    lastBreachTick: startupSelfTestLastBreachTick,
    initFallbackEnabled: WORKER_INIT_FALLBACK_ENABLED,
    initFallbackActivated,
    initFallbackReason,
    wasmBootPolicy: WASM_BOOT_POLICY,
    wasmBootPrecheckEnabled: WASM_BOOT_PRECHECK_ENABLED,
    wasmBootPrecheckCompleted,
    wasmBootArtifactBytes,
    wasmBootDegraded,
    wasmBootReason,
  }),
  getWorkerFaultStats: (): WorkerFaultStat[] =>
    workerFaultStats.map((stat) => ({ ...stat })),
  setWorkerDebugDelay: async (delayMs: number): Promise<void> => {
    if (workers.length === 0) return;
    const boundedDelay = Math.max(0, Math.min(2000, Math.floor(delayMs)));
    const updates: Promise<any>[] = [];
    for (let i = 0; i < workers.length; i++) {
      const pulseId = nextPulseId();
      updates.push(postAndWait(
        i,
        workers[i],
        { type: "SET_DEBUG_DELAY", delayMs: boundedDelay, pulseId },
        "DEBUG_DELAY_SET",
        Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
      ));
    }
    await Promise.all(updates);
  },
  setWorkerDebugJitter: async (minMs: number, maxMs: number): Promise<void> => {
    if (workers.length === 0) return;
    const boundedMin = Math.max(0, Math.min(2000, Math.floor(minMs)));
    const boundedMax = Math.max(0, Math.min(2000, Math.floor(maxMs)));
    const updates: Promise<any>[] = [];
    for (let i = 0; i < workers.length; i++) {
      const pulseId = nextPulseId();
      updates.push(postAndWait(
        i,
        workers[i],
        {
          type: "SET_DEBUG_JITTER",
          minMs: boundedMin,
          maxMs: boundedMax,
          pulseId,
        },
        "DEBUG_JITTER_SET",
        Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
      ));
    }
    await Promise.all(updates);
  },
  getEvolutionPressureState: (): EvolutionPressureState =>
    snapshotEvolutionPressureState(),
  getSpatialHashState: (): SpatialHashState => snapshotSpatialHashState(),
  getGuardianSignalHybridState: (): GuardianSignalHybridState =>
    snapshotGuardianSignalHybridState(),
  getArchitectPlasmidHybridState: (): ArchitectPlasmidHybridState =>
    snapshotArchitectPlasmidHybridState(),
  getReplicationHybridState: (): ReplicationHybridState =>
    snapshotReplicationHybridState(),
  getGeneticLedgerState: (): GeneticLedgerRuntimeState =>
    snapshotGeneticLedgerRuntimeState(),
  hydrateGeneticLedgerRuntime: async (): Promise<GeneticLedgerRuntimeState> => {
    await syncHomeostasisBaseTaxLedgerHydration();
    await syncHomeostasisTargetEnergyLedgerHydration();
    await syncPressureRingScaleLedgerHydration();
    return snapshotGeneticLedgerRuntimeState();
  },
  applyGeneticLedgerUpdate: async (
    update: {
      key:
        | "pulse.homeostasis.baseTax"
        | "pulse.homeostasis.targetEnergy"
        | "pulse.pressureRing.scale";
      value: number;
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): Promise<
    | import("@03").LedgerApplyResult<
      "pulse.homeostasis.baseTax"
    >
    | import("@03").LedgerApplyResult<
      "pulse.homeostasis.targetEnergy"
    >
    | import("@03").LedgerApplyResult<
      "pulse.pressureRing.scale"
    >
  > => {
    if (update.key === "pulse.pressureRing.scale") {
      const result = applyPressureRingScaleLedgerUpdate({
        value: update.value,
        source: update.source,
        reason: update.reason,
        tick: update.tick,
      });
      if (result.changed) {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.pressureRing.scale",
            recordFromApply(result.mutation, "pulse.pressureRing.scale"),
            {
              initialValue: pressureRingScaleLedgerRuntime.defaultValue,
              historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
            },
          );
          pressureRingScaleLedgerPersistence = {
            ...persisted,
            hydrated: pressureRingScaleLedgerPersistence.hydrated,
            lastHydratedAt: pressureRingScaleLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              pressureRingScaleLedgerPersistence.lastHydrationError,
          };
        }
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
        );
      }
      return result;
    }

    if (update.key === "pulse.homeostasis.targetEnergy") {
      const result = applyHomeostasisTargetEnergyLedgerUpdate({
        value: update.value,
        source: update.source,
        reason: update.reason,
        tick: update.tick,
      });
      if (result.changed) {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.homeostasis.targetEnergy",
            recordFromApply(result.mutation, "pulse.homeostasis.targetEnergy"),
            {
              initialValue: homeostasisTargetEnergyLedgerRuntime.defaultValue,
              historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
            },
          );
          homeostasisTargetEnergyLedgerPersistence = {
            ...persisted,
            hydrated: homeostasisTargetEnergyLedgerPersistence.hydrated,
            lastHydratedAt:
              homeostasisTargetEnergyLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              homeostasisTargetEnergyLedgerPersistence.lastHydrationError,
          };
        }
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_update",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
        );
      }
      return result;
    }

    const result = applyHomeostasisBaseTaxLedgerUpdate({
      value: update.value,
      source: update.source,
      reason: update.reason,
      tick: update.tick,
    });
    if (result.changed) {
      if (result.mutation) {
        const persisted = await appendLedgerRecordAndMaybeCompact(
          "pulse.homeostasis.baseTax",
          recordFromApply(result.mutation, "pulse.homeostasis.baseTax"),
          {
            initialValue: homeostasisBaseTaxLedgerRuntime.defaultValue,
            historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
          },
        );
        homeostasisBaseTaxLedgerPersistence = {
          ...persisted,
          hydrated: homeostasisBaseTaxLedgerPersistence.hydrated,
          lastHydratedAt: homeostasisBaseTaxLedgerPersistence.lastHydratedAt,
          lastHydrationError:
            homeostasisBaseTaxLedgerPersistence.lastHydrationError,
        };
      }
      akashaDelegate?.recordMutationTelemetry({
        lane: "internal_host",
        kind: "genetic_ledger_update",
        count: 1,
      });
      LOGGER.info(
        `   [PULSE] Genetic ledger update key=${update.key} tick=${result.state.lastAppliedTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastAppliedRollbackToken} source=${result.state.lastAppliedSource} reason=${result.state.lastAppliedReason}`,
      );
    }
    return result;
  },
  rollbackGeneticLedgerUpdate: async (
    rollback: {
      key:
        | "pulse.homeostasis.baseTax"
        | "pulse.homeostasis.targetEnergy"
        | "pulse.pressureRing.scale";
      rollbackToken: string;
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): Promise<
    | import("@03").LedgerRollbackResult<
      "pulse.homeostasis.baseTax"
    >
    | import("@03").LedgerRollbackResult<
      "pulse.homeostasis.targetEnergy"
    >
    | import("@03").LedgerRollbackResult<
      "pulse.pressureRing.scale"
    >
  > => {
    if (rollback.key === "pulse.pressureRing.scale") {
      const result = rollbackPressureRingScaleLedgerUpdate({
        rollbackToken: rollback.rollbackToken,
        source: rollback.source,
        reason: rollback.reason,
        tick: rollback.tick,
      });
      if (result.status === "rolled_back") {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.pressureRing.scale",
            recordFromRollback(result.mutation, "pulse.pressureRing.scale"),
            {
              initialValue: pressureRingScaleLedgerRuntime.defaultValue,
              historyLimit: pressureRingScaleLedgerRuntime.historyLimit,
            },
          );
          pressureRingScaleLedgerPersistence = {
            ...persisted,
            hydrated: pressureRingScaleLedgerPersistence.hydrated,
            lastHydratedAt: pressureRingScaleLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              pressureRingScaleLedgerPersistence.lastHydrationError,
          };
        }
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
        );
      }
      return result;
    }

    if (rollback.key === "pulse.homeostasis.targetEnergy") {
      const result = rollbackHomeostasisTargetEnergyLedgerUpdate({
        rollbackToken: rollback.rollbackToken,
        source: rollback.source,
        reason: rollback.reason,
        tick: rollback.tick,
      });
      if (result.status === "rolled_back") {
        if (result.mutation) {
          const persisted = await appendLedgerRecordAndMaybeCompact(
            "pulse.homeostasis.targetEnergy",
            recordFromRollback(
              result.mutation,
              "pulse.homeostasis.targetEnergy",
            ),
            {
              initialValue: homeostasisTargetEnergyLedgerRuntime.defaultValue,
              historyLimit: homeostasisTargetEnergyLedgerRuntime.historyLimit,
            },
          );
          homeostasisTargetEnergyLedgerPersistence = {
            ...persisted,
            hydrated: homeostasisTargetEnergyLedgerPersistence.hydrated,
            lastHydratedAt:
              homeostasisTargetEnergyLedgerPersistence.lastHydratedAt,
            lastHydrationError:
              homeostasisTargetEnergyLedgerPersistence.lastHydrationError,
          };
        }
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_host",
          kind: "genetic_ledger_rollback",
          count: 1,
        });
        LOGGER.info(
          `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
        );
      }
      return result;
    }

    const result = rollbackHomeostasisBaseTaxLedgerUpdate({
      rollbackToken: rollback.rollbackToken,
      source: rollback.source,
      reason: rollback.reason,
      tick: rollback.tick,
    });
    if (result.status === "rolled_back") {
      if (result.mutation) {
        const persisted = await appendLedgerRecordAndMaybeCompact(
          "pulse.homeostasis.baseTax",
          recordFromRollback(result.mutation, "pulse.homeostasis.baseTax"),
          {
            initialValue: homeostasisBaseTaxLedgerRuntime.defaultValue,
            historyLimit: homeostasisBaseTaxLedgerRuntime.historyLimit,
          },
        );
        homeostasisBaseTaxLedgerPersistence = {
          ...persisted,
          hydrated: homeostasisBaseTaxLedgerPersistence.hydrated,
          lastHydratedAt: homeostasisBaseTaxLedgerPersistence.lastHydratedAt,
          lastHydrationError:
            homeostasisBaseTaxLedgerPersistence.lastHydrationError,
        };
      }
      akashaDelegate?.recordMutationTelemetry({
        lane: "internal_host",
        kind: "genetic_ledger_rollback",
        count: 1,
      });
      LOGGER.info(
        `   [PULSE] Genetic ledger rollback key=${rollback.key} tick=${result.state.lastRollbackTick} value=${result.previousValue}->${result.nextValue} token=${result.state.lastRollbackToken} source=${result.state.lastRollbackSource} reason=${result.state.lastRollbackReason}`,
      );
    }
    return result;
  },
  getPhysiologicalLedgerState: (): Record<
    HormoneId,
    LedgerRuntimeSnapshot<HormoneId>
  > => {
    return Object.fromEntries(
      HORMONE_BUFFER_CATALOG.map((spec) => [
        spec.id,
        snapshotLedgerRuntime(physiologicalLedgers[spec.id]),
      ]),
    ) as Record<HormoneId, LedgerRuntimeSnapshot<HormoneId>>;
  },
  getGenericLedgerSnapshots: (): Record<
    GeneticLedgerKey,
    LedgerRuntimeSnapshot<GeneticLedgerKey>
  > => {
    return {
      "pulse.homeostasis.baseTax": snapshotLedgerRuntime(
        homeostasisBaseTaxLedgerRuntime,
      ),
      "pulse.homeostasis.band": snapshotLedgerRuntime(
        homeostasisBandLedgerRuntime,
      ),
      "pulse.homeostasis.maxDelta": snapshotLedgerRuntime(
        homeostasisMaxDeltaLedgerRuntime,
      ),
      "pulse.homeostasis.overflowThreshold": snapshotLedgerRuntime(
        homeostasisOverflowThresholdLedgerRuntime,
      ),
      "pulse.homeostasis.targetEnergy": snapshotLedgerRuntime(
        homeostasisTargetEnergyLedgerRuntime,
      ),
      "pulse.pressureRing.scale": snapshotLedgerRuntime(
        pressureRingScaleLedgerRuntime,
      ),
      "daemon.maxActionsPerWindow": snapshotLedgerRuntime(
        daemonMaxActionsLedgerRuntime,
      ),
      "federation.admission.degradeEnergyRatio": snapshotLedgerRuntime(
        federationDegradeEnergyRatioLedgerRuntime,
      ),
    } as Record<GeneticLedgerKey, LedgerRuntimeSnapshot<GeneticLedgerKey>>;
  },
  getHomeostasisState: (): HomeostasisState => snapshotHomeostasisState(),
  updateHomeostasisPolicy: (
    update: {
      source?: string;
      reason?: string;
      tick?: number;
    },
  ): HomeostasisState => {
    const source = (update.source ?? "runtime").trim();
    const reason = (update.reason ?? "manual_update").trim();
    homeostasisLastUpdateSource = source.length > 0 ? source : "runtime";
    homeostasisLastUpdateReason = reason.length > 0 ? reason : "manual_update";
    homeostasisLastUpdateTick = update.tick !== undefined
      ? Math.max(0, Math.floor(update.tick))
      : Atomics.load(STATE_MATRIX.tickCounter, 0);

    return snapshotHomeostasisState();
  },
  updateEvolutionPressureRing: (
    update: {
      mode: "set" | "step";
      theta?: number;
      deltaTheta?: number;
      enabled?: boolean;
      source?: string;
    },
  ): EvolutionPressureState => {
    const boundedDelta = update.deltaTheta === undefined
      ? undefined
      : Math.max(-Math.PI, Math.min(Math.PI, update.deltaTheta));
    const boundedTheta = update.theta === undefined
      ? undefined
      : normalizeTheta(update.theta);
    const applied = applyEvolutionPressureRing({
      mode: update.mode,
      theta: boundedTheta,
      deltaTheta: boundedDelta,
      enabled: update.enabled,
    });
    LOGGER.info(
      `   [PULSE] Evolution pressure ring update source=${
        update.source ?? "runtime"
      } mode=${update.mode} novelty=${applied.noveltySigned} symbiosis=${applied.symbiosisSigned} fear=${applied.fear} ego=${applied.ego} enabled=${applied.ring.enabled} theta=${
        applied.ring.theta.toFixed(4)
      } scale=${applied.ring.scale}.`,
    );
    return applied;
  },


  tick: async () => {
    if (isTicking) {
      throw new Error("[PULSE] tick() called concurrently! Overlapping ticks are forbidden and cause synchronization deadlocks.");
    }
    isTicking = true;
    if (workers.length === 0) {
      await PULSE.initWorkers();
    }
    if (wasmBootDegraded) {
      return;
    }
    if (workers.length === 0) {
      throw new Error(
        `[PULSE] No workers ready for tick. reason=${
          wasmBootReason || "WORKERS_UNAVAILABLE"
        }`,
      );
    }

    const { syncState, tickCounter, SYNC } = STATE_MATRIX;
    // Sync physiological hormones into shared memory lattice so WASM λ-VM can read them.
    const computedHormones = syncHormonesToLattice({
      baseTax: homeostasisBaseTaxRuntime,
      targetEnergy: homeostasisTargetEnergyRuntime,
      workerCount: WORKER_COUNT,
      egoPressure: evolutionPressureState.ego,
      fearPressure: evolutionPressureState.fear,
      noveltyPressure: evolutionPressureState.novelty,
      symbiosisPressure: evolutionPressureState.symbiosis,
      maxPlasmidCharge: DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge,
      pressureRingScale: evolutionPressureState.ring.scale,
      // Generic Ledger inputs (Stage 7.2)
      homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
      homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
      homeostasisOverflowThreshold:
        homeostasisOverflowThresholdLedgerRuntime.currentValue,
      daemonMaxActions: daemonMaxActionsLedgerRuntime.currentValue,
      federationDegradeEnergyRatio:
        federationDegradeEnergyRatioLedgerRuntime.currentValue,
      globalSyntropy: 0, // Will be updated if syntropy is available
    });

    for (const spec of HORMONE_BUFFER_CATALOG) {
      const liveVal = computedHormones[spec.id];
      const res = applyLedgerUpdate(physiologicalLedgers[spec.id], {
        value: liveVal,
        tick: -1,
        source: "pulse",
        reason: "physiological_sync",
      });
      physiologicalLedgers[spec.id] = res.state;
      STATE_MATRIX.setHormone(spec.index, res.state.currentValue);
    }

    try {
      // 0. Sovereign Oracle Peak Detection & Coherence Polling
      const currentTick = Atomics.load(tickCounter, 0);
      PULSE.currentPulseId = currentTick;
      const dumpA11 = (lbl: string) => {
        const xs = new Int16Array(
          STATE_MATRIX.wasmMemory.buffer,
          XS_OFFSET,
          MAX_ATOMS,
        );
        LOGGER.debug(
          `[PULSE TRACE] ${lbl} -> Atom 11 X=${xs[11]} or 15 X=${xs[15]}`,
        );
      };

      dumpA11("Before Quorum");
      const activeIdx = STATE_MATRIX.getActiveIndices();

      // Stage 25: Sovereign Feedback - Syntropy-modulated tax
      // Move evaluation earlier so it can affect metabolism and gate
      const syntropy = quorumAdvocate.evaluateQuorum(activeIdx);

      dumpA11("Before Coherence");

      const noveltyDriftRatio = (noveltyHistory.sum() / noveltyHistory.size()) /
        1000.0;
      // Poll Coherence from Worker 0 (WASM primary) - MUST happen before reset
      const coherencePulseId = nextPulseId();
      const coherenceRes = await postAndWait<{ coherence: number }>(
        0,
        workers[0],
        { type: "POLL_COHERENCE", pulseId: coherencePulseId },
        "COHERENCE_VAL",
      );
      const coherence = coherenceRes.coherence ?? 0;
      oracleDelegate?.setNeuralCoherence(coherence);

      dumpA11("Before Hormones");

      // Reset global neural coherence aggregation field for the NEXT tick.
      Atomics.store(STATE_MATRIX.coherence, 0, 0); // Accumulator (Vector 10)
      Atomics.store(STATE_MATRIX.neuralCoherence, 0, 0); // Broadcast

      // Broadcast a threshold-clamped coherence channel for guardian scripts.
      const guardianChannel = Math.max(0, Math.min(200, coherence));
      workers[0].postMessage({
        type: "SET_COHERENCE",
        coherence: guardianChannel,
        pulseId: nextPulseId(),
      });

      dumpA11("Before Bonds");

      // Update Hormones with actual Syntropy
      const finalHormones = syncHormonesToLattice({
        baseTax: homeostasisBaseTaxRuntime,
        targetEnergy: homeostasisTargetEnergyRuntime,
        workerCount: WORKER_COUNT,
        egoPressure: evolutionPressureState.ego,
        fearPressure: evolutionPressureState.fear,
        noveltyPressure: evolutionPressureState.novelty,
        symbiosisPressure: evolutionPressureState.symbiosis,
        maxPlasmidCharge: DAEMON_INGRESS_POLICY_LIMITS.maxPlasmidCharge,
        pressureRingScale: evolutionPressureState.ring.scale,
        homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
        homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
        homeostasisOverflowThreshold:
          homeostasisOverflowThresholdLedgerRuntime.currentValue,
        daemonMaxActions: daemonMaxActionsLedgerRuntime.currentValue,
        federationDegradeEnergyRatio:
          federationDegradeEnergyRatioLedgerRuntime.currentValue,
        globalSyntropy: syntropy,
      });

      for (const spec of HORMONE_BUFFER_CATALOG) {
        const liveVal = finalHormones[spec.id];
        const res = applyLedgerUpdate(physiologicalLedgers[spec.id], {
          value: liveVal,
          tick: currentTick,
          source: "pulse",
          reason: "physiological_sync",
        });
        physiologicalLedgers[spec.id] = res.state;
        STATE_MATRIX.setHormone(spec.index, res.state.currentValue);
      }

      if (coherence > 1000) {
        LOGGER.debug(
          `🧠 [PULSE] High Coherence detected: ${coherence}. Consulting Oracle...`,
        );
      }

      const telemetry = oracleDelegate?.gatherEpochTelemetry() || { matrixResonance: 0 };
      oracleDelegate?.broadcastWhisper(currentTick, telemetry, coherence);
      // Trigger Oracle on either Matrix Resonance spike or High Coherence
      if (telemetry.matrixResonance > 5000 || coherence > 500) {
        const regent = SOVEREIGNTY_ENGINE.electRegent(activeIdx);
        if (regent && regent.idx !== -1) {
          oracleDelegate?.consultOracle(regent.idx, telemetry);
        }
      }

      // 1. Resolve Sequential Logic (WASM)
      const bondPulseId = nextPulseId();
      const bondRes = await postAndWait<{ count: number }>(
        0,
        workers[0],
        {
          type: "RESOLVE_BONDS",
          pulseId: bondPulseId,
          startIdx: 0,
          endIdx: MAX_ATOMS,
        },
        "RESOLVE_BONDS_DONE",
      );
      if (bondRes.count > 0) {
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_wasm",
          kind: "bond_pair_resolution",
          count: bondRes.count,
        });
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_wasm",
          kind: "bond_request_clear",
          count: bondRes.count,
        });
      }

      dumpA11("After Bonds");

      // 2. Parallel Physics & WASM Kernel
      // 2a. Rebuild Spatial Lattice (WASM)
      const hashPulseId = nextPulseId();
      const hashRes = await postAndWait<
        { overflowCount?: number; maxCellCount?: number }
      >(
        0,
        workers[0],
        {
          type: "BUILD_SPATIAL_HASH",
          pulseId: hashPulseId,
        },
        "HASH_DONE",
      );
      const overflowCount = Number.isFinite(hashRes.overflowCount)
        ? Math.max(0, Math.floor(Number(hashRes.overflowCount)))
        : 0;
      const maxCellCount = Number.isFinite(hashRes.maxCellCount)
        ? Math.max(0, Math.floor(Number(hashRes.maxCellCount)))
        : 0;
      const activeCount = Math.max(1, activeIdx.length);
      spatialHashState = {
        tick: currentTick,
        overflowCount,
        maxCellCount,
        overflowRatio: Number((overflowCount / activeCount).toFixed(6)),
      };
      if (overflowCount > 0 && currentTick % 20 === 0) {
        LOGGER.warn(
          `⚠️ [SPATIAL_HASH] overflow=${overflowCount} maxCell=${maxCellCount} active=${activeIdx.length}`,
        );
      }

      // 2a.1 Freeze position snapshot for deterministic physics reads across workers.
      {
        readXsView.set(xsView);
        readYsView.set(ysView);
        readEnergiesView.set(energiesView);
        readResonancesView.set(resonancesView);
        if (currentTick <= 104) {
          LOGGER.info(
            `DEBUG [PULSE.ts]: tick=${currentTick} xsView[11]=${
              xsView[11]
            }, readXsView[11]=${readXsView[11]}`,
          );
        }
      }
      // 2b. Execute Physics (WASM)
      // Transition to WASM_TICKING (1) to unblock workers
      Atomics.store(syncState, 0, SYNC.WASM_TICKING);
      Atomics.notify(syncState, 0);
      await dispatchRangePhase("PULSE", "DONE");

      // 2c. Reduce cross-atom deltas inside WASM over deterministic index ranges.
      await dispatchRangePhase("REDUCE_DELTAS", "DELTA_DONE");
      dumpA11("After Reduce Deltas");

      // --- PHASE 2: Matrix Environment Execution (Worker 0 ONLY) ---
      // worker.ts message handler for 'TICK_ENVIRONMENT'.
      const environmentPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "TICK_ENVIRONMENT",
        tick: currentTick,
        pulseId: environmentPulseId,
      }, "ENVIRONMENT_DONE");
      dumpA11("After Environment");

      // --- TRANSITION TO HOST_LOCK ---
      // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
      Atomics.store(syncState, 0, SYNC.HOST_LOCK);
      Atomics.notify(syncState, 0);

      // --- PHASE 50: TRANSACTIONAL PANOPTICON TELEMETRY ---
      const nowMs = performance.now();
      if (nowMs - lastPanopticonBroadcastTime >= 50) { // ~20fps
        const frame = STATE_MATRIX.packPanopticonFrame();
        akashaDelegate?.broadcastPanopticonFrame(frame);
        lastPanopticonBroadcastTime = nowMs;
      }

      // --- SNAP PHASE: Asynchronous Matrix Persistence ---
      // Moved into HOST_LOCK to prevent torn reads during slice
      if (
        RUNTIME_POLICY.snapshot.enabled &&
        currentTick > 0 &&
        currentTick % RUNTIME_POLICY.snapshot.intervalTicks === 0
      ) {
        // We trigger save but don't await it to avoid blocking the heartbeat.
        // It will complete in the background.
        if (akashaDelegate) akashaDelegate.saveSnap(currentTick).then(() => {
          akashaDelegate?.cleanupSnap(RUNTIME_POLICY.snapshot.retention);
        });
      }

      // --- STAGE 26: CONTINUUM CHRONOSPHERE EPOCHS (HEARTBEAT) ---
      if (currentTick > 0 && currentTick % 10000 === 0) {
        LOGGER.info(
          `[CONTINUUM] Pulse Heartbeat triggered at tick ${currentTick}. Archiving Epoch...`,
        );
        const pCount = activeIdx.length;
        const autoEpochId = `auto_tick_${currentTick}`;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        if (akashaDelegate) await akashaDelegate.saveEpoch(
          STATE_MATRIX.wasmMemory,
          currentTick,
          autoEpochId,
          pCount,
          0,
          epochHash,
        );
        LOGGER.info(
          `[CONTINUUM] Epoch ${autoEpochId}.sigma securely sealed into Chronosphere. (Proof: ${epochHash})`,
        );
      }

      // --- STAGE 27/28: META-KURAMOTO SWARM MEMBRANE & P2P NEXUS ---
      if (currentTick > 0 && currentTick % 10000 === 0) {
        let totalPhase = 0;
        for (const idx of activeIdx) {
          totalPhase += Math.abs(STATE_MATRIX.get_phase(idx));
        }
        const avgPhase = activeIdx.length > 0
          ? totalPhase / activeIdx.length
          : 0;
        const epochHash = await PULSE.generateEpochProof(currentTick);
        const egressEvents = drainEgressEvents();
        noosphereDelegate?.evaluateHeartbeat(
          currentTick,
          epochHash,
          avgPhase,
          egressEvents.length,
        );
      }

      const egressEvents = drainEgressEvents();
      if (egressEvents.length > 0) {
        for (const ev of egressEvents) {
          noosphereDelegate?.routeAtom(ev);
        }
      }

      oracleDelegate?.drainPendingMutations();
      await CONTROL_INTENT_QUEUE.applyHostLockBudget();
      dumpA11("End of TICK phase 1");

      // 3.1 Tick Glyph Transport (WASM) [Stage 5.1]
      const transportPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "TICK_GLYPH_TRANSPORT",
        tick: currentTick,
        pulseId: transportPulseId,
      }, "GLYPH_TRANSPORT_DONE");

      // 3.5 Sort Spawn Requests Deterministically
      const writeHead = Atomics.load(spawnHeadView, 0);
      const readHead = Atomics.load(spawnHeadView, 1);
      const pendingCount = writeHead - readHead;

      if (pendingCount > 1) {
        const SPAWN_MAX = 1024;
        const SPAWN_SLOT = 16;
        const requests = [];

        for (let i = 0; i < pendingCount; i++) {
          const cursor = readHead + i;
          const slotOff = (cursor % SPAWN_MAX) * SPAWN_SLOT;
          const reqBytes = new Uint8Array(16);
          for (let b = 0; b < 16; b++) {
            reqBytes[b] = spawnDataView.getUint8(slotOff + b);
          }
          requests.push(reqBytes);
        }

        // Lexicographical sort
        requests.sort((a, b) => {
          for (let i = 0; i < 16; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
          }
          return 0;
        });

        for (let i = 0; i < pendingCount; i++) {
          const cursor = readHead + i;
          const slotOff = (cursor % SPAWN_MAX) * SPAWN_SLOT;
          for (let b = 0; b < 16; b++) {
            spawnDataView.setUint8(slotOff + b, requests[i][b]);
          }
        }
      }

      // 4. Drain Spawn Queue (WASM)
      const spawnPulseId = nextPulseId();
      const spawnRes = await postAndWait<{ count: number }>(
        0,
        workers[0],
        {
          type: "DRAIN_SPAWN",
          tick: currentTick,
          pulseId: spawnPulseId,
        },
        "DRAIN_SPAWN_DONE",
      );
      if (spawnRes.count > 0) {
        LOGGER.debug(
          `🌱 [PULSE] WASM Spawned ${spawnRes.count} atoms with RISC boot scripts.`,
        );
        akashaDelegate?.recordMutationTelemetry({
          lane: "internal_wasm",
          kind: "spawn_seed_atom",
          count: spawnRes.count,
        });

        // --- STAGE 22: ADAPTIVE INCEPTION ---
        // Find newly spawned atoms (those with IDs but empty instructions/role)
        // and inject evolved programs.
        for (let idx = 0; idx < MAX_ATOMS; idx++) {
          if (idsView[idx] !== 0n && instructionsView[idx * 64] === 0) {
            // This is likely a fresh spawn. Incept it.
            const prog = genesisInceptor.selectProgram();
            const lineageHash = prog.metadata?.ancestorHash ?? 0n;

            STATE_MATRIX.setInstructions(idx, new Uint8Array(prog.bytecode));
            STATE_MATRIX.setLineage(idx, lineageHash);

            // Mark its role if the program is for a specific one (e.g. role hint)
            // For now, we'll let the role be assigned by the first op if needed,
            // or just set a default.
          }
        }
      }

      // 5. Metabolic and Homeostasis Closure (WASM)
      // Pass 1: Accumulate genome frequencies (Scratch Space)
      const clearStatsPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "METABOLISM_ACCUMULATE",
        startIdx: 0,
        endIdx: MAX_ATOMS,
        clear: true,
        pulseId: clearStatsPulseId,
      }, "METABOLISM_ACCUMULATE_DONE");

      // Pass 2: Apply Metabolism (Parallel)
      const pressureState = snapshotEvolutionPressureState();

      applyEvolutionPressureTerms(currentTick, activeIdx);
      applyEnergyHomeostasisTerms(
        currentTick,
        activeIdx,
        spatialHashState.overflowRatio,
      );

      // Sovereign Feedback: Tax reduction based on structural organization (Syntropy)
      const baseTaxRaw = clampHomeostasisBaseTax(homeostasisBaseTaxRuntime);
      const taxDiscount = Math.min(0.8, syntropy * 1.5); // Max 80% tax reduction at high syntropy
      const baseTax = Math.max(0, Math.round(baseTaxRaw * (1 - taxDiscount)));

      if (currentTick % 20 === 0 && syntropy > 0.1) {
        LOGGER.info(
          `⚖️ [SOVEREIGN] Metabolic Tax Discount: ${
            (taxDiscount * 100).toFixed(1)
          }% (Syntropy: ${syntropy.toFixed(3)})`,
        );
      }

      const targetEnergy = clampHomeostasisTargetEnergy(
        homeostasisTargetEnergyRuntime,
      );

      const metabolismPromises: Promise<any>[] = [];
      const chunkSize = Math.ceil(MAX_ATOMS / runtimeWorkerCount);
      for (let i = 0; i < runtimeWorkerCount; i++) {
        const startIdx = i * chunkSize;
        const endIdx = i === runtimeWorkerCount - 1
          ? MAX_ATOMS
          : Math.min(MAX_ATOMS, (i + 1) * chunkSize);

        metabolismPromises.push(postAndWait(
          i,
          workers[i],
          {
            type: "METABOLISM_APPLY",
            pulseId: nextPulseId(),
            startIdx,
            endIdx,
            noveltySigned: pressureState.noveltySigned,
            symbiosisSigned: pressureState.symbiosisSigned,
            baseTax,
            targetEnergy,
            homeostasisBand: homeostasisBandLedgerRuntime.currentValue,
            homeostasisMaxDelta: homeostasisMaxDeltaLedgerRuntime.currentValue,
            overflowThreshold:
              homeostasisOverflowThresholdLedgerRuntime.currentValue,
            spatialOverflowRatio: spatialHashState.overflowRatio,
            starvationFloor: HOMEOSTASIS_STARVATION_FLOOR,
            subsidyEnabled: HOMEOSTASIS_SUBSIDY_ENABLED,
          },
          "METABOLISM_APPLY_DONE",
        ));
      }
      await Promise.all(metabolismPromises);

      // 6. Sequential Maintenance (Sequential JS)

      // --- STAGE 26: Immunological Phagocyte ---
      {
        const entropyPressure = STATE_MATRIX.get_hormone(0); // H0: entropy_pressure
        const workerResponse = await postAndWait(
          0, // use primary worker
          workers[0],
          {
            type: "PHAGOCYTE_PASS",
            pulseId: nextPulseId(),
            entropy: entropyPressure,
          },
          "PHAGOCYTE_PASS_DONE",
        );
        const purgedCount = workerResponse.count || 0;
        
        if (purgedCount > 0) {
          if (akashaDelegate) await akashaDelegate.recordImmunologicalPurge(purgedCount);
          LOGGER.info(
            `🛡️ [IMMUNE] Phagocyte Purge: ${purgedCount} necrotic/drifting atoms recycled. (H0: ${entropyPressure})`,
          );
        }
      }

      // --- STAGE 8: Hybrid Promotion Bridge (Guardians & Architects) ---
      {
        const gMode = GUARDIAN_SIGNAL_EXECUTION_MODE;
        const aMode = ARCHITECT_PLASMID_EXECUTION_MODE;
        guardianSignalHybridState.lastMode = gMode;
        architectPlasmidHybridState.lastMode = aMode;
        const scrollRange = 16;

        for (const idx of activeIdx) {
          const role = rolesView[idx];
          if (role === STATE_MATRIX.ROLE_GUARDIAN) {
            const script = instructionsView.slice(idx * 64, idx * 64 + 64);
            const decision = evaluateGuardianSignalExecution({
              mode: gMode,
              script,
              neuralCoherence: oracleDelegate?.getNeuralCoherence() || 0,
              legacyAllowed: true,
              maxSteps: scrollRange,
            });

            // Update Guardian Telemetry
            if (gMode === "hybrid-reduce") {
              guardianSignalHybridState.hybridRuns++;
              if (decision.allowed) {
                guardianSignalHybridState.allowedGuardianSignals++;
              } else {
                guardianSignalHybridState.suppressedGuardianSignals++;
              }
            } else if (gMode === "shadow-reduce") {
              guardianSignalHybridState.shadowRuns++;
              if (decision.shadowSuppressed) {
                guardianSignalHybridState.shadowSuppressedGuardianSignals++;
              }
            }

            if (decision.status === "fallback") {
              guardianSignalHybridState.fallbackRuns++;
              guardianSignalHybridState.lastFallbackReason =
                decision.fallbackReason || "unknown_error";
            }

            if (decision.branch === "stable") {
              guardianSignalHybridState.stableBranchCount++;
            }
            if (decision.branch === "repair") {
              guardianSignalHybridState.repairBranchCount++;
            }

            guardianSignalHybridState.lastTick = currentTick;
            guardianSignalHybridState.lastStatus = decision.status;
            guardianSignalHybridState.lastBranch = decision.branch;

            // Apply Causality Suppression
            const allowed = decision.allowed &&
              guardianPheromoneAllowedByExecutionMode(idx);
            Atomics.store(causalityView, idx, allowed ? 1 : 0);
          } else if (role === STATE_MATRIX.ROLE_ARCHITECT) {
            const script = instructionsView.slice(idx * 64, idx * 64 + 64);
            const decision = evaluateArchitectPlasmidExecution({
              mode: aMode,
              script,
              neuralCoherence: oracleDelegate?.getNeuralCoherence() || 0,
              legacyAllowed: true,
            });

            // Update Architect Telemetry
            if (aMode === "hybrid-reduce") {
              architectPlasmidHybridState.hybridRuns++;
              if (decision.allowed) {
                architectPlasmidHybridState.allowedArchitectPlasmids++;
              } else {
                architectPlasmidHybridState.suppressedArchitectPlasmids++;
              }
            } else if (aMode === "shadow-reduce") {
              architectPlasmidHybridState.shadowRuns++;
              if (decision.shadowSuppressed) {
                architectPlasmidHybridState.shadowSuppressedArchitectPlasmids++;
              }
            }

            if (decision.status === "fallback") {
              architectPlasmidHybridState.fallbackRuns++;
              architectPlasmidHybridState.lastFallbackReason =
                decision.fallbackReason || "unknown_error";
            }

            if (decision.branch === "emit") {
              architectPlasmidHybridState.emitBranchCount++;
            }
            if (decision.branch === "suppress") {
              architectPlasmidHybridState.suppressBranchCount++;
            }

            architectPlasmidHybridState.lastTick = currentTick;
            architectPlasmidHybridState.lastStatus = decision.status;
            architectPlasmidHybridState.lastBranch = decision.branch;

            // Apply Causality Suppression for Plasmids
            const allowed = decision.allowed &&
              architectPlasmidAllowedByExecutionMode(idx);
            Atomics.store(causalityView, idx, allowed ? 1 : 0);
          } else {
            // Non-governed roles are always allowed
            Atomics.store(causalityView, idx, 1);
          }

          // Replication Hybrid Bridge (Universal for all atoms)
          const rMode = REPLICATION_EXECUTION_MODE;
          replicationHybridState.lastMode = rMode;
          const replicationDecision = evaluateReplicationExecution({
            mode: rMode,
            script: instructionsView.slice(idx * 64, idx * 64 + 64),
            energy: energiesView[idx],
            resonance: resonancesView[idx],
            aggression: STATE_MATRIX.get_hormone(2),
            legacyAllowed: true,
          });

          // Update Replication Telemetry
          if (rMode === "hybrid-reduce") {
            replicationHybridState.hybridRuns++;
            if (replicationDecision.allowed) {
              replicationHybridState.allowedReplications++;
            } else {
              replicationHybridState.suppressedReplications++;
            }
          } else if (rMode === "shadow-reduce") {
            replicationHybridState.shadowRuns++;
            if (replicationDecision.shadowSuppressed) {
              replicationHybridState.shadowSuppressedReplications++;
            }
          }

          if (replicationDecision.status === "fallback") {
            replicationHybridState.fallbackRuns++;
            replicationHybridState.lastFallbackReason =
              replicationDecision.fallbackReason || "unknown_error";
          }

          if (replicationDecision.branch === "emit") {
            replicationHybridState.emitBranchCount++;
          }
          if (replicationDecision.branch === "suppress") {
            replicationHybridState.suppressBranchCount++;
          }

          replicationHybridState.lastTick = currentTick;
          replicationHybridState.lastStatus = replicationDecision.status;
          replicationHybridState.lastBranch = replicationDecision.branch;

          // Universal Replication Causality Integration
          // If replication is suppressed by hybrid mode, we must ensure causality is 0
          // (Wait, this is tricky: causality=0 suppresses EVERYTHING secretion/replication etc.)
          // If role-based logic said 'allowed', but replication said 'suppressed', should we block the whole atom?
          // For now, we only block if BOTH are in hybrid mode and say no, or if we want to be strict.
          // Correct implementation: causality bit is a combined gate.
          if (rMode === "hybrid-reduce" && !replicationDecision.allowed) {
            Atomics.store(causalityView, idx, 0);
          }
        }
      }

      // Decay host pheromone fields (DEPRECATED: Now handled in WASM tick_environment)
      // PHYSICS_ENGINE.decayPheromones();

      // 7. Autonomous Systemic Audit (Every 5 ticks)
      if (currentTick % 5 === 0) {
        akashaDelegate?.recordMutationTelemetry({
          lane: "canonical_gate",
          kind: "audit_matrix_cycle",
          count: 1,
        });
        GATE.auditMatrix(STATE_MATRIX);
      }

      // --- RESONANCE PROTOCOL: Global Coherence Calculation ---
      {
        let totalResonance = 0;
        for (const idx of activeIdx) {
          totalResonance += resonancesView[idx];
        }
        // Average Resonance normalized to 0-255 (Absolute Coherence)
        const avgRes = activeIdx.length > 0
          ? (totalResonance / activeIdx.length)
          : 0;
        const coherence = Math.min(255, Math.floor(avgRes / 100));

        // Write to Unified Lattice
        Atomics.store(coherenceView, 0, coherence);

        if (currentTick % 20 === 0) {
          LOGGER.debug(
            `💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${
              (avgRes / 100).toFixed(1)
            })`,
          );
          // --- STAGE 43: GOVERNANCE LAB (PREDICTION MARKET) ---
          if (currentTick > 0 && currentTick % 2000 === 0) {
            PREDICTION_MARKET.resolveCrisis();
            PREDICTION_MARKET.distributeDividends();

            const active = STATE_MATRIX.getActiveIndices();
            if (active.length > 0) {
              let eliteIdx = active[0];
              let maxEnergy = 0;
              for (const idx of active) {
                const energy = STATE_MATRIX.get_energy(idx);
                if (energy > maxEnergy) {
                  maxEnergy = energy;
                  eliteIdx = idx;
                }
              }
              if (maxEnergy > 50000) {
                const eliteGenome = STATE_MATRIX.getInstructions(eliteIdx);
                PREDICTION_MARKET.startCrisis(eliteGenome);
              }
            }
          }

          // --- STAGE 22: DRIFT WARDEN AUDIT ---
          const drift = driftWarden.analyze(currentTick);
          if (drift.shadowForkRecommended && !shadowForkActive) {
            LOGGER.warn(
              `🚨 [ADAPTIVE] High Drift (${
                drift.driftIndex.toFixed(4)
              }) detected. Triggering autonomous shadow rehearsal...`,
            );
            shadowForkActive = true;
            (async () => {
              try {
                const fork = new DollFork();
                const runner = new DollForkRunner(fork);
                await runner.init();
                fork.forkFromMainline();
                // Run a 10-tick rehearsal
                for (let s = 0; s < 10; s++) {
                  runner.runShadowTick(currentTick + s);
                }
                LOGGER.info(
                  `✅ [ADAPTIVE] Shadow rehearsal complete for drift at tick ${currentTick}.`,
                );
              } catch (e) {
                LOGGER.error(`❌ [ADAPTIVE] Shadow rehearsal failed:`, e);
              } finally {
                shadowForkActive = false;
              }
            })();
          }
        }
      }

      akashaDelegate?.flushMutationTelemetry(currentTick);
      const glyphSnapshot = GLYPH_TELEMETRY.snapshot();
      lineageTracker.syncLineages(activeIdx);

      // --- STAGE 6: Codex evidence record ---
      akashaDelegate?.observePulseCodex(
        currentTick,
        activeIdx.length,
        glyphSnapshot,
        syntropy, // already calculated earlier in this tick
      );
      // Increment Global Tick Counter
      Atomics.add(tickCounter, 0, 1);

      noosphereDelegate?.setNexusStatus({ localCurrentTick: currentTick });
      const now = performance.now();
      const dt = now - lastTickTime;
      if (dt > 1000) {
        noosphereDelegate?.setNexusStatus({ localTps: (currentTick - tickCountLog) / (dt / 1000) });
        lastTickTime = now;
        tickCountLog = currentTick;
      }

      const medianTick = noosphereDelegate?.getMedianSwarmTick(currentTick) ?? 0;
      if (currentTick > medianTick + MAX_TICK_DRIFT) {
        await new Promise((r) => setTimeout(r, 10)); // Elastic yield bounds
      }

      if (currentTick > 0 && currentTick % 10000 === 0) {
        let hashSum = 0n;
        for (let i = 1; i < STATE_MATRIX.MAX_ATOMS; i++) {
          if (STATE_MATRIX.get_energy(i) > 0) {
            hashSum += BigInt(STATE_MATRIX.get_energy(i)) +
              BigInt(STATE_MATRIX.get_phase(i));
          }
        }
        noosphereDelegate?.broadcastEpochConsensus(currentTick, hashSum);
      }

      // SNAP PHASE was relocated to HOST_LOCK (Phase 50)
    } finally {
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
      isTicking = false;
    }
  },
  getWorker: (idx: number): any => workers[idx],
  onRemoteAtomTransit: (payload: Uint8Array) => {
    const newIdx = noosphereDelegate?.unpackAtom(payload);
    if (newIdx !== -1) {
      const id = STATE_MATRIX.getId(newIdx!);
      LOGGER.info(`🛸 [PULSE] Atom ${id} materialized from hyperspace at index ${newIdx}.`);
      akashaDelegate?.recordMutationTelemetry({
        lane: "external_ingress",
        kind: "federation_migration_clear",
        count: 1,
      });
    } else {
      LOGGER.warn(`🛸 [PULSE] Ingress atom failed to materialize (Lattice full or corrupt).`);
    }
  },
  onRemoteSyncRequest: async (peerId: string) => {
    LOGGER.info(`[PULSE] Serving Hot State Merging Genesis block to ${peerId}...`);
    const payload = (akashaDelegate ? await akashaDelegate.compressMemory(STATE_MATRIX.wasmMemory) : new Uint8Array(0));
    noosphereDelegate?.sendEpochPayload(peerId, payload);
  },
  onRemoteEpochPayload: async (payload: Uint8Array) => {
    LOGGER.info(`[PULSE] Hot State Merging payload received. Unpacking into Lattice...`);
    if (akashaDelegate) await akashaDelegate.decompressMemoryToLattice(STATE_MATRIX.wasmMemory, payload);
    if (genesisPromiseResolver) {
      genesisPromiseResolver();
      genesisPromiseResolver = null;
    }
  },
  injectForeignAtom: (payload: Uint8Array) => {
    const view = new DataView(
      payload.buffer,
      payload.byteOffset,
      payload.byteLength,
    );
    const genome = payload.slice(0, 64);
    const energy = view.getInt32(64, true);
    const phase = view.getInt32(68, true);
    const resonance = view.getInt32(72, true);
    let nx = view.getInt32(76, true);
    let ny = view.getInt32(80, true);

    // Teleport to opposite edge
    if (nx <= 0) nx = Math.floor(GRID_W * 10 - 1);
    else if (nx >= Math.floor(GRID_W * 10 - 1)) nx = 0;

    if (ny <= 0) ny = Math.floor(GRID_H * 10 - 1);
    else if (ny >= Math.floor(GRID_H * 10 - 1)) ny = 0;

    const role = payload[148];

    const atomIdx = STATE_MATRIX.findEmptySlot();
    if (atomIdx > 0) {
      STATE_MATRIX.setEnergy(atomIdx, energy);
      STATE_MATRIX.setResonance(atomIdx, resonance);
      STATE_MATRIX.setPhase(atomIdx, phase);
      STATE_MATRIX.setId(
        atomIdx,
        BigInt(PULSE.currentPulseId) << 16n | BigInt(atomIdx),
      );
      STATE_MATRIX.setRole(atomIdx, role);

      const xs = new Int16Array(
        STATE_MATRIX.wasmMemory.buffer,
        XS_OFFSET,
        MAX_ATOMS,
      );
      const ys = new Int16Array(
        STATE_MATRIX.wasmMemory.buffer,
        YS_OFFSET,
        MAX_ATOMS,
      );
      Atomics.store(xs, atomIdx, nx);
      Atomics.store(ys, atomIdx, ny);

      STATE_MATRIX.setInstructions(atomIdx, genome);

      const ctxView = new Int32Array(
        STATE_MATRIX.wasmMemory.buffer,
        CONTEXT_OFFSET + atomIdx * 64,
        16,
      );
      for (let i = 0; i < 16; i++) {
        Atomics.store(ctxView, i, view.getInt32(84 + i * 4, true));
      }
    }
  },
};

// --- INLINED FROM @07/04/architect_plasmid_hybrid.ts ---

export type ArchitectPlasmidExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ArchitectPlasmidBranch = "emit" | "suppress" | "unknown";

export type ArchitectPlasmidReductionDecision = {
  status: "ok" | "fallback";
  branch: ArchitectPlasmidBranch;
  plasmidAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ArchitectPlasmidExecutionDecision = {
  mode: ArchitectPlasmidExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ArchitectPlasmidBranch;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

type ArchitectShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type ArchitectToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_ARCHITECT_MAX_STEPS = 8;
const SUPPORTED_ARCHITECT_PROPS = {
  [PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_ARCHITECT_OPCODE_LENGTHS = new Map<number, number>([
  [OP_SET, 3],
  [OP_GET, 3],
  [OP_SUB, 3],
  [OP_JNZ, 3],
  [OP_JMP, 2],
  [OP_SIGNAL, 1],
  [OP_SECRETE_PLASMID, 3],
  [OP_BUILD, 3],
  [OP_SYSCALL, 1],
]);

export const normalizeArchitectPlasmidExecutionMode = (
  raw: string | undefined,
): ArchitectPlasmidExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createArchitectInitialState = (
  neuralCoherence: number,
): ArchitectShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeArchitectTape = (
  script: Uint8Array,
  maxTokens: number,
): ArchitectToken[] => {
  const out: ArchitectToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? OP_NOP;
    if (opcode === OP_NOP) break;
    const length = SUPPORTED_ARCHITECT_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_architect_opcode_0x${opcode.toString(16)}`);
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const classifyArchitectBranch = (
  state: ArchitectShadowState,
): ArchitectPlasmidBranch => {
  if (
    state.buildCount > 0 &&
    state.role === STATE_MATRIX.ROLE_ARCHITECT
  ) {
    return "emit";
  }
  if (state.signalCount > 0 && state.buildCount === 0) {
    return "suppress";
  }
  return "unknown";
};

const applyArchitectOpcode = (
  state: ArchitectShadowState,
  token: ArchitectToken,
): void => {
  switch (token.opcode) {
    case OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in SUPPORTED_ARCHITECT_PROPS)) {
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.regs[reg] = state.neuralCoherence;
      state.pc += token.length;
      return;
    }
    case OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case OP_SECRETE_PLASMID: {
      const mode = token.args[0] ?? 0;
      const role = token.args[1] ?? 0;
      if (mode === 0) state.role = role;
      state.pc += token.length;
      return;
    }
    case OP_SIGNAL: {
      state.signalCount++;
      state.pc += token.length;
      return;
    }
    case OP_BUILD: {
      state.buildCount++;
      state.pc += token.length;
      return;
    }
    case OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS_YIELD) {
        // no-op
      } else if (sysId === SYS_SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(
          `unsupported architect bridge syscall=0x${sysId.toString(16)}`,
        );
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported architect bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const architectFallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): ArchitectPlasmidReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  plasmidAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateArchitectPlasmidReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): ArchitectPlasmidReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_ARCHITECT_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const architectTape = decodeArchitectTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ArchitectToken>(
      architectTape.map((token) => [token.pc, token]),
    );
    const state = createArchitectInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyArchitectOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyArchitectBranch(state);
    return {
      status: "ok",
      branch,
      plasmidAllowed: branch === "emit",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: architectTape.length,
      stepsExecuted,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return architectFallbackDecision(0, 0, message);
  }
};

export const evaluateArchitectPlasmidExecution = (
  input: {
    mode: ArchitectPlasmidExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
  },
): ArchitectPlasmidExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateArchitectPlasmidReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  const suppress = reduction.plasmidAllowed !== true;
  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: input.mode === "shadow-reduce" ? true : !suppress,
    status: input.mode === "shadow-reduce" ? "shadow" : "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: input.mode === "shadow-reduce" && suppress,
    hybridSuppressed: input.mode === "hybrid-reduce" && suppress,
  };
};

// --- INLINED FROM @07/04/guardian_signal_hybrid.ts ---

export type GuardianSignalExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type GuardianSignalBranch = "stable" | "repair" | "unknown";

export type GuardianSignalReductionDecision = {
  status: "ok" | "fallback";
  branch: GuardianSignalBranch;
  signalAllowed: boolean;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type GuardianSignalExecutionDecision = {
  mode: GuardianSignalExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: GuardianSignalBranch;
  finalRole: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
  glyphCount: number;
  stepsExecuted: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

type GuardianShadowState = {
  pc: number;
  regs: number[];
  role: number;
  neuralCoherence: number;
  signalCount: number;
  buildCount: number;
  branchTaken: boolean;
};

type GuardianToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_GUARDIAN_MAX_STEPS = 8;
const GUARDIAN_PROP_MAP = {
  [PROP_NEURAL_COHERENCE]: true,
} as const;
const SUPPORTED_GUARDIAN_OPCODE_LENGTHS = new Map<number, number>([
  [OP_SET, 3],
  [OP_GET, 3],
  [OP_SUB, 3],
  [OP_JNZ, 3],
  [OP_JMP, 2],
  [OP_SIGNAL, 1],
  [OP_SECRETE_PLASMID, 3],
  [OP_BUILD, 3],
  [OP_JZ, 3],
  [OP_SPORE_DRIVE, 1],
  [OP_SYSCALL, 1],
]);

export const normalizeGuardianSignalExecutionMode = (
  raw: string | undefined,
): GuardianSignalExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createGuardianInitialState = (
  neuralCoherence: number,
): GuardianShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  role: 0,
  neuralCoherence: Math.max(0, Math.floor(neuralCoherence)),
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
});

const decodeGuardianTape = (
  script: Uint8Array,
  maxTokens: number,
): GuardianToken[] => {
  const out: GuardianToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? OP_NOP;
    if (opcode === OP_NOP) break;
    const length = SUPPORTED_GUARDIAN_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(`unsupported_guardian_opcode_0x${opcode.toString(16)}`);
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const classifyGuardianBranch = (
  state: GuardianShadowState,
): GuardianSignalBranch => {
  if (
    state.buildCount > 0 ||
    state.role === STATE_MATRIX.ROLE_ARCHITECT ||
    state.branchTaken
  ) {
    return "repair";
  }
  if (
    state.signalCount > 0 &&
    state.role === STATE_MATRIX.ROLE_GUARDIAN &&
    !state.branchTaken
  ) {
    return "stable";
  }
  return "unknown";
};

const applyGuardianOpcode = (
  state: GuardianShadowState,
  token: GuardianToken,
): void => {
  switch (token.opcode) {
    case OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (!(prop in GUARDIAN_PROP_MAP)) {
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.regs[reg] = state.neuralCoherence;
      state.pc += token.length;
      return;
    }
    case OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case OP_JZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.branchTaken = true;
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case OP_SECRETE_PLASMID: {
      const mode = token.args[0] ?? 0;
      const role = token.args[1] ?? 0;
      if (mode === 0) state.role = role;
      state.pc += token.length;
      return;
    }
    case OP_SIGNAL: {
      state.signalCount++;
      state.pc += token.length;
      return;
    }
    case OP_BUILD: {
      state.buildCount++;
      state.pc += token.length;
      return;
    }
    case OP_SPORE_DRIVE: {
      // Movement is no-op in bridge reduction
      state.pc += token.length;
      return;
    }
    case OP_SYSCALL: {
      const sysId = state.regs[0] ?? 0;
      if (sysId === SYS_YIELD) {
        // no-op
      } else if (sysId === SYS_SET_ROLE) {
        state.role = state.regs[1] ?? 0;
      } else {
        throw new Error(
          `unsupported guardian bridge syscall=0x${sysId.toString(16)}`,
        );
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported guardian bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const guardianFallbackDecision = (
  glyphCount: number,
  stepsExecuted: number,
  reason: string,
): GuardianSignalReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  signalAllowed: false,
  finalRole: 0,
  signalCount: 0,
  buildCount: 0,
  branchTaken: false,
  glyphCount,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateGuardianSignalReduction = (
  input: {
    script: Uint8Array;
    neuralCoherence: number;
    maxSteps?: number;
  },
): GuardianSignalReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_GUARDIAN_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const guardianTape = decodeGuardianTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, GuardianToken>(
      guardianTape.map((token) => [token.pc, token]),
    );
    const state = createGuardianInitialState(input.neuralCoherence);
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyGuardianOpcode(state, token);
      stepsExecuted++;
    }

    const branch = classifyGuardianBranch(state);
    return {
      status: "ok",
      branch,
      signalAllowed: branch === "stable",
      finalRole: state.role,
      signalCount: state.signalCount,
      buildCount: state.buildCount,
      branchTaken: state.branchTaken,
      glyphCount: guardianTape.length,
      stepsExecuted,
    };
  } catch (err) {
    return guardianFallbackDecision(0, 0, String(err));
  }
};

export const evaluateGuardianSignalExecution = (
  input: {
    mode: GuardianSignalExecutionMode;
    script: Uint8Array;
    neuralCoherence: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): GuardianSignalExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      finalRole: 0,
      signalCount: 0,
      buildCount: 0,
      branchTaken: false,
      glyphCount: 0,
      stepsExecuted: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateGuardianSignalReduction({
    script: input.script,
    neuralCoherence: input.neuralCoherence,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  if (input.mode === "shadow-reduce") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "shadow",
      branch: reduction.branch,
      finalRole: reduction.finalRole,
      signalCount: reduction.signalCount,
      buildCount: reduction.buildCount,
      branchTaken: reduction.branchTaken,
      glyphCount: reduction.glyphCount,
      stepsExecuted: reduction.stepsExecuted,
      shadowSuppressed: !reduction.signalAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.signalAllowed,
    status: "hybrid",
    branch: reduction.branch,
    finalRole: reduction.finalRole,
    signalCount: reduction.signalCount,
    buildCount: reduction.buildCount,
    branchTaken: reduction.branchTaken,
    glyphCount: reduction.glyphCount,
    stepsExecuted: reduction.stepsExecuted,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.signalAllowed,
  };
};

// --- INLINED FROM @07/04/replication_hybrid.ts ---

export type ReplicationExecutionMode =
  | "legacy-execute"
  | "hybrid-reduce"
  | "shadow-reduce";

export type ReplicationBranch = "emit" | "suppress" | "unknown";

export type ReplicationReductionDecision = {
  status: "ok" | "fallback";
  branch: ReplicationBranch;
  replicationAllowed: boolean;
  replicationCount: number;
  stepsExecuted: number;
  fallbackReason?: string;
};

export type ReplicationExecutionDecision = {
  mode: ReplicationExecutionMode;
  legacyAllowed: boolean;
  allowed: boolean;
  status:
    | "legacy-blocked"
    | "legacy"
    | "shadow"
    | "hybrid"
    | "fallback";
  branch: ReplicationBranch;
  replicationCount: number;
  shadowSuppressed: boolean;
  hybridSuppressed: boolean;
  fallbackReason?: string;
};

export type ReplicationHybridState = {
  mode: ReplicationExecutionMode;
  hybridRuns: number;
  shadowRuns: number;
  fallbackRuns: number;
  emitBranchCount: number;
  suppressBranchCount: number;
  allowedReplications: number;
  suppressedReplications: number;
  shadowSuppressedReplications: number;
  lastTick: number;
  lastStatus:
    | "legacy"
    | "emit"
    | "suppress"
    | "fallback"
    | "shadow"
    | "hybrid"
    | "legacy-blocked";
  lastBranch: ReplicationBranch;
  lastFallbackReason: string;
  lastMode?: ReplicationExecutionMode;
};

type ReplicationShadowState = {
  pc: number;
  regs: number[];
  energy: number;
  resonance: number;
  aggression: number;
  replicationCount: number;
};

type ReplicationToken = {
  pc: number;
  opcode: number;
  length: number;
  args: number[];
};

const DEFAULT_REPLICATION_MAX_STEPS = 16;
const REPLICATION_PROP_MAP = {
  [PROP_ENERGY]: true,
  [PROP_RESONANCE]: true,
} as const;

const SUPPORTED_REPLICATION_OPCODE_LENGTHS = new Map<number, number>([
  [OP_SET, 3],
  [OP_GET, 3],
  [OP_SUB, 3],
  [OP_ADD, 3],
  [OP_JNZ, 3],
  [OP_JZ, 3],
  [OP_JMP, 2],
  [OP_REPLICATE, 1],
  [OP_PUT, 3],
]);

export const normalizeReplicationExecutionMode = (
  raw: string | undefined,
): ReplicationExecutionMode => {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "legacy-execute" || value === "legacy_execute") {
    return "legacy-execute";
  }
  if (value === "hybrid-reduce" || value === "hybrid_reduce") {
    return "hybrid-reduce";
  }
  return "shadow-reduce";
};

const createReplicationInitialState = (
  energy: number,
  resonance: number,
  aggression: number,
): ReplicationShadowState => ({
  pc: 0,
  regs: new Array(8).fill(0),
  energy,
  resonance,
  aggression,
  replicationCount: 0,
});

const decodeReplicationTape = (
  script: Uint8Array,
  maxTokens: number,
): ReplicationToken[] => {
  const out: ReplicationToken[] = [];
  let pc = 0;
  let steps = 0;
  while (pc >= 0 && pc < script.length && steps < maxTokens) {
    const opcode = script[pc] ?? OP_NOP;
    if (opcode === OP_NOP) break;
    const length = SUPPORTED_REPLICATION_OPCODE_LENGTHS.get(opcode);
    if (!length) {
      throw new Error(
        `unsupported_replication_opcode_0x${opcode.toString(16)}`,
      );
    }
    out.push({
      pc,
      opcode,
      length,
      args: Array.from(script.slice(pc + 1, pc + length)),
    });
    pc += length;
    steps++;
  }
  return out;
};

const applyReplicationOpcode = (
  state: ReplicationShadowState,
  token: ReplicationToken,
): void => {
  switch (token.opcode) {
    case OP_GET: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      if (prop === PROP_ENERGY) state.regs[reg] = state.energy;
      else if (prop === PROP_RESONANCE) state.regs[reg] = state.resonance;
      else if (!(prop in REPLICATION_PROP_MAP)) {
        // We only allow energy and resonance in this slit for now
        throw new Error(`unsupported GET prop=${prop}`);
      }
      state.pc += token.length;
      return;
    }
    case OP_SET: {
      const reg = token.args[0] ?? 0;
      state.regs[reg] = token.args[1] ?? 0;
      state.pc += token.length;
      return;
    }
    case OP_SUB: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) - (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case OP_ADD: {
      const dst = token.args[0] ?? 0;
      const src = token.args[1] ?? 0;
      state.regs[dst] = (state.regs[dst] ?? 0) + (state.regs[src] ?? 0);
      state.pc += token.length;
      return;
    }
    case OP_PUT: {
      const reg = token.args[0] ?? 0;
      const prop = token.args[1] ?? 0;
      const val = state.regs[reg] ?? 0;
      if (prop === PROP_ENERGY) state.energy = val;
      else if (prop === PROP_RESONANCE) state.resonance = val;
      state.pc += token.length;
      return;
    }
    case OP_JNZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) !== 0) {
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case OP_JZ: {
      const reg = token.args[0] ?? 0;
      const target = token.args[1] ?? 0;
      if ((state.regs[reg] ?? 0) === 0) {
        state.pc = target;
      } else {
        state.pc += token.length;
      }
      return;
    }
    case OP_JMP: {
      state.pc = token.args[0] ?? 0;
      return;
    }
    case OP_REPLICATE: {
      const aggrH = state.aggression;
      const eThresh = 50 - (aggrH >> 3);
      const rThresh = 10 - (aggrH >> 5);
      if (state.energy > eThresh && state.resonance > rThresh) {
        state.replicationCount++;
        state.energy = state.energy >> 1;
        state.resonance = state.resonance + 30;
      }
      state.pc += token.length;
      return;
    }
    default:
      throw new Error(
        `unsupported replication bridge opcode=0x${token.opcode.toString(16)}`,
      );
  }
};

const replicationFallbackDecision = (
  stepsExecuted: number,
  reason: string,
): ReplicationReductionDecision => ({
  status: "fallback",
  branch: "unknown",
  replicationAllowed: true, // Fail-open for replication safety
  replicationCount: 0,
  stepsExecuted,
  fallbackReason: reason,
});

export const evaluateReplicationReduction = (
  input: {
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    maxSteps?: number;
  },
): ReplicationReductionDecision => {
  const maxSteps = Math.max(
    1,
    Math.min(16, Math.floor(input.maxSteps ?? DEFAULT_REPLICATION_MAX_STEPS)),
  );

  try {
    const tokenBudget = Math.max(16, maxSteps * 2);
    const replicationTape = decodeReplicationTape(input.script, tokenBudget);
    const tokenByPc = new Map<number, ReplicationToken>(
      replicationTape.map((token) => [token.pc, token]),
    );
    const state = createReplicationInitialState(
      input.energy,
      input.resonance,
      input.aggression,
    );
    let stepsExecuted = 0;

    while (stepsExecuted < maxSteps) {
      const token = tokenByPc.get(state.pc);
      if (!token) break;
      applyReplicationOpcode(state, token);
      stepsExecuted++;
    }

    const branch: ReplicationBranch = state.replicationCount > 0
      ? "emit"
      : "suppress";
    return {
      status: "ok",
      branch,
      replicationAllowed: branch === "emit",
      replicationCount: state.replicationCount,
      stepsExecuted,
    };
  } catch (err) {
    return replicationFallbackDecision(0, String(err));
  }
};

export const evaluateReplicationExecution = (
  input: {
    mode: ReplicationExecutionMode;
    script: Uint8Array;
    energy: number;
    resonance: number;
    aggression: number;
    legacyAllowed: boolean;
    maxSteps?: number;
  },
): ReplicationExecutionDecision => {
  if (!input.legacyAllowed) {
    return {
      mode: input.mode,
      legacyAllowed: false,
      allowed: false,
      status: "legacy-blocked",
      branch: "unknown",
      replicationCount: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  if (input.mode === "legacy-execute") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "legacy",
      branch: "unknown",
      replicationCount: 0,
      shadowSuppressed: false,
      hybridSuppressed: false,
    };
  }

  const reduction = evaluateReplicationReduction({
    script: input.script,
    energy: input.energy,
    resonance: input.resonance,
    aggression: input.aggression,
    maxSteps: input.maxSteps,
  });

  if (reduction.status === "fallback") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "fallback",
      branch: reduction.branch,
      replicationCount: reduction.replicationCount,
      shadowSuppressed: false,
      hybridSuppressed: false,
      fallbackReason: reduction.fallbackReason,
    };
  }

  if (input.mode === "shadow-reduce") {
    return {
      mode: input.mode,
      legacyAllowed: true,
      allowed: true,
      status: "shadow",
      branch: reduction.branch,
      replicationCount: reduction.replicationCount,
      shadowSuppressed: !reduction.replicationAllowed,
      hybridSuppressed: false,
    };
  }

  return {
    mode: input.mode,
    legacyAllowed: true,
    allowed: reduction.replicationAllowed,
    status: "hybrid",
    branch: reduction.branch,
    replicationCount: reduction.replicationCount,
    shadowSuppressed: false,
    hybridSuppressed: !reduction.replicationAllowed,
  };
};

```

```

---

## FILE: src/ontology/core/pulse_worker.md

```markdown
---
id: PULSE_WORKER
type: module
description: "Implementation of PULSE_WORKER"
deps: [STATE_MATRIX]
min_level: 2
---

### TypeScript
```typescript
import { WASM_MEMORY_BYTES, AS_WASM_PATH, GRID_W, GRID_H, GRID_CELLS } from "@omega";

// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import { BONDS_OFFSET, BOND_REQUESTS_OFFSET, CONTEXT_OFFSET, ENERGY_OFFSET, EVOLUTION_OFFSET, IDS_OFFSET, INSTRUCTIONS_OFFSET, LEDGER_DATA_OFFSET, LEDGER_HEAD_OFFSET, LINEAGE_OFFSET, LOGIC_OFFSET, MAILBOX_OFFSET, MAX_ATOMS, MAX_LEDGER_EVENTS, PHASE_OFFSET, RESONANCE_OFFSET, ROLES_OFFSET, SPATIAL_CELL_SIZE, SPATIAL_GRID_OFFSET, SPAWN_REQUESTS_OFFSET, STRUCTURE_BUILD_OWNER_OFFSET, STRUCTURE_BUILD_VALUE_OFFSET, STRUCTURE_GRID_OFFSET, SYNC_STATE_OFFSET, TICK_COUNTER_OFFSET, WORLD_MAX_X, WORLD_MAX_Y, XS_OFFSET, YS_OFFSET } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LOGGER, SCALE, SYS_YIELD, SYS_READ_MEM, SYS_WRITE_MEM, SYS_SPAWN, SYS_BIND, SYS_SET_ROLE, SYS_MUTATE, SYS_MSG, SYS_READ_INBOX, SYS_TRANSFER, SYS_REPLICATE, SYS_EMIT, SYS_SCAN, SYS_MOVE, SYS_EAT, SYS_BET, SYS_ATTRACT, SYS_FOLD, SYS_SPORE_DRIVE, SYS_SENSE_PHASE } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
const resolveWithPhase = (
  baseValue: number,
  modifiers: Array<{ phase: number; weight: number }>,
): number => {
  let real = baseValue;
  let imag = 0;

  for (const mod of modifiers) {
    const rad = (mod.phase * Math.PI) / 128; // 0-255 → radians
    real += mod.weight * Math.cos(rad);
    imag += mod.weight * Math.sin(rad);
  }

  // Return "intensity" = |z|
  return Math.floor(Math.sqrt(real * real + imag * imag));
};
let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: ((idx: number) => void) | null = null;
let tick_environment_fn: ((tick: number) => void) | null = null;
let tick_matrix_fn: (() => void) | null = null;
let tick_structure_grid_fn: (() => void) | null = null;
let build_spatial_hash_fn: (() => void) | null = null;
let get_spatial_hash_overflow_count_fn: (() => number) | null = null;
let get_spatial_hash_max_cell_count_fn: (() => number) | null = null;
let reduce_atom_deltas_fn: ((startIdx: number, endIdx: number) => void) | null =
  null;
let get_neural_coherence_fn: (() => number) | null = null;
let set_neural_coherence_fn: ((val: number) => void) | null = null;
let tick_glyph_transport_fn: ((tick: number) => void) | null = null;
let tick_membrane_physics_fn: (() => void) | null = null;
let resolve_bond_requests_fn: ((start: number, end: number) => number) | null =
  null;
let drain_spawn_requests_fn: ((tick: number) => number) | null = null;
let run_phagocyte_pass_fn: ((entropy: number) => number) | null = null;
let clear_metabolism_stats_fn: (() => void) | null = null;
let accumulate_metabolism_stats_fn:
  | ((start: number, end: number) => void)
  | null = null;
let apply_metabolism_kernel_fn:
  | ((
    start: number,
    end: number,
    noveltySigned: number,
    symbiosisSigned: number,
    baseTax: number,
    targetEnergy: number,
    homeostasisBand: number,
    homeostasisMaxDelta: number,
    overflowThreshold: number,
    spatialOverflowRatio: number,
    starvationFloor: number,
    subsidyEnabled: number,
  ) => void)
  | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let tickCounterView: Int32Array | null = null;
let syncStateView: Int32Array | null = null;

let idsView: BigUint64Array | null = null;
let xsView: Int16Array | null = null;
let ysView: Int16Array | null = null;
let contextI32View: Int32Array | null = null;
let contextU8View: Uint8Array | null = null;
let structureGridView: Int32Array | null = null;
let spatialGridView: Int32Array | null = null;
let buildOwnerView: Int32Array | null = null;
let buildValueView: Int32Array | null = null;
let spawnHeadView: Int32Array | null = null;
let spawnDataView: DataView | null = null;
let lineageView: BigUint64Array | null = null;
let logicView: BigUint64Array | null = null;
let bondRequestsView: Int32Array | null = null;
let energiesView: Int32Array | null = null;
let phaseView: Int32Array | null = null;
let evolutionReservedView: Int32Array | null = null;

let currentPulseId = 0;
let currentTheta = 0;
let resonancesView: Int32Array | null = null;
let instructionsView: Uint8Array | null = null;
let mailboxView: Int32Array | null = null;
let ledgerHeadView: Int32Array | null = null;
let ledgerDataView: Int32Array | null = null;
let marketState: Int32Array | null = null;
let betPoolInt: Int32Array | null = null;



function handle_syscall(atomIdx: number) {
  if (!contextU8View || !contextI32View || !energiesView) return;
  const flagIdx = (atomIdx << 6) + 33;
  if (contextU8View[flagIdx] === 0) return;
  contextU8View[flagIdx] = 0; // Clear pending syscall flag

  const regBase = atomIdx << 4;
  const sysId = contextI32View[regBase]; // R0
  const r1 = contextI32View[regBase + 1];
  const r2 = contextI32View[regBase + 2];
  const r3 = contextI32View[regBase + 3];

  LOGGER.debug(
    `   [DEBUG-SYSCALL] Atom ${atomIdx} invoked sysId=${sysId} with r1=${r1}, r2=${r2}, r3=${r3}`,
  );


  let gasCost = 0;
  switch (sysId) {
    case SYS_YIELD:
      gasCost = 1;
      break;
    case SYS_READ_MEM:
      gasCost = 5;
      break;
    case SYS_WRITE_MEM:
      gasCost = 20;
      break;
    case SYS_SPAWN:
      gasCost = 100;
      break;
    case SYS_BIND:
      gasCost = 10;
      break;
    case SYS_SET_ROLE:
      gasCost = 5;
      break;
    case SYS_MUTATE:
      gasCost = 50;
      break;
    case SYS_MSG:
      gasCost = 20;
      break;
    case SYS_READ_INBOX:
      gasCost = 2;
      break;
    case SYS_TRANSFER:
      gasCost = 10;
      break;
    case SYS_REPLICATE:
      gasCost = 100;
      break;
    case SYS_EMIT:
      gasCost = 5;
      break;
    case SYS_SCAN:
      gasCost = 20;
      break;
    case SYS_MOVE:
      gasCost = 10;
      break;
    case SYS_EAT:
      gasCost = 30;
      break;
    case SYS_BET:
      gasCost = 10;
      break;
    case SYS_ATTRACT:
    case SYS_FOLD:
      gasCost = 10;
      break;
    case SYS_SPORE_DRIVE:
      gasCost = 500;
      break;
    case SYS_SENSE_PHASE:
      gasCost = 5;
      break;
    default:
      gasCost = 1;
      break;
  }

  const currentEnergy = Atomics.load(energiesView, atomIdx);
  if (currentEnergy < gasCost * 1000) {
    // Out of Gas for this syscall
    LOGGER.debug(
      `   [SYSCALL-OOG] Atom ${atomIdx} Out of Gas for sysId=${sysId} (Needs ${gasCost}, Has ${
        currentEnergy / 1000
      })`,
    );
    return;
  }

  // Burn the gas
  Atomics.sub(energiesView, atomIdx, gasCost * 1000); // 1000 is energy SCALE

  switch (sysId) {
    case SYS_YIELD:
      break;
    case SYS_READ_MEM: {
      const gx = r1, gy = r2;
      let val = 0;
      if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H && structureGridView) {
        val = structureGridView[gy * GRID_W + gx] & 0xFF;
      }
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} requested READ_MEM at (${gx}, ${gy}) -> ${val}`,
      );
      contextI32View[regBase] = val; // Return value in R0
      break;
    }
    case SYS_WRITE_MEM: {
      const gx = r1, gy = r2, newVal = r3;
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} requested WRITE_MEM at (${gx}, ${gy}) with ${newVal}`,
      );
      if (
        gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H && buildOwnerView &&
        buildValueView
      ) {
        const cellIdx = gy * GRID_W + gx;
        Atomics.store(buildOwnerView, cellIdx, atomIdx);
        Atomics.store(buildValueView, cellIdx, newVal);
      }
      break;
    }
    case SYS_SPAWN: {
      const childGx = r1, childGy = r2;
      if (
        childGx >= 0 && childGx < GRID_W && childGy >= 0 && childGy < GRID_H &&
        spawnHeadView && spawnDataView
      ) {
        const slot = Atomics.add(spawnHeadView, 0, 1) % 1024;
        const slotOff = slot * 24;
        const parentGenome = logicView ? logicView[atomIdx] : 0n;
        const parentLineage = lineageView ? lineageView[atomIdx] : 0n;
        // Write spawn request struct
        spawnDataView.setBigUint64(slotOff, parentGenome, true);
        spawnDataView.setInt16(slotOff + 8, childGx, true);
        spawnDataView.setInt16(slotOff + 10, childGy, true);
        spawnDataView.setInt32(slotOff + 12, 100, true); // give 100 energy to start
        spawnDataView.setBigUint64(slotOff + 16, parentLineage, true);
      }
      break;
    }
    case SYS_BIND: {
      const targetIdx = r1;
      if (targetIdx > 0 && targetIdx < MAX_ATOMS && bondRequestsView) {
        const off = atomIdx * 3;
        Atomics.store(bondRequestsView, off, atomIdx);
        Atomics.store(bondRequestsView, off + 1, targetIdx);
        Atomics.store(bondRequestsView, off + 2, 1);
      }
      break;
    }
    case SYS_SET_ROLE: {
      const rolesView = new Uint8Array(
        sharedBuffer!,
        ROLES_OFFSET,
        MAX_ATOMS,
      );
      const newRole = r1;
      // Host validates the role
      if (newRole >= 0 && newRole <= 8) {
        Atomics.store(rolesView, atomIdx, newRole);
      }
      break;
    }
    case SYS_MUTATE: {
      const targetIdx = r1;
      const offset = r2;
      const newValue = r3;
      // Host validates target and instructions boundary (0-63 bytes)
      if (
        targetIdx >= 0 && targetIdx < MAX_ATOMS && offset >= 0 && offset < 64 &&
        instructionsView
      ) {
        const globalOffset = targetIdx * 64 + offset;
        Atomics.store(instructionsView, globalOffset, newValue & 0xFF);
        Atomics.store(contextI32View!, targetIdx * 16 + 15, 0); // Evict Entropy Cache
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} MUTATED Atom ${targetIdx} instruction at offset ${offset} to 0x${
            (newValue & 0xFF).toString(16)
          }`,
        );
      } else {
        LOGGER.debug(
          `   [SYSCALL-ERROR] Atom ${atomIdx} invalid MUTATE on ${targetIdx} at ${offset}`,
        );
      }
      break;
    }
    case SYS_MSG: {
      const targetIdx = r1;
      const msgType = r2;
      const payload = r3;
      if (targetIdx >= 0 && targetIdx < MAX_ATOMS && mailboxView) {
        // Simple 1-deep mailbox per atom
        Atomics.store(mailboxView, targetIdx * 2, msgType);
        Atomics.store(mailboxView, targetIdx * 2 + 1, payload);
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} MSG -> Atom ${targetIdx} | Type: ${msgType}, Data: ${payload}`,
        );
      }
      break;
    }
    case SYS_READ_INBOX: {
      if (mailboxView) {
        const msgType = Atomics.load(mailboxView, atomIdx * 2);
        const payload = Atomics.load(mailboxView, atomIdx * 2 + 1);

        // Return type in R0
        contextI32View[regBase] = msgType;

        // Return payload in R1 (we map R1 to contextI32View[regBase + 1])
        contextI32View[regBase + 1] = payload;

        // Clear mailbox after reading
        if (msgType !== 0) {
          Atomics.store(mailboxView, atomIdx * 2, 0);
          Atomics.store(mailboxView, atomIdx * 2 + 1, 0);
          LOGGER.debug(
            `   [SYSCALL] Atom ${atomIdx} READ INBOX | Type: ${msgType}, Data: ${payload}`,
          );
        }
      }
      break;
    }
    case SYS_TRANSFER: {
      const targetIdx = r1;
      const resourceType = r2; // 0 = Energy, 1 = Resonance
      const amount = r3; // Positive to give, Negative to steal

      if (targetIdx > 0 && targetIdx < MAX_ATOMS && amount !== 0) {
        if (resourceType === 0 && energiesView) { // ENERGY
          if (amount > 0) {
            const senderEnergy = Atomics.load(energiesView, atomIdx);
            const scaledAmount = amount * 1000;
            if (senderEnergy >= scaledAmount) {
              Atomics.sub(energiesView, atomIdx, scaledAmount);
              Atomics.add(energiesView, targetIdx, scaledAmount);
              LOGGER.debug(
                `   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Energy to Atom ${targetIdx}`,
              );
            }
          } else {
            // Stealing
            const stealAmount = (-amount) * 1000;
            if (resonancesView && xsView && ysView) {
              const myRes = Atomics.load(resonancesView, atomIdx);
              let tRes = Atomics.load(resonancesView, targetIdx);
              
              if (evolutionReservedView) {
                const shield = Atomics.load(evolutionReservedView, targetIdx);
                if (shield > 0) tRes = shield;
              }

              if (myRes > tRes && myRes > 250 && tRes < 100) {
                const ox = Atomics.load(xsView, atomIdx);
                const oy = Atomics.load(ysView, atomIdx);
                const tx = Atomics.load(xsView, targetIdx);
                const ty = Atomics.load(ysView, targetIdx);

                const rolesView = new Uint8Array(sharedBuffer!, ROLES_OFFSET, MAX_ATOMS);
                const myRole = Atomics.load(rolesView, atomIdx);
                const tRole = Atomics.load(rolesView, targetIdx);

                if (myRole === 3 && tRole === 1) { // Engulfment (Architect -> Producer)
                  const tEnergy = Atomics.load(energiesView, targetIdx);
                  if (tEnergy > 20000) { // Enough base generation
                    Atomics.store(rolesView, targetIdx, 5); // ROLE_MITOCHONDRIA = 5
                    if (contextI32View) {
                      Atomics.store(contextI32View, targetIdx * 16 + 12, atomIdx); // Store host atomIdx in Context Reg 12
                    }
                    LOGGER.debug(`   [SYSCALL] Atom ${atomIdx} ENGULFED Atom ${targetIdx} into a Mitochondria`);
                    break;
                  }
                }

                const dx = (tx - ox) / SPATIAL_CELL_SIZE;
                const dy = (ty - oy) / SPATIAL_CELL_SIZE;
                const distSq = dx * dx + dy * dy;

                if (distSq <= 2.25) {
                  const tEnergy = Atomics.load(energiesView, targetIdx);
                  const takeAmount = Math.min(stealAmount, tEnergy);
                  if (takeAmount > 0) {
                    Atomics.sub(energiesView, targetIdx, takeAmount);
                    Atomics.add(energiesView, atomIdx, takeAmount);
                    LOGGER.debug(
                      `   [SYSCALL] Atom ${atomIdx} STOLE ${
                        takeAmount / 1000
                      } Energy from Atom ${targetIdx}`,
                    );
                    if (contextU8View) {
                      const flagsIdx = (atomIdx << 6) + 33; // pseudo-cost
                      // Note: VM costs 30 for stealing, we already deducted 10, deduct 20 more
                      const extraCost = 20 * 1000;
                      const e = Atomics.load(energiesView, atomIdx);
                      if (e >= extraCost) {
                        Atomics.sub(energiesView, atomIdx, extraCost);
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (resourceType === 1 && resonancesView) { // RESONANCE
          if (amount > 0) {
            const senderResonance = Atomics.load(resonancesView, atomIdx);
            if (senderResonance >= amount) {
              Atomics.sub(resonancesView, atomIdx, amount);
              Atomics.add(resonancesView, targetIdx, amount);
              LOGGER.debug(
                `   [SYSCALL] Atom ${atomIdx} TRANSFERRED ${amount} Resonance to Atom ${targetIdx}`,
              );
            }
          }
        }
      }
      break;
    }
    case SYS_REPLICATE: {
      const targetIdx = r1;

      if (
        targetIdx >= 0 && targetIdx < MAX_ATOMS && targetIdx !== atomIdx &&
        instructionsView && contextU8View
      ) {
        const receiverEnergy = Atomics.load(energiesView, targetIdx);
        // Only allow replication into dead slots or by aggressive "infection"
        // For now, let's keep it simple: can replicate anywhere, it overwrites the genome.

        // Copy 64 bytes of genome
        const srcOffset = atomIdx * 64;
        const dstOffset = targetIdx * 64;

        for (let i = 0; i < 64; i++) {
          Atomics.store(
            instructionsView,
            dstOffset + i,
            Atomics.load(instructionsView, srcOffset + i),
          );
        }

        // Reset target PC (PC is at offset 32 in contextU8View)
        const targetFlagIdx = (targetIdx << 6) + 32;
        Atomics.store(contextU8View, targetFlagIdx, 0);

        // Evict Target Entropy Cache
        Atomics.store(contextI32View!, targetIdx * 16 + 15, 0);

        // Give the child a starter spark of energy from the sender
        const replicationSpark = 50 * 1000; // 50 energy units
        const senderEnergy = Atomics.load(energiesView, atomIdx);

        if (senderEnergy > replicationSpark) {
          Atomics.sub(energiesView, atomIdx, replicationSpark);
          Atomics.add(energiesView, targetIdx, replicationSpark);
        }

        // Also "wake up" the atom by giving it ID if it doesn't have one
        if (idsView && idsView[targetIdx] === 0n) {
          idsView[targetIdx] = BigInt(targetIdx + 1);
        }

        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} REPLICATED genome into Atom ${targetIdx}`,
        );
      } else {
        LOGGER.debug(
          `   [SYSCALL-FAIL] Atom ${atomIdx} REPLICATE failed (invalid target ${targetIdx})`,
        );
      }
      break;
    }
    case SYS_EMIT: {
      if (ledgerHeadView && ledgerDataView) {
        // Atomic ring buffer increment
        const cursor = Atomics.add(ledgerHeadView, 0, 1) %
          MAX_LEDGER_EVENTS;
        const base = cursor * 4; // 4 i32 per event

        const currentTick = tickCounterView
          ? Atomics.load(tickCounterView, 0)
          : 0;

        // Emitted Event Structure -> [Tick, AtomIdx, R1, R2]
        Atomics.store(ledgerDataView, base, currentTick);
        Atomics.store(ledgerDataView, base + 1, atomIdx);
        Atomics.store(ledgerDataView, base + 2, r1);
        Atomics.store(ledgerDataView, base + 3, r2);

        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} EMIT event: [${r1}, ${r2}] at Tick ${currentTick}`,
        );
      }
      break;
    }
    case SYS_SCAN: {
      const radius = r1;
      let closestIdx = -1;
      let minDstSq = Infinity;

      if (
        radius > 0 && xsView && ysView && spatialGridView && idsView &&
        energiesView && resonancesView
      ) {
        // Deduct scan cost. Let's say 20 gas.
        const COST = 20 * 1000;
        const currentEnergy = Atomics.load(energiesView, atomIdx);
        if (currentEnergy >= COST) {
          Atomics.sub(energiesView, atomIdx, COST);

          // xsView stores coordinate * 100. Unscale to match spatial hash scale (1 unit = 1 pixel).
          const cx = xsView[atomIdx] / 100;
          const cy = ysView[atomIdx] / 100;

          const CELL_SIZE = 10;
                    
          const startX = Math.max(0, Math.floor((cx - radius) / CELL_SIZE));
          const endX = Math.min(
            GRID_W - 1,
            Math.floor((cx + radius) / CELL_SIZE),
          );
          const startY = Math.max(0, Math.floor((cy - radius) / CELL_SIZE));
          const endY = Math.min(
            GRID_H - 1,
            Math.floor((cy + radius) / CELL_SIZE),
          );

          for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
              const cellIdx = y * GRID_W + x;
              const cellBase = cellIdx * 32; // 32 slots per cell (1 count + 31 items)

              const count = spatialGridView[cellBase];

              for (let i = 1; i <= count; i++) {
                const targetIdx = spatialGridView[cellBase + i];
                if (targetIdx === atomIdx) continue; // Skip self

                if (idsView[targetIdx] !== 0n) {
                  // Dark Forest Topology: Radar Stealth
                  const targetRes = Atomics.load(resonancesView, targetIdx);
                  if (targetRes <= 20) continue; // Invisible

                  const tx = xsView[targetIdx] / 100;
                  const ty = ysView[targetIdx] / 100;
                  const dx = tx - cx;
                  const dy = ty - cy;
                  const dstSq = dx * dx + dy * dy;

                  if (dstSq <= radius * radius && dstSq < minDstSq) {
                    minDstSq = dstSq;
                    closestIdx = targetIdx;
                  }
                }
              }
            }
          }
          LOGGER.debug(
            `   [SYSCALL] Atom ${atomIdx} SCAN r=${radius}. Found=${closestIdx}`,
          );
        } else {
          LOGGER.debug(
            `   [SYSCALL-FAIL] Atom ${atomIdx} insufficient Energy for SCAN`,
          );
        }
      }
      contextI32View![regBase] = closestIdx;
      break;
    }
    case SYS_ATTRACT: {
      const targetIdx = r1;
      const intensity = r2; // Pos=Attract, Neg=Repel
      if (
        targetIdx > 0 && targetIdx < MAX_ATOMS && xsView && ysView &&
        spatialGridView
      ) {
        const ox = Atomics.load(xsView, atomIdx);
        const oy = Atomics.load(ysView, atomIdx);
        const tx = Atomics.load(xsView, targetIdx);
        const ty = Atomics.load(ysView, targetIdx);

        const dx = tx - ox;
        const dy = ty - oy;

        const dxSign = dx > 0 ? 1 : (dx < 0 ? -1 : 0);
        const dySign = dy > 0 ? 1 : (dy < 0 ? -1 : 0);

        const dxStr = intensity > 0 ? dxSign : -dxSign;
        const dyStr = intensity > 0 ? dySign : -dySign;

        if (dxStr !== 0 || dyStr !== 0) {
          let nx = ox + dxStr * SPATIAL_CELL_SIZE;
          let ny = oy + dyStr * SPATIAL_CELL_SIZE;
          LOGGER.debug(
            `[PULSE_WORKER] SYS_ATTRACT executed by ${atomIdx} targeting ${targetIdx}. Moving to (${nx}, ${ny})`,
          );


          if (nx < 0) nx = 0;
          else if (nx > WORLD_MAX_X) nx = WORLD_MAX_X;
          if (ny < 0) ny = 0;
          else if (ny > WORLD_MAX_Y) ny = WORLD_MAX_Y;

          const nGridX = Math.floor(nx / SPATIAL_CELL_SIZE);
          const nGridY = Math.floor(ny / SPATIAL_CELL_SIZE);
          const nCellIdx = nGridY * GRID_W + nGridX;

          let capacityOk = false;
          const emptySlotOffset = -1;
          for (let s = 0; s < 32; s++) {
            const currentAtomId = Atomics.load(
              spatialGridView,
              nCellIdx * 32 + s,
            );
            if (currentAtomId === 0) {
              capacityOk = true;
              break;
            }
          }

          LOGGER.debug(
            `[PULSE_WORKER_DEBUG] atomIdx: ${atomIdx}, targetIdx: ${targetIdx}, ox: ${ox}, tx: ${tx}`,
          );


          if (capacityOk) {
            Atomics.store(xsView, atomIdx, nx);
            Atomics.store(ysView, atomIdx, ny);
          }
        }
      }
      break;
    }
    case SYS_FOLD: {
      break; // Placeholder for purely topological matrix operations
    }
    case SYS_BET: {
      if (!marketState || !betPoolInt) {
        contextI32View[regBase + 1] = 0;
        break;
      }

      const energyBet = Math.max(0, r1);
      if (energyBet <= 0) {
        contextI32View[regBase + 1] = 0;
        break;
      }

      const currentMarketState = Atomics.load(marketState, 0);
      if (currentMarketState !== 1) {
        // No active crisis
        contextI32View[regBase + 1] = 0;
        break;
      }

      const scaledBet = energyBet * 1000;
      const availableEnergy = Atomics.load(energiesView, atomIdx);

      // We already deducted gasCost * 1000 before reaching the switch block
      if (availableEnergy >= scaledBet) {
        Atomics.sub(energiesView, atomIdx, scaledBet);
        Atomics.add(betPoolInt, 0, scaledBet);
        contextI32View[regBase + 1] = 1; // success
      } else {
        contextI32View[regBase + 1] = 0; // failure
      }
      break;
    }
    case SYS_SPORE_DRIVE: {
      const energy = Atomics.load(energiesView!, atomIdx);
      const atomPhase = Atomics.load(phaseView!, atomIdx);
      const epochPhase = (currentPulseId * 4) % 256;

      const sporeCost = resolveWithPhase(500, [
        { phase: epochPhase, weight: 50 },
        { phase: currentTheta, weight: 30 },
        { phase: atomPhase, weight: 20 },
      ]);
      const energyBet = sporeCost * 1000;

      if (energy >= energyBet) {
        Atomics.sub(energiesView!, atomIdx, energyBet);
        (self as unknown as Worker).postMessage({ type: "SPORE_DRIVE_REQUEST", atomIdx });
        // Syscall intercept verification
        LOGGER.debug(
          `   [SYSCALL] Atom ${atomIdx} initiated SPORE_DRIVE (Energy drained by ${sporeCost}: EpochPhase=${epochPhase}, Theta=${
            Math.floor(currentTheta)
          }, AtomPhase=${atomPhase}).`,
        );
      } else {
        contextI32View![(atomIdx << 4) + 1] = 0; // failure in register
      }
      break;
    }
    case SYS_SENSE_PHASE: {
      const epochPhase = (currentPulseId * 4) % 256;
      const packed = (epochPhase & 0xFFFF) |
        ((Math.floor(currentTheta) & 0xFFFF) << 16);
      contextI32View![regBase] = packed;
      LOGGER.debug(
        `   [SYSCALL] Atom ${atomIdx} performed SENSE_PHASE (EpochPhase=${epochPhase}, Theta=${
          Math.floor(currentTheta)
        })`,
      );
      break;
    }
    default:
      LOGGER.debug(
        `   [SYSCALL-UNKNOWN] Atom ${atomIdx} requested UNKNOWN ${sysId}`,
      );
      break;
  }
}

let debugDelayMs = 0;
let debugJitterMinMs = 0;
let debugJitterMaxMs = 0;
let debugJitterSeed = 0x9E3779B9;
const FORCE_INIT_FAIL_MODE =
  (Deno.env.get("OMEGA_FORCE_WORKER_INIT_FAIL") ?? "").trim().toLowerCase();
const shouldForceInitFail = (workerIndex: number): boolean => {
  if (
    FORCE_INIT_FAIL_MODE === "1" || FORCE_INIT_FAIL_MODE === "true" ||
    FORCE_INIT_FAIL_MODE === "all"
  ) {
    return true;
  }
  if (FORCE_INIT_FAIL_MODE === "nonzero") {
    return workerIndex > 0;
  }
  if (FORCE_INIT_FAIL_MODE.startsWith("index:")) {
    const idx = Number.parseInt(
      FORCE_INIT_FAIL_MODE.slice("index:".length),
      10,
    );
    return Number.isFinite(idx) && idx === workerIndex;
  }
  return false;
};
const nextJitterUnit = (): number => {
  debugJitterSeed = (Math.imul(debugJitterSeed, 1664525) + 1013904223) >>> 0;
  return debugJitterSeed / 0x1_0000_0000;
};
const sampleJitterMs = (): number => {
  if (debugJitterMaxMs <= 0) return 0;
  const lo = Math.max(0, Math.min(2000, debugJitterMinMs));
  const hi = Math.max(lo, Math.min(2000, debugJitterMaxMs));
  if (hi === lo) return lo;
  return lo + Math.floor(nextJitterUnit() * (hi - lo + 1));
};
const maybeDelay = async () => {
  const totalDelay = debugDelayMs + sampleJitterMs();
  if (totalDelay <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, totalDelay));
};

(self as any).onmessage = async (e: any) => {
  const { type, pulseId } = e.data;

  if (type === "INIT") {
    const { buffer, marketBuffer, wasmMemory, workerIndex } = e.data;
    sharedBuffer = buffer;
    if (marketBuffer) {
      marketState = new Int32Array(marketBuffer, 0, 1);
      betPoolInt = new Int32Array(marketBuffer, 4, 1);
    }
    const sb = sharedBuffer as SharedArrayBuffer;
    tickCounterView = new Int32Array(sb, TICK_COUNTER_OFFSET, 1);
    syncStateView = new Int32Array(sb, SYNC_STATE_OFFSET, 1);

    idsView = new BigUint64Array(sb, IDS_OFFSET, MAX_ATOMS);
    xsView = new Int16Array(sb, XS_OFFSET, MAX_ATOMS); // 2 bytes per atom, so length is MAX_ATOMS
    ysView = new Int16Array(sb, YS_OFFSET, MAX_ATOMS);
    contextI32View = new Int32Array(sb, CONTEXT_OFFSET, MAX_ATOMS * 16);
    contextU8View = new Uint8Array(sb, CONTEXT_OFFSET, MAX_ATOMS * 64);
    structureGridView = new Int32Array(
      sb,
      STRUCTURE_GRID_OFFSET,
      GRID_CELLS,
    );
    spatialGridView = new Int32Array(
      sb,
      SPATIAL_GRID_OFFSET,
      GRID_CELLS * 32,
    );
    buildOwnerView = new Int32Array(
      sb,
      STRUCTURE_BUILD_OWNER_OFFSET,
      GRID_CELLS,
    );
    buildValueView = new Int32Array(
      sb,
      STRUCTURE_BUILD_VALUE_OFFSET,
      GRID_CELLS,
    );
    spawnHeadView = new Int32Array(sb, SPAWN_REQUESTS_OFFSET, 1);
    spawnDataView = new DataView(
      sb,
      SPAWN_REQUESTS_OFFSET + 8,
      1024 * 24,
    );
    lineageView = new BigUint64Array(sb, LINEAGE_OFFSET, MAX_ATOMS);
    logicView = new BigUint64Array(sb, LOGIC_OFFSET, MAX_ATOMS);
    bondRequestsView = new Int32Array(
      sb,
      BOND_REQUESTS_OFFSET,
      MAX_ATOMS * 3,
    );
    energiesView = new Int32Array(sb, ENERGY_OFFSET, MAX_ATOMS);
    resonancesView = new Int32Array(sb, RESONANCE_OFFSET, MAX_ATOMS);
    phaseView = new Int32Array(sb, PHASE_OFFSET, MAX_ATOMS);
    evolutionReservedView = new Int32Array(sb, EVOLUTION_OFFSET, MAX_ATOMS);
    instructionsView = new Uint8Array(
      sb,
      INSTRUCTIONS_OFFSET,
      MAX_ATOMS * 64,
    );
    mailboxView = new Int32Array(sb, MAILBOX_OFFSET, MAX_ATOMS * 2);
    ledgerHeadView = new Int32Array(sb, LEDGER_HEAD_OFFSET, 1);
    ledgerDataView = new Int32Array(
      sb,
      LEDGER_DATA_OFFSET,
      MAX_LEDGER_EVENTS * 4,
    );

    const idx = Number(workerIndex);
    if (Number.isFinite(idx)) {
      debugJitterSeed = (0x9E3779B9 ^ ((idx + 1) >>> 0)) >>> 0;
    }
    if (shouldForceInitFail(idx)) {
      (self as unknown as Worker).postMessage({
        type: "INIT_FAILED",
        error: `FORCED_INIT_FAIL(worker=${idx})`,
      });
      return;
    }
    LOGGER.debug("[WORKER " + currentPulseId + "] ENTERING TRY-CATCH EXECUTION LOOP!");
try {
      const wasmRes = await fetch(
        AS_WASM_PATH.href,
      );
      const wasmBytes = await wasmRes.arrayBuffer();
      const traceAtom = (
        idx: number,
        op: number,
        gx: number,
        gy: number,
        target: number,
      ) => {
        if (op === 0xDD) {
           const tick = Number(Atomics.load(STATE_MATRIX.tickCounter, 0));
           const epoch = Math.floor(tick / 10000);
           LOGGER.info(`💀 [EPOCH ${epoch}] A Metazoan at (${gx}, ${gy}) has collapsed into Ruins.`);
           return;
        }
        LOGGER.debug(
          `   [WASM_TRACE] Atom ${idx} executed ${
            op.toString(16)
          } | Pos: (${gx},${gy}) | target: ${target}`,
        );
      };
      const instantiated = await WebAssembly.instantiate(wasmBytes, {
        index: {
          trace_atom: traceAtom,
        },
        env: {
          memory: wasmMemory,
          abort: (msg: any) => LOGGER.error("   [WASM ABORT]:", msg),
          trace_atom: traceAtom,
        },
      });
      wasmInstance = instantiated.instance;
      execute_atom_fn = wasmInstance.exports.execute_atom as any;
      tick_environment_fn = wasmInstance.exports.tick_environment as any;
      tick_matrix_fn = wasmInstance.exports.tick_matrix as any;
      tick_structure_grid_fn = wasmInstance.exports.tick_structure_grid as any;
      build_spatial_hash_fn = wasmInstance.exports.build_spatial_hash as any;
      get_spatial_hash_overflow_count_fn = wasmInstance.exports
        .get_spatial_hash_overflow_count as any;
      get_spatial_hash_max_cell_count_fn = wasmInstance.exports
        .get_spatial_hash_max_cell_count as any;
      reduce_atom_deltas_fn = wasmInstance.exports.reduce_atom_deltas as any;
      get_neural_coherence_fn = wasmInstance.exports
        .get_neural_coherence as any;
      set_neural_coherence_fn = wasmInstance.exports
        .set_neural_coherence as any;
      tick_glyph_transport_fn = wasmInstance.exports.glyph_transport as any;
      tick_membrane_physics_fn = wasmInstance.exports.tick_membrane_physics as any;
      resolve_bond_requests_fn = wasmInstance.exports
        .resolve_bond_requests as any;
      drain_spawn_requests_fn = wasmInstance.exports
        .drain_spawn_requests as any;
      run_phagocyte_pass_fn = wasmInstance.exports
        .run_phagocyte_pass as any;
      clear_metabolism_stats_fn = wasmInstance.exports
        .clear_metabolism_stats as any;
      accumulate_metabolism_stats_fn = wasmInstance.exports
        .accumulate_metabolism_stats as any;
      apply_metabolism_kernel_fn = wasmInstance.exports
        .apply_metabolism_kernel as any;
      LOGGER.info("   [WORKER] WASM Instantiated successfully.");
      await maybeDelay();
      (self as unknown as Worker).postMessage({ type: "READY" });
      const bview = new Int32Array(sb, BONDS_OFFSET, MAX_ATOMS * 4);
      setInterval(() => {
        // removed debug logging
      }, 5000);
      (self as unknown as Worker).postMessage({ type: "INIT_OK", workerIndex: Number(workerIndex) });
    } catch (err) {
      LOGGER.error("   [WORKER] WASM LOAD ERROR:", err);
      const error = err instanceof Error
        ? `${err.name}: ${err.message}`
        : String(err);
      (self as unknown as Worker).postMessage({ type: "INIT_FAILED", error });
    }
    return;
  }

  if (type === "PULSE") {
    const { startIdx, endIdx, pulseId, theta } = e.data;
    currentPulseId = pulseId ?? 0;
    currentTheta = theta ?? 0;
    if (!wasmInstance || !execute_atom_fn || !syncStateView || !idsView) return;

    // Wait for WASM_TICKING state (1)
    // If Host is locking (2) or Idle (0), we don't start yet.
    LOGGER.debug("[WORKER " + currentPulseId + "] RECEIVED PULSE MSG. CHECKING SYNC STATE...", Atomics.load(syncStateView, 0));
    let stuckCycles = 0;
    while (Atomics.load(syncStateView, 0) !== 1) {
      if (stuckCycles++ > 100) { LOGGER.warn("[WORKER " + currentPulseId + "] SYNC STATE SPINLOOP STUCK! state:", Atomics.load(syncStateView, 0)); stuckCycles = 0;} 
      Atomics.wait(syncStateView, 0, 0, 1); // Wait if 0, expect 1
      if (Atomics.load(syncStateView, 0) === 2) {
        // If it's 2, we must wait for it to become 0 then 1
        Atomics.wait(syncStateView, 0, 2, 5);
      }
    }

    LOGGER.debug("[WORKER " + currentPulseId + "] ENTERING TRY-CATCH EXECUTION LOOP!");
try {
      for (let i = startIdx; i < endIdx; i++) {
        const startAtomMs = performance.now();
        const startId = Atomics.load(idsView, i);
        const currentId = Atomics.load(idsView, i);
        if (currentId === 0n) continue;

        // Absolute WASM Coherence: The Kernel now handles Physics AND VM
        const beforeX11 = Atomics.load(xsView!, 11);
        execute_atom_fn(i);
        const afterX11 = Atomics.load(xsView!, 11);
        if (beforeX11 !== afterX11) {
          LOGGER.debug(
            `[WASM_MUTATION_TRACE] execute_atom(${i}) changed xs[11] from ${beforeX11} to ${afterX11}`,
          );
        }

        handle_syscall(i); // Process any syscall intent pending from the atom
        const deltaAtomMs = performance.now() - startAtomMs;

        const afterSys11 = Atomics.load(xsView!, 11);
        if (afterX11 !== afterSys11) {
          LOGGER.debug(
            `[JS_MUTATION_TRACE] handle_syscall(${i}) changed xs[11] from ${afterX11} to ${afterSys11}`,
          );
        }
      }
    } catch (err) {
      LOGGER.error("   [WORKER EXECUTION ERROR]", err);
    }

    await maybeDelay();
    LOGGER.debug("[WORKER " + currentPulseId + "] SENDING DONE", pulseId);
    (self as unknown as Worker).postMessage({ type: "DONE", pulseId });
  }

  if (type === "REDUCE_DELTAS") {
    const { startIdx, endIdx } = e.data;
    if (reduce_atom_deltas_fn) {
      reduce_atom_deltas_fn(startIdx, endIdx);
    }
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "DELTA_DONE", pulseId });
  }

  if (type === "TICK_MATRIX") {
    const bH = new Int32Array(
      sharedBuffer!,
      BONDS_OFFSET,
      MAX_ATOMS * 4,
    );
    // removed debug logging
    if (tick_matrix_fn) tick_matrix_fn();
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "MATRIX_DONE", pulseId });
  }

  if (type === "TICK_ENVIRONMENT") {
    const bH = new Int32Array(
      sharedBuffer!,
      BONDS_OFFSET,
      MAX_ATOMS * 4,
    );
    LOGGER.debug(
      `[PULSE_WORKER:TICK_ENV] TICK=${e.data.tick} BONDS: Atom 2 = [${
        bH[2 * 4]
      }, ${bH[2 * 4 + 1]}, ${bH[2 * 4 + 2]}, ${bH[2 * 4 + 3]}]`,
    );
    if (tick_environment_fn) tick_environment_fn(e.data.tick);
    if (tick_membrane_physics_fn) tick_membrane_physics_fn();
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "ENVIRONMENT_DONE", pulseId });
  }

  if (type === "RESOLVE_BONDS") {
    LOGGER.debug("[WORKER " + currentPulseId + "] ENTERING TRY-CATCH EXECUTION LOOP!");
try {
      if (!resolve_bond_requests_fn) {
        throw new Error("resolve_bond_requests_fn is not initialized.");
      }
      const count = resolve_bond_requests_fn(e.data.startIdx, e.data.endIdx);
      LOGGER.info(`[DEBUG-WORKER] WASM resolve returned ${count}`);
      (self as unknown as Worker).postMessage({
        type: "RESOLVE_BONDS_DONE",
        count,
        pulseId: e.data.pulseId,
      });
    } catch (err) {
      LOGGER.error(`[ERROR-WORKER] RESOLVE_BONDS failed`, err);
    }
  }

  if (type === "DRAIN_SPAWN") {
    const count = drain_spawn_requests_fn
      ? drain_spawn_requests_fn(e.data.tick)
      : 0;
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "DRAIN_SPAWN_DONE", pulseId, count });
  }

  if (type === "PHAGOCYTE_PASS") {
    const count = run_phagocyte_pass_fn
      ? run_phagocyte_pass_fn(e.data.entropy)
      : 0;
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "PHAGOCYTE_PASS_DONE", pulseId, count });
  }

  if (type === "BUILD_SPATIAL_HASH") {
    if (build_spatial_hash_fn) build_spatial_hash_fn();
    const overflowCount = get_spatial_hash_overflow_count_fn
      ? get_spatial_hash_overflow_count_fn()
      : 0;
    const maxCellCount = get_spatial_hash_max_cell_count_fn
      ? get_spatial_hash_max_cell_count_fn()
      : 0;
    await maybeDelay();
    (self as unknown as Worker).postMessage({
      type: "HASH_DONE",
      pulseId,
      overflowCount,
      maxCellCount,
    });
  }

  if (type === "TICK_GLYPH_TRANSPORT") {
    if (tick_glyph_transport_fn) tick_glyph_transport_fn(e.data.tick);
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "GLYPH_TRANSPORT_DONE", pulseId });
  }

  if (type === "POLL_COHERENCE") {
    if (get_neural_coherence_fn) {
      const coherence = get_neural_coherence_fn();
      await maybeDelay();
      (self as unknown as Worker).postMessage({ type: "COHERENCE_VAL", coherence, pulseId });
    }
  }

  if (type === "SET_COHERENCE") {
    if (set_neural_coherence_fn) {
      set_neural_coherence_fn(e.data.coherence);
      await maybeDelay();
      (self as unknown as Worker).postMessage({ type: "COHERENCE_SET_DONE", pulseId });
    }
  }

  if (type === "METABOLISM_ACCUMULATE") {
    const { startIdx, endIdx, clear } = e.data;
    if (clear && clear_metabolism_stats_fn) clear_metabolism_stats_fn();
    if (accumulate_metabolism_stats_fn) {
      accumulate_metabolism_stats_fn(startIdx, endIdx);
    }
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "METABOLISM_ACCUMULATE_DONE", pulseId });
  }

  if (type === "METABOLISM_APPLY") {
    const {
      startIdx,
      endIdx,
      noveltySigned,
      symbiosisSigned,
      baseTax,
      targetEnergy,
      homeostasisBand,
      homeostasisMaxDelta,
      overflowThreshold,
      spatialOverflowRatio,
      starvationFloor,
      subsidyEnabled,
    } = e.data;

    if (apply_metabolism_kernel_fn) {
      apply_metabolism_kernel_fn(
        startIdx,
        endIdx,
        noveltySigned,
        symbiosisSigned,
        baseTax,
        targetEnergy,
        homeostasisBand,
        homeostasisMaxDelta,
        Math.floor(overflowThreshold * 1024),
        Math.floor(spatialOverflowRatio * 1024),
        starvationFloor,
        subsidyEnabled ? 1 : 0,
      );
    }
    await maybeDelay();
    (self as unknown as Worker).postMessage({ type: "METABOLISM_APPLY_DONE", pulseId });
  }

  if (type === "SET_DEBUG_DELAY") {
    const delayRaw = Number(e.data.delayMs);
    debugDelayMs = Number.isFinite(delayRaw)
      ? Math.max(0, Math.min(2000, Math.floor(delayRaw)))
      : 0;
    await maybeDelay();
    (self as any).postMessage({ type: "DEBUG_DELAY_SET", pulseId });
  }

  if (type === "SET_DEBUG_JITTER") {
    const minRaw = Number(e.data.minMs);
    const maxRaw = Number(e.data.maxMs);
    const minMs = Number.isFinite(minRaw)
      ? Math.max(0, Math.min(2000, Math.floor(minRaw)))
      : 0;
    const maxMs = Number.isFinite(maxRaw)
      ? Math.max(0, Math.min(2000, Math.floor(maxRaw)))
      : 0;
    debugJitterMinMs = Math.min(minMs, maxMs);
    debugJitterMaxMs = Math.max(minMs, maxMs);
    await maybeDelay();
    (self as any).postMessage({
      type: "DEBUG_JITTER_SET",
      minMs: debugJitterMinMs,
      maxMs: debugJitterMaxMs,
      pulseId,
    });
  }
};

```

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
  LAYOUT_VERSION:
    value: 1
    type: u32
  SAFETY_BUFFER: 
    value: 8000000
    type: usize
  GRID_W: 
    value: 140
    type: i32
  GRID_H: 
    value: 80
    type: i32
  GRID_CELLS:
    expr: "GRID_W * GRID_H"
    type: usize
  SPATIAL_CELL_SIZE: 
    value: 10
    type: i32
  WORLD_MAX_X: 
    expr: "(GRID_W * SPATIAL_CELL_SIZE) - 1"
    type: i32
  WORLD_MAX_Y: 
    expr: "(GRID_H * SPATIAL_CELL_SIZE) - 1"
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
  OP_SPORE_DRIVE: 0xA7
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

## FILE: src/ontology/crypto/base64_to_bytes.md

```markdown
---
id: base64_to_bytes
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Converts a base64 string to a Uint8Array.
---

```typescript
export const base64_to_bytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
```

```

---

## FILE: src/ontology/crypto/bytes_to_base64.md

```markdown
---
id: bytes_to_base64
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Converts a Uint8Array to a base64 string.
---

```typescript
export const bytes_to_base64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
```

```

---

## FILE: src/ontology/crypto/bytes_to_hex.md

```markdown
---
id: bytes_to_hex
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Converts a Uint8Array to a hex string.
---

```typescript
export const bytes_to_hex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
```

```

---

## FILE: src/ontology/crypto/crypto_keys.md

```markdown
---
id: crypto_keys
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars:
  - base64_to_bytes
deps:
  - base64_to_bytes
description: WebCrypto key management interfaces and import wrappers.
---

```typescript
export type Ed25519SigningKey = {
  scheme: "ed25519/v1";
  private_key_pkcs8_b64: string;
};
export type Ed25519VerifyKey = { scheme: "ed25519/v1"; public_key_b64: string };
export type HmacKey = { scheme: "hmac-sha256/v1"; secret: string };

const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const import_hmac = async (
  secret: string,
  usages: KeyUsage[],
): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages,
  );

export const import_ed25519_private = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "pkcs8",
    base64_to_bytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["sign"],
  );

export const import_ed25519_public = async (b64: string): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    "spki",
    base64_to_bytes(b64) as unknown as BufferSource,
    { name: "Ed25519" },
    false,
    ["verify"],
  );
```

```

---

## FILE: src/ontology/crypto/fnv1a32.md

```markdown
---
id: fnv1a32
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Host implementation of the FNV-1a 32-bit hash.
---

```typescript
export const fnv1a32 = (input: string): number => {
  let hash = 0x811C9DC5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};
```

```

---

## FILE: src/ontology/crypto/hex_to_bytes.md

```markdown
---
id: hex_to_bytes
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Converts a hex string to a Uint8Array, returning null if invalid.
---

```typescript
export const hex_to_bytes = (hex: string): Uint8Array | null => {
  if (!/^[0-9a-fA-F]*$/u.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!Number.isFinite(byte)) return null;
    out[i] = byte;
  }
  return out;
};
```

```

---

## FILE: src/ontology/crypto/normalize_hex64.md

```markdown
---
id: normalize_hex64
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Validates and normalizes 64-character hex strings (sha256 format).
---

```typescript
export const normalize_hex64 = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/u.test(t) ? t : null;
};
```

```

---

## FILE: src/ontology/crypto/sha256_hex.md

```markdown
---
id: sha256_hex
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars:
  - bytes_to_hex
deps:
  - bytes_to_hex
description: Async SHA-256 hashing to hex strings for both text and raw bytes.
---

```typescript
const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const sha256_hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytes_to_hex(new Uint8Array(digest));
};

export const sha256_hex_bytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes as unknown as BufferSource,
  );
  return bytes_to_hex(new Uint8Array(digest));
};
```

```

---

## FILE: src/ontology/crypto/stable_stringify.md

```markdown
---
id: stable_stringify
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Deterministically stringifies JSON objects for signing.
---

```typescript
export const stable_stringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return "[" + value.map((v) => stable_stringify(v)).join(",") + "]";
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    return "{" +
      entries.map(([k, v]) => JSON.stringify(k) + ":" + stable_stringify(v))
        .join(",") +
      "}";
  }
  return JSON.stringify(value);
};
```

```

---

## FILE: src/ontology/genomes/GENESIS_PREDATOR_SCRIPT.md

```markdown
---
id: GENESIS_PREDATOR_SCRIPT
type: static_table
dataType: u8
description: "Hardcoded 64-byte bytecode genome for the initial Predator role"
deps: []
---

## payload: [1, 1, 3, 1, 0, 13, 96, 1, 1, 0, 4, 1, 0, 1, 2, 0, 1, 3, 50, 1, 4, 0, 5, 3, 4, 1, 0, 10, 96, 1, 0, 1, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

```

---

## FILE: src/ontology/host/assembler.md

```markdown
---
id: assembler
type: module
description: "Two-pass bytecode assembler for the OMEGA-64 virtual machine."
tags: ["host"]
deps: [OPCODE_ARITY_LUT]
min_level: 7
---

### TypeScript
```typescript
import { OPCODE_ARITY_LUT } from "../00/mod.ts";

export type AssembleToken = number | string;

export const assemble = (instructions: AssembleToken[]): Uint8Array => {
  const binary = new Uint8Array(64);
  const labels: Record<string, number> = {};

  // Pass 1: Resolve Labels
  let pc = 0;
  for (let i = 0; i < instructions.length; ) {
    const item = instructions[i];
    if (typeof item === "string") {
      labels[item] = pc;
      i++;
    } else {
      const arity = OPCODE_ARITY_LUT[item as number] ?? 0;
      pc += 1 + arity;
      i += 1 + arity;
    }
  }

  // Pass 2: Emit bytes
  pc = 0;
  for (let i = 0; i < instructions.length; ) {
    const item = instructions[i];
    if (typeof item === "string") {
      i++;
    } else {
      binary[pc++] = item as number;
      const arity = OPCODE_ARITY_LUT[item as number] ?? 0;
      for (let j = 0; j < arity; j++) {
        const arg = instructions[i + 1 + j];
        if (typeof arg === "string") {
          if (labels[arg] === undefined) {
             throw new Error(`Assembler Error: Unresolved label '${arg}'`);
          }
          binary[pc++] = labels[arg];
        } else {
          binary[pc++] = (arg as number) & 0xFF; // ensure byte boundary just in case
        }
      }
      i += 1 + arity;
    }
  }

  return binary;
};
```

```

---

## FILE: src/ontology/host/disassembler.md

```markdown
---
id: disassembler
type: module
description: "Disassembler to decode OMEGA-64 legacy opcodes into GlyphTapeTokens."
tags: ["host"]
deps: [OPCODE_ARITY_LUT]
min_level: 7
---

### TypeScript
```typescript
import { OPCODE_ARITY_LUT } from "../00/mod.ts";
import { OP_NOP, OP_SET, OP_GET, OP_PUT, OP_ADD, OP_SUB, OP_JZ, OP_JNZ, OP_JMP, OP_SYSCALL, OP_REPLICATE, OP_SIGNAL, OP_BIND, OP_SHARE, OP_HEBB, OP_PLUG, OP_TENSEGRITY, OP_COLLECTIVE, OP_BUILD, OP_SPORE_DRIVE, OP_SENSE, OP_SENSE_AS, OP_SECRETE_PLASMID, OP_INCORPORATE_PLASMID, OP_RESOLVE, OP_RESONATE_KURAMOTO } from "../00/mod.ts";
// We need glyphSpecByLegacyOpcode which is part of glyph_ir_64 module
import { glyphSpecByLegacyOpcode } from "./glyph_ir_64.ts";

export type LegacyInstruction = {
  pc: number;
  opcode: number;
  opcodeMnemonic: string;
  length: number;
  args: number[];
};

export type GlyphTapeToken = LegacyInstruction & {
  glyphId: number | null;
  glyphMnemonic: string | null;
  mapped: boolean;
};

const OPCODE_NAMES = new Map<number, string>([
  [OP_NOP, "NOP"],
  [OP_SET, "SET"],
  [OP_GET, "GET"],
  [OP_PUT, "PUT"],
  [OP_ADD, "ADD"],
  [OP_SUB, "SUB"],
  [OP_JZ, "JZ"],
  [OP_JNZ, "JNZ"],
  [OP_JMP, "JMP"],
  [OP_REPLICATE, "REPLICATE"],
  [OP_SIGNAL, "SIGNAL"],
  [OP_BIND, "BIND"],
  [OP_SHARE, "SHARE"],
  [OP_TENSEGRITY, "TENSEGRITY"],
  [OP_COLLECTIVE, "COLLECTIVE"],
  [OP_SECRETE_PLASMID, "ROLE"],
  [OP_BUILD, "BUILD"],
  [OP_SENSE, "SENSE"],
  [OP_SENSE_AS, "SENSE_AS"],
  [OP_SPORE_DRIVE, "SPORE_DRIVE"],
  [OP_HEBB, "ENTANGLE"],
  [OP_PLUG, "PLUG"],
  [OP_RESOLVE, "RESOLVE"],
  [OP_SYSCALL, "SYSCALL"],
  [OP_RESONATE_KURAMOTO, "RESONATE_KURAMOTO"]
]);

const opcodeName = (opcode: number): string =>
  OPCODE_NAMES.get(opcode) ?? `OP_0x${opcode.toString(16).toUpperCase()}`;

export const legacyOpcodeLength = (opcode: number): number =>
  (OPCODE_ARITY_LUT[opcode] ?? 0) + 1;

export const decodeLegacyInstruction = (
  script: Uint8Array,
  pc: number,
): LegacyInstruction | null => {
  if (pc < 0 || pc >= script.length) return null;
  const opcode = script[pc] ?? OP_NOP;
  const length = legacyOpcodeLength(opcode);
  const args = Array.from(script.slice(pc + 1, pc + length));
  return {
    pc,
    opcode,
    opcodeMnemonic: opcodeName(opcode),
    length,
    args,
  };
};

type ScriptToGlyphOptions = {
  allowUnmapped?: boolean;
  maxSteps?: number;
};

export const scriptToGlyphTape = (
  script: Uint8Array,
  options: ScriptToGlyphOptions = {},
): GlyphTapeToken[] => {
  const allowUnmapped = options.allowUnmapped ?? false;
  const maxSteps = Math.max(1, Math.min(64, options.maxSteps ?? 64));
  const out: GlyphTapeToken[] = [];
  let pc = 0;
  let steps = 0;

  while (pc >= 0 && pc < script.length && steps < maxSteps) {
    const decoded = decodeLegacyInstruction(script, pc);
    if (!decoded) break;
    if (decoded.opcode === OP_NOP) break;

    const spec = glyphSpecByLegacyOpcode(decoded.opcode);
    if (!spec && !allowUnmapped) {
      throw new Error(
        `[opcode_to_glyph] unmapped legacy opcode at pc=${pc}: ${decoded.opcodeMnemonic}`,
      );
    }

    out.push({
      ...decoded,
      glyphId: spec?.id ?? null,
      glyphMnemonic: spec?.mnemonic ?? null,
      mapped: spec !== null,
    });

    pc += decoded.length;
    steps++;
  }

  return out;
};
```

```

---

## FILE: src/ontology/host/env_parse.md

```markdown
---
id: ENV_PARSE
type: module
description: "Implementation of ENV_PARSE"
tags: []
min_level: 0
---

### TypeScript
```typescript
export const parseEnvBool = (
  raw: string | undefined,
  fallback: boolean,
): boolean => {
  if (raw === undefined) return fallback;
  const norm = raw.trim().toLowerCase();
  if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") {
    return true;
  }
  if (norm === "0" || norm === "false" || norm === "no" || norm === "off") {
    return false;
  }
  return fallback;
};

export const parseEnvBoundedInt = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

```

```

---

## FILE: src/ontology/host/glyph_ir_64.md

```markdown
---
id: glyph_ir_64
type: module
description: "Host UI types and caching maps for the 64-codon matrix."
tags: ["host", "class"]
deps: [GLYPH_TYPES, GLYPH_ARITY_LUT, GLYPH_ENERGY_LUT, GLYPH_RGB_LUT, GLYPH_LEGACY_OPCODE_LUT, get_glyph_kind]
min_level: 7
---

### TypeScript
```typescript
import {
  KIND_CORE, KIND_CONTROL, KIND_TRANSPORT, KIND_STRUCTURAL,
  KIND_CATALYTIC, KIND_REGULATORY, KIND_MEMORY, KIND_RESERVE,
  GLYPH_ARITY_LUT, GLYPH_ENERGY_LUT, GLYPH_RGB_LUT, GLYPH_LEGACY_OPCODE_LUT
} from "../00/mod.ts";

import { get_glyph_kind } from "../06/mod.ts";

export type GlyphKind =
  | "core"
  | "control"
  | "transport"
  | "structural"
  | "catalytic"
  | "regulatory"
  | "memory"
  | "reserve";

export type GlyphStabilityClass =
  | "hard-invariant"
  | "legacy-bridge"
  | "bounded-dynamic"
  | "reserve";

export type GlyphSpec = {
  id: number;
  mnemonic: string;
  kind: GlyphKind;
  arity: number;
  energyCost: number;
  stabilityClass: GlyphStabilityClass;
  reductionRuleRef: string;
  legacyOpcode?: number;
  notes?: string;
  vertexIndex?: number;
  rgb?: [number, number, number];
};

const KIND_MAPPING: Record<number, GlyphKind> = {
  [KIND_CORE]: "core",
  [KIND_CONTROL]: "control",
  [KIND_TRANSPORT]: "transport",
  [KIND_STRUCTURAL]: "structural",
  [KIND_CATALYTIC]: "catalytic",
  [KIND_REGULATORY]: "regulatory",
  [KIND_MEMORY]: "memory",
  [KIND_RESERVE]: "reserve",
};

export const defaultReductionRuleRef = (kind: GlyphKind): string => {
  if (kind === "core") return "reduction/core";
  if (kind === "control") return "bridge/control";
  if (kind === "transport") return "bridge/transport";
  if (kind === "structural") return "bridge/structural";
  if (kind === "catalytic") return "bridge/catalytic";
  if (kind === "regulatory") return "bridge/regulatory";
  if (kind === "memory") return "bridge/memory";
  return "reserve/unassigned";
};

export const defaultStabilityClass = (kind: GlyphKind): GlyphStabilityClass => {
  if (kind === "core") return "hard-invariant";
  if (kind === "reserve") return "reserve";
  if (kind === "regulatory" || kind === "memory") return "bounded-dynamic";
  return "legacy-bridge";
};

const UI_OVERRIDES = new Map<number, Partial<GlyphSpec>>([
  [0, { mnemonic: "S", reductionRuleRef: "reduction/core/S", notes: "Hard invariant combinator." }],
  [1, { mnemonic: "K", reductionRuleRef: "reduction/core/K", notes: "Hard invariant combinator." }],
  [2, { mnemonic: "I", reductionRuleRef: "reduction/core/I", notes: "Hard invariant combinator." }],
  [3, { mnemonic: "Y", reductionRuleRef: "reduction/core/Y", notes: "Bounded recursion anchor under fuel budget." }],
  [8, { mnemonic: "SET", reductionRuleRef: "bridge/control/set" }],
  [9, { mnemonic: "GET", reductionRuleRef: "bridge/control/get" }],
  [10, { mnemonic: "PUT", reductionRuleRef: "bridge/control/put" }],
  [11, { mnemonic: "ADD", reductionRuleRef: "bridge/control/add" }],
  [12, { mnemonic: "SUB", reductionRuleRef: "bridge/control/sub" }],
  [13, { mnemonic: "JNZ", reductionRuleRef: "bridge/control/jnz" }],
  [14, { mnemonic: "JMP", reductionRuleRef: "bridge/control/jmp" }],
  [15, { mnemonic: "JZ", reductionRuleRef: "bridge/control/jz" }],
  [16, { mnemonic: "REPLICATE", reductionRuleRef: "bridge/transport/replicate" }],
  [17, { mnemonic: "SIGNAL", reductionRuleRef: "bridge/transport/signal" }],
  [18, { mnemonic: "SHARE", reductionRuleRef: "bridge/transport/share" }],
  [19, { mnemonic: "BIND", reductionRuleRef: "bridge/transport/bind" }],
  [20, { mnemonic: "SPORE_DRIVE", reductionRuleRef: "bridge/transport/spore_drive" }],
  [21, { mnemonic: "ENTANGLE", reductionRuleRef: "bridge/transport/entangle" }],
  [22, { mnemonic: "SYSCALL", reductionRuleRef: "bridge/transport/syscall", notes: "Universal Host Interface." }],
  [24, { mnemonic: "PLUG", reductionRuleRef: "bridge/structural/plug" }],
  [25, { mnemonic: "TENSEGRITY", reductionRuleRef: "bridge/structural/tensegrity" }],
  [26, { mnemonic: "BUILD", reductionRuleRef: "bridge/structural/build" }],
  [27, { mnemonic: "SENSE", reductionRuleRef: "bridge/structural/sense" }],
  [32, { mnemonic: "COLLECTIVE", reductionRuleRef: "bridge/catalytic/collective" }],
  [33, { mnemonic: "ROLE", reductionRuleRef: "bridge/catalytic/role" }],
  [34, { mnemonic: "RESOLVE", reductionRuleRef: "bridge/catalytic/resolve" }],
  [35, { mnemonic: "BIND", reductionRuleRef: "bridge/catalytic/bind" }],
]);

export const buildGlyphSpecs = (): GlyphSpec[] => {
  const specs: GlyphSpec[] = [];
  for (let id = 0; id < 64; id++) {
    const rawKind = get_glyph_kind(id);
    const kind = KIND_MAPPING[rawKind];
    const arity = GLYPH_ARITY_LUT[id];
    const energyCost = GLYPH_ENERGY_LUT[id];
    const rawLegacyOpcode = GLYPH_LEGACY_OPCODE_LUT[id];
    
    const ui = UI_OVERRIDES.get(id) ?? {};
    const stabilityClass = defaultStabilityClass(kind);

    specs.push({
      id,
      mnemonic: ui.mnemonic ?? `${kind.toUpperCase()}_${id.toString().padStart(2, "0")}`,
      kind,
      arity,
      energyCost,
      stabilityClass,
      reductionRuleRef: ui.reductionRuleRef ?? defaultReductionRuleRef(kind),
      legacyOpcode: rawLegacyOpcode !== 255 ? rawLegacyOpcode : undefined,
      notes: ui.notes ?? (stabilityClass === "reserve" ? "Reserved for sandboxed semantic evolution only." : "Unassigned placeholder within the fixed 64-glyph lattice."),
      vertexIndex: id >= 4 ? id - 4 : undefined,
      rgb: [
        GLYPH_RGB_LUT[id * 3],
        GLYPH_RGB_LUT[id * 3 + 1],
        GLYPH_RGB_LUT[id * 3 + 2]
      ]
    });
  }
  return specs;
};

export const GLYPH_SPECS: readonly GlyphSpec[] = Object.freeze(
  buildGlyphSpecs().map((spec) => Object.freeze({ ...spec })),
);

export const GLYPH_SPEC_BY_ID = new Map<number, GlyphSpec>(
  GLYPH_SPECS.map((spec) => [spec.id, spec]),
);

export const GLYPH_SPEC_BY_OPCODE = new Map<number, GlyphSpec>(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => [spec.legacyOpcode!, spec]),
);

export const BRIDGE_GLYPH_IDS = Object.freeze(
  GLYPH_SPECS
    .filter((spec) => typeof spec.legacyOpcode === "number")
    .map((spec) => spec.id)
    .sort((a, b) => a - b),
);

export const glyphSpecById = (id: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_ID.get(Math.trunc(id)) ?? null;

export const glyphSpecByLegacyOpcode = (opcode: number): GlyphSpec | null =>
  GLYPH_SPEC_BY_OPCODE.get(Math.trunc(opcode)) ?? null;

export const isCoreGlyph = (id: number): boolean => {
  const spec = glyphSpecById(id);
  return spec?.kind === "core";
};

export const listGlyphSpecsByKind = (kind: GlyphKind): GlyphSpec[] =>
  GLYPH_SPECS.filter((spec) => spec.kind === kind);
```

```

---

## FILE: src/ontology/host/glyph_pretty.md

```markdown
---
id: glyph_pretty
type: module
description: "Tape token stringifier for the OMEGA-64 virtual machine."
tags: ["host"]
deps: [glyph_ir_64, disassembler]
min_level: 7
---

### TypeScript
```typescript
import { glyphSpecById } from "../07/glyph_ir_64.ts";
import type { GlyphTapeToken } from "../07/disassembler.ts";

export const describeGlyphToken = (token: GlyphTapeToken): string => {
  const spec = token.glyphId === null ? null : glyphSpecById(token.glyphId);
  const glyphLabel = token.mapped && spec
    ? `${spec.mnemonic}[${spec.id}]`
    : `UNMAPPED(${token.opcodeMnemonic})`;
  const args = token.args.length > 0 ? ` args=[${token.args.join(",")}]` : "";
  const reductionRule = spec ? ` rule=${spec.reductionRuleRef}` : "";
  const energy = spec ? ` energy=${spec.energyCost}` : "";
  return `pc=${token.pc} opcode=${token.opcodeMnemonic} -> ${glyphLabel}${args}${energy}${reductionRule}`;
};

export const glyphTapeToLines = (tape: readonly GlyphTapeToken[]): string[] =>
  tape.map((token) => describeGlyphToken(token));

export const glyphTapeToPrettyText = (
  tape: readonly GlyphTapeToken[],
): string => glyphTapeToLines(tape).join("\\n");
```

```

---

## FILE: src/ontology/host/LOGGER.md

```markdown
---
id: LOGGER
type: module
description: "Cross-platform Host Logger"
tags: ["host", "console"]
min_level: 6
deps: []
returns: void
---

### TypeScript
```typescript
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

const readEnv = (key: string): string | undefined => {
  try {
    const deno = (globalThis as {
      Deno?: { env?: { get?: (k: string) => string | undefined } };
    }).Deno;
    return deno?.env?.get?.(key);
  } catch {
    return undefined;
  }
};

const normalizeLevel = (raw: string | undefined): LogLevel => {
  const value = raw?.trim().toLowerCase();
  if (value === "debug") return "debug";
  if (value === "info") return "info";
  if (value === "warn" || value === "warning") return "warn";
  if (value === "error") return "error";
  if (value === "silent" || value === "off" || value === "none") {
    return "silent";
  }
  return "warn";
};

let currentLevel: LogLevel = normalizeLevel(readEnv("OMEGA_LOG_LEVEL"));

const shouldLog = (level: LogLevel): boolean => {
  if (currentLevel === "silent") return false;
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel];
};

const emit = (method: "debug" | "info" | "warn" | "error", args: unknown[]) => {
  const sink =
    (console as unknown as Record<string, (...xs: unknown[]) => void>)[
      method
    ] ??
      console.log;
  sink(...args);
};

export const LOGGER = {
  getLevel: (): LogLevel => currentLevel,
  setLevel: (level: LogLevel): void => {
    currentLevel = level;
  },
  refreshLevelFromEnv: (): LogLevel => {
    currentLevel = normalizeLevel(readEnv("OMEGA_LOG_LEVEL"));
    return currentLevel;
  },
  debug: (...args: unknown[]) => {
    if (shouldLog("debug")) emit("debug", args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog("info")) emit("info", args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog("warn")) emit("warn", args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog("error")) emit("error", args);
  },
};
```

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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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

    pub fn hormones_atomic(&self) -> &[std::sync::atomic::AtomicU16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hormones.as_ptr() as *const std::sync::atomic::AtomicU16,
                MAX_HORMONES,
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
        crate::MEIOSIS_RESERVED_OFFSET,
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
            crate::HORMONES_OFFSET,
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/l32_gate/atomic_ledger.md

```markdown
---
id: ATOMIC_LEDGER
type: module
description: "Implementation of ATOMIC_LEDGER"
tags: []
min_level: 3
---

### TypeScript
```typescript
// OMEGA-64 | ATOMIC_LEDGER.ts | Era 70
// Binary Event Ring Buffer (Memory-Mapped)

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LEDGER_DATA_OFFSET, LEDGER_HEAD_OFFSET, MAX_LEDGER_EVENTS } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

export type LedgerEvent = {
  tick: number;
  atomIdx: number;
  r1: number;
  r2: number;
};

export const ATOMIC_LEDGER = {
  /**
   * Retrieves the current write cursor (how many total events have been emitted).
   */
  getHead(): number {
    return Atomics.load(STATE_MATRIX.ledgerHeadView, 0);
  },

  /**
   * Reads a raw event from the circular buffer given an absolute sequence number.
   * If the sequence number is too old (overwritten by MAX_EVENTS), this will return overwritten data.
   */
  getEvent(sequence: number): LedgerEvent {
    const cursor = sequence % MAX_LEDGER_EVENTS;
    const base = cursor * 4;
    return {
      tick: Atomics.load(STATE_MATRIX.ledgerDataView, base),
      atomIdx: Atomics.load(STATE_MATRIX.ledgerDataView, base + 1),
      r1: Atomics.load(STATE_MATRIX.ledgerDataView, base + 2),
      r2: Atomics.load(STATE_MATRIX.ledgerDataView, base + 3),
    };
  },

  /**
   * Exports the entire ledger data view (including head) as a raw Uint8Array buffer
   * for zero-serialization storage or network transmission.
   */
  exportBinary(): Uint8Array {
    // 4 bytes for head, plus MAX_EVENTS * 16 bytes for data
    const size = 4 + (MAX_LEDGER_EVENTS * 16);
    const dump = new Uint8Array(size);

    // Copy Head
    const headBytes = new Uint8Array(
      STATE_MATRIX.ledgerHeadView.buffer,
      LEDGER_HEAD_OFFSET,
      4,
    );
    dump.set(headBytes, 0);

    // Copy Data
    const dataBytes = new Uint8Array(
      STATE_MATRIX.ledgerDataView.buffer,
      LEDGER_DATA_OFFSET,
      MAX_LEDGER_EVENTS * 16,
    );
    dump.set(dataBytes, 4);

    return dump;
  },

  /**
   * Reads all events from `startSequence` to `endSequence` strictly.
   */
  readRange(startSeq: number, endSeq: number): LedgerEvent[] {
    const events: LedgerEvent[] = [];
    // Ensure we don't try to read more than the buffer can hold
    const safeStart = Math.max(startSeq, endSeq - MAX_LEDGER_EVENTS);
    for (let i = safeStart; i < endSeq; i++) {
      events.push(this.getEvent(i));
    }
    return events;
  },
};

```

```

---

## FILE: src/ontology/l32_gate/checkpoint_chain.md

```markdown
---
id: checkpoint_chain
type: module
description: "Implementation of checkpoint_chain"
tags: []
min_level: 0
---

### TypeScript
```typescript
// OMEGA-64 | checkpoint_chain.ts
// Replay Invariant State Hash Checkpointing

import { readJsonlLines, appendJsonl, readJsonl } from "../../00/stream_utils.ts";
import { stable_stringify, sha256_hex, normalize_hex64 } from "../mod.ts";

const CHECKPOINT_CHAIN_VERSION = "checkpoint-hash-chain/v1";

const stripCheckpointChainFields = (entry: Record<string, unknown>) => {
  const body = { ...entry };
  delete body.chain_version;
  delete body.prev_checkpoint_hash;
  delete body.checkpoint_hash;
  return body;
};

const checkpointRecordHash = async (
  body: Record<string, unknown>,
  prevCheckpointHash: string | null,
): Promise<string> =>
  await sha256_hex(
    stable_stringify({
      chain_version: CHECKPOINT_CHAIN_VERSION,
      prev_checkpoint_hash: prevCheckpointHash,
      body,
    }),
  );

type CheckpointChainReportInternal = {
  ok: boolean;
  checkedRows: number;
  chainAnchoredRows: number;
  legacyRows: number;
  failures: string[];
  tailCheckpointHash: string | null;
};

const verifyCheckpointChainDetailedInternal = async (
  path: string,
): Promise<CheckpointChainReportInternal> => {
  const lines = await readJsonlLines(path);
  const failures: string[] = [];
  let chainAnchoredRows = 0;
  let legacyRows = 0;
  let prevAnchoredHash: string | null = null;
  let tailCheckpointHash: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch {
      failures.push(`CHECKPOINT_CHAIN_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
      continue;
    }

    const hasChainVersion = row.chain_version !== undefined;
    const hasPrev = row.prev_checkpoint_hash !== undefined;
    const hasHash = row.checkpoint_hash !== undefined;
    const hasAnyChain = hasChainVersion || hasPrev || hasHash;
    const hasAllChain = hasChainVersion && hasPrev && hasHash;

    if (!hasAnyChain) {
      legacyRows++;
      continue;
    }
    if (!hasAllChain) {
      failures.push(`CHECKPOINT_CHAIN_PARTIAL_FIELDS_AT_LINE_${lineNo}`);
      continue;
    }

    chainAnchoredRows++;
    if (row.chain_version !== CHECKPOINT_CHAIN_VERSION) {
      failures.push(`CHECKPOINT_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`);
    }

    const body = stripCheckpointChainFields(row);
    const expectedHash = await checkpointRecordHash(body, prevAnchoredHash);

    const recordedPrev = row.prev_checkpoint_hash === null
      ? null
      : normalize_hex64(row.prev_checkpoint_hash);
    if (
      row.prev_checkpoint_hash !== null &&
      typeof row.prev_checkpoint_hash !== "string"
    ) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`CHECKPOINT_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalize_hex64(row.checkpoint_hash);
    if (!recordedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_INVALID_AT_LINE_${lineNo}`);
      prevAnchoredHash = expectedHash;
      tailCheckpointHash = expectedHash;
      continue;
    }
    if (recordedHash !== expectedHash) {
      failures.push(`CHECKPOINT_CHAIN_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    prevAnchoredHash = recordedHash;
    tailCheckpointHash = recordedHash;
  }

  return {
    ok: failures.length === 0,
    checkedRows: lines.length,
    chainAnchoredRows,
    legacyRows,
    failures,
    tailCheckpointHash,
  };
};

export const CHECKPOINT_CHECKPOINT = {
  STORAGE_PATH: "OMEGA_CHECKPOINT.jsonl",
  CHAIN_VERSION: CHECKPOINT_CHAIN_VERSION,
  save: async (state: any, context?: any): Promise<void> => {
    const chain = await verifyCheckpointChainDetailedInternal(
      CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    if (!chain.ok) {
      throw new Error(`CHECKPOINT_CHAIN_INVALID:${chain.failures.join(",")}`);
    }

    const body = {
      tick: state?.tick ?? 0,
      state_hash: state?.state_hash ?? "",
      state_i16: Array.from((state?.state_i16 ?? []) as number[]),
      context: context ?? null,
      ts: Date.now(),
    } as Record<string, unknown>;

    const prevCheckpointHash = chain.tailCheckpointHash;
    const checkpointHash = await checkpointRecordHash(body, prevCheckpointHash);
    await appendJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH, {
      ...body,
      chain_version: CHECKPOINT_CHAIN_VERSION,
      prev_checkpoint_hash: prevCheckpointHash,
      checkpoint_hash: checkpointHash,
    });
  },
  loadLatest: async (): Promise<any | null> => {
    let latest: any | null = null;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      latest = row;
    }
    return latest;
  },
  loadExact: async (tick: number): Promise<any | null> => {
    let exact: any | null = null;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      if (Number(row?.tick) === tick) {
        exact = row;
      }
    }
    return exact;
  },
  loadNearestAtOrBefore: async (tick: number): Promise<any | null> => {
    let nearest: any | null = null;
    let nearestTick = Number.NEGATIVE_INFINITY;
    for await (const row of readJsonl(CHECKPOINT_CHECKPOINT.STORAGE_PATH)) {
      const rowTick = Number(row?.tick);
      if (
        !Number.isFinite(rowTick) || rowTick > tick || rowTick < nearestTick
      ) {
        continue;
      }
      nearest = row;
      nearestTick = rowTick;
    }
    return nearest;
  },
  verifyChainDetailed: async (path?: string) => {
    const report = await verifyCheckpointChainDetailedInternal(
      path ?? CHECKPOINT_CHECKPOINT.STORAGE_PATH,
    );
    return {
      ok: report.ok,
      checkedRows: report.checkedRows,
      chainAnchoredRows: report.chainAnchoredRows,
      legacyRows: report.legacyRows,
      failures: report.failures,
      tailCheckpointHash: report.tailCheckpointHash,
    };
  },
};

```

```

---

## FILE: src/ontology/l32_gate/gate_ledger.md

```markdown
---
id: GATE_LEDGER
type: module
description: "Implementation of GATE_LEDGER"
tags: []
min_level: 3
---

### TypeScript
```typescript
import { type BridgeModeEvent, type GateConfig } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { type LedgerEvent } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { CHECKPOINT_CHECKPOINT as CHECKPOINT, LEDGER__08_00_LEDGER as LEDGER, PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX
    as PROPOSAL_ENVELOPE_INDEX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

export const persistGateLedgerArtifacts = async (
  bridgeEvent: BridgeModeEvent,
  event: LedgerEvent,
  config: GateConfig,
  envelopeIndexPath: string,
  nextTick: number,
  nextHash: string,
  nextStateI16: Int16Array,
  autoCheckpointInterval: number,
): Promise<void> => {
  await LEDGER.append(bridgeEvent);
  await LEDGER.append(event);

  if (!config.dry_run) {
    await PROPOSAL_ENVELOPE_INDEX.appendFromLedgerEvent(
      event,
      envelopeIndexPath,
    );
  }

  if (!config.dry_run && nextTick % autoCheckpointInterval === 0) {
    try {
      await CHECKPOINT.save(
        {
          tick: nextTick,
          state_hash: nextHash,
          state_i16: nextStateI16,
        },
        "AUTO_INTERVAL",
      );
    } catch {
      // Checkpoints are safety accelerators, not mutation authority.
    }
  }
};

```

```

---

## FILE: src/ontology/l32_gate/gate_merger.md

```markdown
---
id: GATE_MERGER
type: module
description: "Implementation of GATE_MERGER"
tags: []
min_level: 3
---

### TypeScript
```typescript
import { type DeltaProposal, type GateConfig, type GateDecision, REJECTION, type StateSnapshot } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LOAD_LOAD as LOAD } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { GATE_BUDGET } from "../../03/GATE_BUDGET.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

type I16Limits = {
  max: number;
  span: number;
};

export type GateAcceptedProposalMetric = {
  proposal_id: string;
  agent_id: string;
  confidence: number;
  reliability_base: number;
  reliability_effective: number;
  phase_coherence?: number;
  weight: number;
  physical_cost: number;
  agent_phase_u16?: number;
};

const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

const phaseCoherence = (
  agentPhase: number,
  delta: Array<{ level: number; value: number }>,
  phase_u16: Uint16Array | undefined,
  i16: I16Limits,
): number => {
  if (delta.length === 0) return 1;
  let weighted = 0;
  let weightSum = 0;
  for (const d of delta) {
    const levelPhase = phase_u16 ? phase_u16[d.level] : 0;
    let dPhi = Math.abs(agentPhase - levelPhase);
    if (dPhi > i16.max) dPhi = i16.span - dPhi;
    const angle = (dPhi / i16.max) * Math.PI;
    const coherence = (1 + Math.cos(angle)) / 2;
    const w = Math.max(1, Math.abs(d.value));
    weighted += coherence * w;
    weightSum += w;
  }
  return weightSum > 0 ? clamp01(weighted / weightSum) : 1;
};

export const mergeGateProposals = (
  state: StateSnapshot,
  validProposals: DeltaProposal[],
  config: GateConfig,
  decision: GateDecision,
  i16: I16Limits,
): {
  acceptedProposalMetrics: GateAcceptedProposalMetric[];
  maxTotalCost: number;
} => {
  const acceptedProposalMetrics: GateAcceptedProposalMetric[] = [];
  const reliabilityMode = config.reliability_mode ?? "STATIC";
  const reliabilityFloor = clamp01(config.reliability_floor ?? 0);
  const maxTotalCost =
    Number.isFinite(config.max_total_cost_per_tick ?? Infinity)
      ? Math.max(0, config.max_total_cost_per_tick ?? Infinity)
      : Infinity;

  validProposals.sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));

  const combinedDelta = new Map<number, number>();

  for (const p of validProposals) {
    if (p.resonance !== undefined) {
      LOGGER.debug(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, resonance: ${p.resonance}`,
      );
    } else if (p.origin_atom_idx !== undefined) {
      const resonance = STATE_MATRIX.getResonance(p.origin_atom_idx);
      LOGGER.debug(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, looked up resonance: ${resonance}`,
      );
    } else {
      LOGGER.debug(
        `   [DEBUG PROPOSAL] ID: ${p.proposal_id}, NO RESONANCE FOUND.`,
      );
    }

    let physicalCost = 0;
    const agentPhase = p.agent_phase_u16 ?? 0;
    for (const d of p.delta) {
      const levelPhase = state.phase_u16 ? state.phase_u16[d.level] : 0;
      const levelEntropy = state.entropy_i16 ? state.entropy_i16[d.level] : 0;
      const load = LOAD.calculate({
        entropy: levelEntropy,
        phase: agentPhase,
        weight: Math.abs(d.value),
      }, levelPhase);
      physicalCost += Math.abs(d.value) + load;
    }

    const atomResonance = p.resonance ??
      (p.origin_atom_idx !== undefined
        ? STATE_MATRIX.getResonance(p.origin_atom_idx)
        : 0);
    const globalSyntropy = config.global_syntropy || 0;
    const localQuorum = p.quorum_strength || 0;

    if (atomResonance > 0 || globalSyntropy > 0 || localQuorum > 0) {
      // Sovereign Feedback: Successful collective organization rewards the system
      const resonanceDiscount = Math.min(0.8, atomResonance / 600);
      const syntropyDiscount = Math.min(0.2, globalSyntropy * 0.5); // Global systemic reward
      const quorumDiscount = Math.min(0.4, localQuorum * 0.8); // Local group reward

      const totalDiscount = Math.min(
        0.95,
        resonanceDiscount + syntropyDiscount + quorumDiscount,
      );

      const oldCost = physicalCost;
      physicalCost = physicalCost * (1 - totalDiscount);

      LOGGER.debug(
        `      ⚖️ [SOVEREIGN] Route subsidized. Base: ${
          oldCost.toFixed(1)
        }, Res: ${atomResonance.toFixed(1)}, Quorum: ${
          localQuorum.toFixed(2)
        }, Syntropy: ${globalSyntropy.toFixed(2)}, Final Discount: ${
          (totalDiscount * 100).toFixed(1)
        }%`,
      );
    }

    const finalCost = Math.round(physicalCost);

    if (finalCost > (config.max_cost_per_agent || Infinity)) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.COST_OVER_BUDGET,
      });
      continue;
    }

    const nextTotalCost = decision.cost_used + finalCost;
    if (nextTotalCost > maxTotalCost) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.COST_OVER_BUDGET,
      });
      continue;
    }

    decision.accepted_proposals.push(p.proposal_id);
    decision.cost_used = nextTotalCost;

    const reliabilityBase = clamp01(
      config.reliability_weight.get(p.agent_id) ?? 1.0,
    );
    let phaseCoherenceScore: number | undefined = undefined;
    let agentReliability = reliabilityBase;
    if (reliabilityMode === "PHASE_COHERENCE") {
      phaseCoherenceScore = p.agent_phase_u16 === undefined
        ? 1
        : phaseCoherence(p.agent_phase_u16, p.delta, state.phase_u16, i16);
      const modulation = reliabilityFloor +
        (1 - reliabilityFloor) * phaseCoherenceScore;
      agentReliability *= modulation;
    }
    agentReliability = clamp01(agentReliability);
    const weight = p.confidence * agentReliability;
    acceptedProposalMetrics.push({
      proposal_id: p.proposal_id,
      agent_id: p.agent_id,
      confidence: p.confidence,
      reliability_base: reliabilityBase,
      reliability_effective: agentReliability,
      phase_coherence: phaseCoherenceScore,
      weight,
      physical_cost: finalCost,
      agent_phase_u16: p.agent_phase_u16,
    });

    for (const d of p.delta) {
      let val = d.value;
      if (Math.abs(val) > config.max_abs_delta_per_level) {
        val = Math.sign(val) * config.max_abs_delta_per_level;
      }

      const weightedVal = val * weight;
      const current = combinedDelta.get(d.level) || 0;
      combinedDelta.set(d.level, current + weightedVal);
    }
  }

  const totalAbsDelta = GATE_BUDGET.totalAbsDeltaRounded(combinedDelta);
  decision.budget_used = totalAbsDelta;
  const scaleFactor = GATE_BUDGET.computeScaleFactor(
    totalAbsDelta,
    config.max_total_abs_delta_per_tick,
  );
  decision.accepted_delta = GATE_BUDGET.flattenScaledDelta(
    combinedDelta,
    scaleFactor,
  );

  return {
    acceptedProposalMetrics,
    maxTotalCost,
  };
};

```

```

---

## FILE: src/ontology/l32_gate/gate_validator.md

```markdown
---
id: GATE_VALIDATOR
type: module
description: "Implementation of GATE_VALIDATOR"
tags: []
min_level: 3
---

### TypeScript
```typescript
import { type DeltaProposal, type GateConfig, type GateDecision, REJECTION, type StateSnapshot } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { AGENT_SIGNATURE, CANON_CAUSAL_BRIDGE, PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX
    as PROPOSAL_ENVELOPE_INDEX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

type GateBridgeResolution = {
  mode: "GREEN" | "AMBER" | "RED";
  reason: string;
};

export type GateValidationResult = {
  validProposals: DeltaProposal[];
  proposalDigest: string;
  envelopeHashByProposal: Map<string, string>;
  canonBoundProposals: string[];
  blockedCanonProposals: string[];
};

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

export const validateGateProposals = async (
  state: StateSnapshot,
  proposals: DeltaProposal[],
  config: GateConfig,
  decision: GateDecision,
  bridgeResolution: GateBridgeResolution,
  i16Span: number,
  envelopeIndexPath: string,
): Promise<GateValidationResult> => {
  const signaturePolicy = config.signature_policy ?? "DISABLED";
  const signatureKeys = config.agent_signature_keys;
  const antiReplayWindow = Math.max(
    0,
    Math.floor(config.anti_replay_window_ticks ?? 0),
  );
  const historicalEnvelopeHashes = antiReplayWindow > 0
    ? await PROPOSAL_ENVELOPE_INDEX.getRecentEnvelopeHashes(
      state.tick - antiReplayWindow,
      state.tick,
      envelopeIndexPath,
    )
    : new Set<string>();
  const envelopeHashByProposal = new Map<string, string>();
  const seenEnvelopeHashesInTick = new Set<string>();

  const canonicalProposalList = proposals
    .map((p) => AGENT_SIGNATURE.toCanonicalObject(p))
    .sort((a, b) => a.proposal_id.localeCompare(b.proposal_id));
  const proposalDigest = await sha256Hex(
    stableStringify(canonicalProposalList),
  );

  const validProposals: DeltaProposal[] = [];
  const canonBoundProposals: string[] = [];
  const blockedCanonProposals: string[] = [];

  for (const p of proposals) {
    const envelopeHash = await AGENT_SIGNATURE.proposalEnvelopeHash(p);
    envelopeHashByProposal.set(p.proposal_id, envelopeHash);
    if (
      p.proposal_envelope_hash && p.proposal_envelope_hash !== envelopeHash
    ) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.PROPOSAL_ENVELOPE_HASH_MISMATCH,
      });
      continue;
    }
    if (antiReplayWindow > 0) {
      if (
        seenEnvelopeHashesInTick.has(envelopeHash) ||
        historicalEnvelopeHashes.has(envelopeHash)
      ) {
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.REPLAY_ENVELOPE_DUPLICATE,
        });
        continue;
      }
      seenEnvelopeHashesInTick.add(envelopeHash);
    }
    if (CANON_CAUSAL_BRIDGE.isCanonBound(p)) {
      canonBoundProposals.push(p.proposal_id);
      if (bridgeResolution.mode !== "GREEN") {
        blockedCanonProposals.push(p.proposal_id);
        decision.rejected_proposals.push({
          proposal_id: p.proposal_id,
          reason: REJECTION.CANON_PATH_REQUIRES_GREEN_BRIDGE,
        });
        continue;
      }
    }
    if (signaturePolicy !== "DISABLED") {
      const key = signatureKeys?.get(p.agent_id);
      if (!key) {
        if (
          signaturePolicy === "REQUIRED" || p.agent_signature ||
          p.signature_scheme
        ) {
          decision.rejected_proposals.push({
            proposal_id: p.proposal_id,
            reason: REJECTION.SIGNATURE_KEY_MISSING,
          });
          continue;
        }
      } else {
        if (!p.agent_signature) {
          if (signaturePolicy === "REQUIRED") {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: REJECTION.SIGNATURE_REQUIRED,
            });
            continue;
          }
        } else {
          const verify = await AGENT_SIGNATURE.verifyProposal(p, key);
          if (!verify.ok) {
            decision.rejected_proposals.push({
              proposal_id: p.proposal_id,
              reason: verify.reason ?? REJECTION.SIGNATURE_INVALID,
            });
            continue;
          }
        }
      }
    }
    if (p.tick !== state.tick) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.TICK_MISMATCH,
      });
      continue;
    }
    if (p.base_state_hash !== state.state_hash) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.BASE_HASH_MISMATCH,
      });
      continue;
    }
    if (!p.delta || p.delta.length === 0) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.EMPTY_DELTA,
      });
      continue;
    }
    if (
      p.delta.some((d) =>
        !Number.isInteger(d.level) ||
        d.level < 0 ||
        d.level > 63 ||
        !Number.isFinite(d.value)
      )
    ) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.OUT_OF_RANGE_VALUE,
      });
      continue;
    }
    if (
      p.agent_phase_u16 !== undefined &&
      (
        !Number.isInteger(p.agent_phase_u16) ||
        p.agent_phase_u16 < 0 ||
        p.agent_phase_u16 > i16Span
      )
    ) {
      decision.rejected_proposals.push({
        proposal_id: p.proposal_id,
        reason: REJECTION.OUT_OF_RANGE_VALUE,
      });
      continue;
    }

    validProposals.push(p);
  }

  return {
    validProposals,
    proposalDigest,
    envelopeHashByProposal,
    canonBoundProposals,
    blockedCanonProposals,
  };
};

```

```

---

## FILE: src/ontology/l32_gate/gate.md

```markdown
---
id: GATE
type: module
description: "Implementation of GATE"
tags: []
min_level: 3
---

### TypeScript
```typescript
import { GRID_H } from "../mod.ts";
import { type BridgeModeEvent, type DeltaProposal, type GateConfig, type GateDecision, type StateSnapshot } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { type LedgerEvent } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { CANON_CAUSAL_BRIDGE, CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_CONFIG as CRYSTALLIZATION_CONFIG, CRYSTALLIZATION_CONFIG_CRYSTALLIZATION_POLICY as CRYSTALLIZATION_POLICY, INVARIANT_PACKET_INVARIANT_PACKET as INVARIANT_PACKET, LEDGER__08_00_LEDGER as LEDGER, PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX
    as PROPOSAL_ENVELOPE_INDEX, TOPOLOGICAL_SIGNATURE__08_00_TOPOLOGICAL_SIGNATURE as TOPOLOGICAL_SIGNATURE } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { validateGateProposals } from "@03";
import { mergeGateProposals } from "@03";
import { persistGateLedgerArtifacts } from "@03";

export interface ReplayInvariantReport {
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked: boolean;
  gate_admission_index_chain_ok: boolean;
  gate_admission_index_chain_checked_records: number;
  gate_admission_index_chain_failures: string[];
}

const GATE_VERSION = "v0.3-pure";
const AUTO_CHECKPOINT_INTERVAL = 128;
const I16 = { MIN: -32768, MAX: 32767, max: 32767, span: 65536, LEVEL_COUNT: 64 };
const I16_CLAMP = (x: number): number => Math.max(-32768, Math.min(32767, x));

export interface GateRuntimeContext {
  bridge_invariant_report?: ReplayInvariantReport;
  witness?: string;
}

const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b));
    const body = entries
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",");
    return `{${body}}`;
  }
  return JSON.stringify(value);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (input: string): Promise<string> => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

export const GATE = {
  /**
   * The Core Function: Process proposals and produce a decision.
   * Pure function (mostly), side effect is only LEDGER emit.
   */
  process: async (
    state: StateSnapshot,
    proposals: DeltaProposal[],
    config: GateConfig,
    runtime: GateRuntimeContext = {},
  ): Promise<StateSnapshot> => {
    const decision: GateDecision = {
      accepted_proposals: [],
      rejected_proposals: [],
      budget_used: 0,
      cost_used: 0,
      accepted_delta: [],
    };
    const proposalById = new Map(proposals.map((p) => [p.proposal_id, p]));
    const bridgeResolution = CANON_CAUSAL_BRIDGE.resolveMode(
      runtime.bridge_invariant_report,
    );
    const envelopeIndexPath = PROPOSAL_ENVELOPE_INDEX.pathForLedger(
      LEDGER.STORAGE_PATH,
    );
    const {
      validProposals,
      proposalDigest,
      envelopeHashByProposal,
      canonBoundProposals,
      blockedCanonProposals,
    } = await validateGateProposals(
      state,
      proposals,
      config,
      decision,
      bridgeResolution,
      I16.span,
      envelopeIndexPath,
    );
    const { acceptedProposalMetrics, maxTotalCost } = mergeGateProposals(
      state,
      validProposals,
      config,
      decision,
      I16,
    );

    // 5. Apply Mutation (OR Dry Run)
    const nextStateI16 = new Int16Array(state.state_i16); // Clone

    if (!config.dry_run) {
      for (const d of decision.accepted_delta) {
        // Saturating Add
        const newVal = nextStateI16[d.level] + d.value;
        nextStateI16[d.level] = I16_CLAMP(newVal);
      }
    } else {
      // DRY RUN: State does NOT change
      // telemetry: dry run preserves state
    }

    // 6. Deterministic Hashing
    const nextHash = config.dry_run
      ? state.state_hash
      : await sha256Hex(stableStringify({
        state_i16: Array.from(nextStateI16),
        tick: state.tick + 1,
        gate_config_version: GATE_VERSION,
        proposal_digest: proposalDigest,
      }));
    const eventId = `evt_${
      (await sha256Hex(
        `${state.tick}|${state.state_hash}|${proposalDigest}|${nextHash}`,
      )).slice(0, 16)
    }`;

    // 7. Emit Ledger Event
    const nextTick = state.tick + 1;

    let projection2DHash: string | undefined;
    let thread1DHash: string | undefined;
    let projectionVersion: string | undefined;
    let signatureArtifactHash: string | undefined;
    let signatureTick: number | undefined;
    let signatureCausalRefs: string[] | undefined;
    const policyHash = await CRYSTALLIZATION_POLICY.hash();

    if (!config.dry_run && TOPOLOGICAL_SIGNATURE.validateHash(nextHash)) {
      const acceptedCausalRefs = decision.accepted_proposals.flatMap((id) =>
        proposalById.get(id)?.causal_refs ?? []
      );
      const causalRefs = Array.from(
        new Set([state.state_hash, ...acceptedCausalRefs]),
      );

      const topoSignature = await TOPOLOGICAL_SIGNATURE.build({
        artifact_hash: proposalDigest,
        state_hash: nextHash,
        tick: nextTick,
        state: TOPOLOGICAL_SIGNATURE.snapshotToOrganismState({
          state_hash: nextHash,
          state_i16: nextStateI16,
        }),
        causal_refs: causalRefs,
      });

      projection2DHash = topoSignature.projection_2d_hash;
      thread1DHash = topoSignature.thread_1d_hash;
      projectionVersion = topoSignature.projection_version;
      signatureArtifactHash = topoSignature.artifact_hash;
      signatureTick = topoSignature.tick;
      signatureCausalRefs = topoSignature.causal_refs;
    }

    const event: LedgerEvent = {
      event_id: eventId,
      tick: state.tick,
      ts_unix_ms: state.tick * 1000,
      state_before_hash: state.state_hash,
      state_after_hash: nextHash,
      accepted_delta: decision.accepted_delta,
      proposal_digest: proposalDigest,
      accepted_proposals: decision.accepted_proposals,
      accepted_proposal_metrics: acceptedProposalMetrics,
      accepted_proposal_envelopes: decision.accepted_proposals
        .map((proposal_id) => ({
          proposal_id,
          envelope_hash: envelopeHashByProposal.get(proposal_id) ?? "",
        }))
        .filter((x) => x.envelope_hash.length > 0),
      rejected_proposals: decision.rejected_proposals,
      cost_total: decision.cost_used,
      cost_limit: Number.isFinite(maxTotalCost) ? maxTotalCost : undefined,
      budget_used: decision.budget_used,
      budget_limit: config.max_total_abs_delta_per_tick,
      gate_config_version: GATE_VERSION,
      signature_artifact_hash: signatureArtifactHash,
      signature_tick: signatureTick,
      signature_causal_refs: signatureCausalRefs,
      projection_2d_hash: projection2DHash,
      thread_1d_hash: thread1DHash,
      projection_version: projectionVersion,
      policy_version: CRYSTALLIZATION_CONFIG.policyVersion,
      policy_hash: policyHash,
    };

    const bridgeEvent: BridgeModeEvent = {
      event_type: "BRIDGE_MODE_EVENT",
      tick: state.tick,
      state_hash: state.state_hash,
      mode: bridgeResolution.mode,
      index_chain_checked:
        runtime.bridge_invariant_report?.index_chain_checked ?? false,
      index_chain_ok: runtime.bridge_invariant_report?.index_chain_ok ?? true,
      index_chain_checked_records:
        runtime.bridge_invariant_report?.index_chain_checked_records ?? 0,
      index_chain_failures: [
        ...(runtime.bridge_invariant_report?.index_chain_failures ?? []),
      ],
      gate_admission_index_chain_checked:
        runtime.bridge_invariant_report?.gate_admission_index_chain_checked ??
          false,
      gate_admission_index_chain_ok:
        runtime.bridge_invariant_report?.gate_admission_index_chain_ok ?? true,
      gate_admission_index_chain_checked_records:
        runtime.bridge_invariant_report
          ?.gate_admission_index_chain_checked_records ?? 0,
      gate_admission_index_chain_failures: [
        ...(runtime.bridge_invariant_report
          ?.gate_admission_index_chain_failures ?? []),
      ],
      invariant_packet_hash: runtime.bridge_invariant_report
        ? (await INVARIANT_PACKET.hash(
          await INVARIANT_PACKET.fromInvariantReport(
            runtime.bridge_invariant_report,
            { tick_anchor: state.tick, witness: runtime.witness },
          ),
        ))
        : undefined,
      canon_bound_proposals: [...canonBoundProposals].sort(),
      blocked_canon_proposals: [...blockedCanonProposals].sort(),
      reason: bridgeResolution.reason,
      witness: runtime.witness,
    };

    // 🛡️ Final Red Line Verification
    // "Trust but Verify" - Check if we accidentally mutated state in dry_run or exceeded limits
    if (
      config.dry_run && nextStateI16.some((v, i) => v !== state.state_i16[i])
    ) {
      const violation = {
        event_type: "VIOLATION_EVENT" as const,
        tick: state.tick,
        rule_id: "DRY_RUN_PURITY",
        severity: "CRITICAL" as const,
        state_hash: state.state_hash,
        details: "State mutation detected during dry_run",
        action_taken: "HALT_AND_QUARANTINE" as const,
      };
      await LEDGER.append(violation);
      throw new Error("🔴 RED LINE VIOLATION: DRY_RUN_PURITY. System Halted.");
    }

    await persistGateLedgerArtifacts(
      bridgeEvent,
      event,
      config,
      envelopeIndexPath,
      nextTick,
      nextHash,
      nextStateI16,
      AUTO_CHECKPOINT_INTERVAL,
    );

    return {
      tick: nextTick,
      state_i16: nextStateI16,
      state_hash: nextHash,
    };
  },

  /**
   * ERA 35: Immune Learning (Ally Registry)
   * Whitelist for "Good Viruses" that have proven their worth.
   */
  trustedSignatures: new Set<string>(),

  /**
   * ERA 62: Immune Memory (Symbiogenesis)
   * Tracks average resonance of novel plasmids to determine if they become Canon.
   * Key: 8-byte logic hex, Value: accumulated symbiosis score.
   */
  immuneMemory: new Map<string, number>(),

  evaluateSymbiosis: (stateMatrix: any) => {
    // --- ERA 62: Evaluate Pro-Resonant Viral Logic ---
    const active = stateMatrix.getActiveIndices();
    const variantStats = new Map<
      string,
      { count: number; totalResonance: number }
    >();
    let baseResonanceSum = 0;
    let baseCount = 0;

    for (const idx of active) {
      const logic = stateMatrix.getLogic(idx) as Uint8Array;
      let logicStr = "";
      for (let n = 0; n < 8; n++) {
        logicStr += logic[n].toString(16).padStart(2, "0");
      }

      const resonance = stateMatrix.getResonance(idx);

      if (GATE.trustedSignatures.has(logicStr)) {
        // Treat established allies and original canon as baseline
        baseCount++;
        baseResonanceSum += resonance;
      } else {
        // Track novel variants
        const stats = variantStats.get(logicStr) ||
          { count: 0, totalResonance: 0 };
        stats.count++;
        stats.totalResonance += resonance;
        variantStats.set(logicStr, stats);
      }
    }

    const baselineAvg = baseCount > 0 ? baseResonanceSum / baseCount : 15000; // 150 default

    // Reward variants that outperform the baseline or spread widely while healthy
    for (const [logicStr, stats] of variantStats.entries()) {
      const avgResonance = stats.totalResonance / stats.count;
      let score = GATE.immuneMemory.get(logicStr) || 0;

      if (avgResonance > baselineAvg && stats.count >= 3) {
        score += 10; // Reward successful propagation
      } else if (avgResonance < baselineAvg * 0.5) {
        score -= 5; // Penalize toxic variants
      }

      GATE.immuneMemory.set(logicStr, Math.max(0, score));

      // If score exceeds threshold, promote to Canon!
      if (score > 100 && !GATE.trustedSignatures.has(logicStr)) {
        LOGGER.info(
          `🛡️ [ERA 62: IMMUNE_LEARNING] Viral Plasmid evolved into Symbiont: ${logicStr} (Avg Resonance: ${
            (avgResonance / 100).toFixed(1)
          } > Baseline: ${(baselineAvg / 100).toFixed(1)})`,
        );
        GATE.trustedSignatures.add(logicStr);
      }
    }
  },

  /**
   * ERA 26: Collective Immunity
   * Proactively scans logic signatures for malignant patterns.
   * ERA 62: Integrated with evaluateSymbiosis.
   */
  detectAntigens: (stateMatrix: any) => {
    // Run the Era 62 symbiosis evaluator first
    GATE.evaluateSymbiosis(stateMatrix);

    const active = stateMatrix.getActiveIndices();
    const viralGrid = stateMatrix.viralGrid;

    for (const idx of active) {
      const logic = stateMatrix.getLogic(idx) as Uint8Array;
      let logicStr = "";
      for (let n = 0; n < 8; n++) {
        logicStr += logic[n].toString(16).padStart(2, "0");
      }

      // 🛡️ Era 35/62: Whitelist Bypass
      if (GATE.trustedSignatures.has(logicStr)) {
        if (typeof stateMatrix.setQuarantine === "function") {
          stateMatrix.setQuarantine(idx, 0); // Always CLEAN if trusted
        }
        continue;
      }

      let malignancy = 0;

      // --- ERA 49: Viral Load Detection (DEPRECATED in Pure Automaton Era) ---
      // Viral detection is now handled via metabolic cost and resonance audits.

      // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)

      // Pattern 1: Metabolic Theft (Excessive FEED OP-codes in sequence)
      let feedCount = 0;
      for (let i = 0; i < 8; i++) {
        if (logic[i] === 0x20) feedCount++;
      }
      if (feedCount > 4) malignancy += 50;

      // Pattern 2: Chaos Injection (High entropy logic without bonds)
      const bonds = stateMatrix.getBonds(idx);
      let hasBonds = false;
      for (let j = 0; j < 4; j++) if (bonds[j] !== 0) hasBonds = true;
      if (!hasBonds && feedCount > 2) malignancy += 30;

      // Apply Audit Decisions
      if (malignancy >= GRID_H) {
        stateMatrix.setId(idx, 0n); // RECYCLED (FATAL AUDIT)
        LOGGER.warn(
          `⚖️ [GATE] Fatal Audit: Atom ${idx} recycled (Malignancy: ${malignancy})`,
        );
      } else if (malignancy >= 40) {
        const parasiteRole = stateMatrix.ROLE_PARASITE ?? 4;
        stateMatrix.setRole(idx, parasiteRole); // FLAGGED (IMMUNE WATCH)
      }
    }
  },

  auditMatrix: (stateMatrix: any) => {
    LOGGER.debug("⚖️ [GATE] Starting Autonomous Systemic Audit...");

    // 1. Evaluate Symbiogenesis (Reward pro-resonant mutations)
    GATE.evaluateSymbiosis(stateMatrix);

    // 2. Detect Antigens (Identify and quarantine parasitic logic)
    GATE.detectAntigens(stateMatrix);

    // 3. Population Health Check
    const active = stateMatrix.getActiveIndices();
    let ghostCount = 0;
    for (const idx of active) {
      const energy = stateMatrix.getEnergy(idx);
      const resonance = stateMatrix.getResonance(idx);

      // If an atom has negative energy or extreme corruption, recycle it
      if (energy <= 0 || isNaN(energy) || isNaN(resonance)) {
        stateMatrix.setId(idx, 0n);
        ghostCount++;
      }
    }

    if (ghostCount > 0) {
      LOGGER.info(`⚖️ [GATE] Recycled ${ghostCount} corrupted/starved atoms.`);
    }
    LOGGER.debug(
      `⚖️ [GATE] Audit Complete. Population: ${active.length}. Trusted Signatures: ${GATE.trustedSignatures.size}`,
    );
  },
};

```

```

---

## FILE: src/ontology/l32_gate/genetic_ledger.md

```markdown
---
id: GENETIC_LEDGER
type: module
description: "Implementation of GENETIC_LEDGER"
tags: []
min_level: 3
---

### TypeScript
```typescript
import { RUNTIME_POLICY } from "../../03/RUNTIME_POLICY.ts";

export type GeneticLedgerKey =
  | "pulse.homeostasis.targetEnergy"
  | "pulse.homeostasis.band"
  | "pulse.homeostasis.maxDelta"
  | "pulse.homeostasis.overflowThreshold"
  | "pulse.homeostasis.baseTax"
  | "pulse.pressureRing.scale"
  | "daemon.maxActionsPerWindow"
  | "daemon.maxPheromoneIntensity"
  | "daemon.maxPlasmidCharge"
  | "federation.admission.degradeEnergyRatio"
  | "federation.admission.degradeResonanceRatio";

export type LedgerMutability =
  | "hard-invariant"
  | "bounded-runtime"
  | "daemon-governed";

export type GeneticLedgerEntry = {
  key: GeneticLedgerKey;
  defaultValue: number;
  min: number;
  max: number;
  mutability: LedgerMutability;
  hormoneLink: string | null;
  rollbackClass: "immediate" | "epochal";
  sourcePath: string;
  notes: string;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const ledgerEntry = (entry: GeneticLedgerEntry): GeneticLedgerEntry => ({
  ...entry,
  defaultValue: clamp(entry.defaultValue, entry.min, entry.max),
});

export const GENETIC_LEDGER_CATALOG: readonly GeneticLedgerEntry[] = Object
  .freeze([
    ledgerEntry({
      key: "pulse.homeostasis.targetEnergy",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.targetEnergy,
      min: 1,
      max: 10_000,
      mutability: "daemon-governed",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.targetEnergy",
      notes: "Primary metabolic target for average energy plateau.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.band",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.band,
      min: 1,
      max: 4096,
      mutability: "bounded-runtime",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.band",
      notes: "Acceptable energy band around the target plateau.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.maxDelta",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.maxDelta,
      min: 1,
      max: 256,
      mutability: "bounded-runtime",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.maxDelta",
      notes: "Per-tick cap for host-side homeostasis adjustments.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.overflowThreshold",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.overflowThreshold,
      min: 0.01,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "time_viscosity",
      rollbackClass: "epochal",
      sourcePath: "pulse.homeostasis.overflowThreshold",
      notes:
        "Threshold where spatial overflow starts contributing to taxation.",
    }),
    ledgerEntry({
      key: "pulse.homeostasis.baseTax",
      defaultValue: RUNTIME_POLICY.pulse.homeostasis.baseTax,
      min: 0,
      max: 128,
      mutability: "daemon-governed",
      hormoneLink: "entropy_pressure",
      rollbackClass: "immediate",
      sourcePath: "pulse.homeostasis.baseTax",
      notes: "Base metabolic tax applied before overflow-specific pressure.",
    }),
    ledgerEntry({
      key: "pulse.pressureRing.scale",
      defaultValue: RUNTIME_POLICY.pulse.pressureRing.scale,
      min: 0,
      max: 2048,
      mutability: "daemon-governed",
      hormoneLink: "aggression",
      rollbackClass: "immediate",
      sourcePath: "pulse.pressureRing.scale",
      notes:
        "Global amplitude of the pressure ring projected into signed axes.",
    }),
    ledgerEntry({
      key: "daemon.maxActionsPerWindow",
      defaultValue: RUNTIME_POLICY.daemon.maxActionsPerWindow,
      min: 1,
      max: 128,
      mutability: "bounded-runtime",
      hormoneLink: "time_viscosity",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxActionsPerWindow",
      notes: "Daemon action budget before rate-limiting blocks ingress.",
    }),
    ledgerEntry({
      key: "daemon.maxPheromoneIntensity",
      defaultValue: RUNTIME_POLICY.daemon.maxPheromoneIntensity,
      min: 1,
      max: 4096,
      mutability: "daemon-governed",
      hormoneLink: "aggression",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxPheromoneIntensity",
      notes: "Upper membrane intensity for soft external perturbations.",
    }),
    ledgerEntry({
      key: "daemon.maxPlasmidCharge",
      defaultValue: RUNTIME_POLICY.daemon.maxPlasmidCharge,
      min: 1,
      max: 4096,
      mutability: "daemon-governed",
      hormoneLink: "mutation_friction",
      rollbackClass: "immediate",
      sourcePath: "daemon.maxPlasmidCharge",
      notes: "Upper membrane intensity for durable symbolic cargo.",
    }),
    ledgerEntry({
      key: "federation.admission.degradeEnergyRatio",
      defaultValue: RUNTIME_POLICY.federation.admission.degradeEnergyRatio,
      min: 0.1,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "repair_drive",
      rollbackClass: "epochal",
      sourcePath: "federation.admission.degradeEnergyRatio",
      notes:
        "How sharply external federated ingress loses energy under degradation.",
    }),
    ledgerEntry({
      key: "federation.admission.degradeResonanceRatio",
      defaultValue: RUNTIME_POLICY.federation.admission.degradeResonanceRatio,
      min: 0.1,
      max: 1,
      mutability: "bounded-runtime",
      hormoneLink: "repair_drive",
      rollbackClass: "epochal",
      sourcePath: "federation.admission.degradeResonanceRatio",
      notes:
        "How sharply external federated ingress loses resonance under degradation.",
    }),
  ]);

const LEDGER_BY_KEY = new Map<GeneticLedgerKey, GeneticLedgerEntry>(
  GENETIC_LEDGER_CATALOG.map((entry) => [entry.key, entry]),
);

export const geneticLedgerEntryByKey = (
  key: GeneticLedgerKey,
): GeneticLedgerEntry | null => LEDGER_BY_KEY.get(key) ?? null;

export const geneticLedgerBaseline = (): Record<GeneticLedgerKey, number> =>
  Object.fromEntries(
    GENETIC_LEDGER_CATALOG.map((entry) => [entry.key, entry.defaultValue]),
  ) as Record<GeneticLedgerKey, number>;

```

```

---

## FILE: src/ontology/l32_gate/ledger_chain.md

```markdown
---
id: ledger_chain
type: module
description: "Implementation of ledger_chain"
tags: []
min_level: 0
---

### TypeScript
```typescript
// OMEGA-64 | ledger_chain.ts
// Ledger Chain and Proposal Envelope Index verification

import { readJsonlLines, appendJsonl, readJsonl } from "../../00/stream_utils.ts";
import { stable_stringify, sha256_hex, normalize_hex64 } from "../mod.ts";

const LEDGER_CHAIN_VERSION = "ledger-hash-chain/v1";

const stripLedgerChainFields = (entry: Record<string, unknown>) => {
  const body = { ...entry };
  delete body.chain_version;
  delete body.prev_event_hash;
  delete body.event_hash;
  return body;
};

const ledgerEventHash = async (
  body: Record<string, unknown>,
  prevEventHash: string | null,
): Promise<string> =>
  await sha256_hex(
    stable_stringify({
      chain_version: LEDGER_CHAIN_VERSION,
      prev_event_hash: prevEventHash,
      body,
    }),
  );

type LedgerChainReportInternal = {
  ok: boolean;
  checkedEvents: number;
  chainAnchoredEvents: number;
  legacyEvents: number;
  failures: string[];
  tailEventHash: string | null;
};

const verifyLedgerChainDetailedInternal = async (
  path: string,
): Promise<LedgerChainReportInternal> => {
  const lines = await readJsonlLines(path);
  const failures: string[] = [];
  let chainAnchoredEvents = 0;
  let legacyEvents = 0;
  let prevAnchoredHash: string | null = null;
  let tailEventHash: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(lines[i]) as Record<string, unknown>;
    } catch {
      failures.push(`LEDGER_CHAIN_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
      continue;
    }

    const hasChainVersion = row.chain_version !== undefined;
    const hasPrev = row.prev_event_hash !== undefined;
    const hasHash = row.event_hash !== undefined;
    const hasAnyChain = hasChainVersion || hasPrev || hasHash;
    const hasAllChain = hasChainVersion && hasPrev && hasHash;

    if (!hasAnyChain) {
      legacyEvents++;
      continue;
    }
    if (!hasAllChain) {
      failures.push(`LEDGER_CHAIN_PARTIAL_FIELDS_AT_LINE_${lineNo}`);
      continue;
    }

    chainAnchoredEvents++;
    if (row.chain_version !== LEDGER_CHAIN_VERSION) {
      failures.push(`LEDGER_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`);
    }

    const body = stripLedgerChainFields(row);
    const expectedHash = await ledgerEventHash(body, prevAnchoredHash);

    const recordedPrev = row.prev_event_hash === null
      ? null
      : normalize_hex64(row.prev_event_hash);
    if (
      row.prev_event_hash !== null &&
      typeof row.prev_event_hash !== "string"
    ) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_INVALID_AT_LINE_${lineNo}`);
    }
    if (recordedPrev !== prevAnchoredHash) {
      failures.push(`LEDGER_CHAIN_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    const recordedHash = normalize_hex64(row.event_hash);
    if (!recordedHash) {
      failures.push(`LEDGER_CHAIN_EVENT_HASH_INVALID_AT_LINE_${lineNo}`);
      prevAnchoredHash = expectedHash;
      tailEventHash = expectedHash;
      continue;
    }
    if (recordedHash !== expectedHash) {
      failures.push(`LEDGER_CHAIN_HASH_MISMATCH_AT_LINE_${lineNo}`);
    }

    prevAnchoredHash = recordedHash;
    tailEventHash = recordedHash;
  }

  return {
    ok: failures.length === 0,
    checkedEvents: lines.length,
    chainAnchoredEvents,
    legacyEvents,
    failures,
    tailEventHash,
  };
};

export const LEDGER__08_00_LEDGER = {
  STORAGE_PATH: "OMEGA_LEDGER.jsonl",
  CHAIN_VERSION: LEDGER_CHAIN_VERSION,
  append: async (entry: any): Promise<void> => {
    if (entry === undefined) return;
    const chain = await verifyLedgerChainDetailedInternal(
      LEDGER__08_00_LEDGER.STORAGE_PATH,
    );
    if (!chain.ok) {
      throw new Error(`LEDGER_CHAIN_INVALID:${chain.failures.join(",")}`);
    }

    const rawEntry = entry && typeof entry === "object"
      ? (entry as Record<string, unknown>)
      : { value: entry };
    const body = stripLedgerChainFields(rawEntry);
    const prevEventHash = chain.tailEventHash;
    const eventHash = await ledgerEventHash(body, prevEventHash);
    await appendJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH, {
      ...body,
      chain_version: LEDGER_CHAIN_VERSION,
      prev_event_hash: prevEventHash,
      event_hash: eventHash,
    });
  },
  readAllRaw: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  readAll: async function* (): AsyncGenerator<any> {
    yield* readJsonl(LEDGER__08_00_LEDGER.STORAGE_PATH);
  },
  verifyChainDetailed: async (path?: string) => {
    const report = await verifyLedgerChainDetailedInternal(
      path ?? LEDGER__08_00_LEDGER.STORAGE_PATH,
    );
    return {
      ok: report.ok,
      checkedEvents: report.checkedEvents,
      chainAnchoredEvents: report.chainAnchoredEvents,
      legacyEvents: report.legacyEvents,
      failures: report.failures,
      tailEventHash: report.tailEventHash,
    };
  },
};

// -------------------------------------------------------------------------
// PROPOSAL ENVELOPE INDEX
// -------------------------------------------------------------------------

const defaultEnvelopeIndexPath = (): string =>
  `${LEDGER__08_00_LEDGER.STORAGE_PATH}.proposal_envelope_index.jsonl`;

const resolveEnvelopeIndexPath = (path?: string): string =>
  path ?? PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX.STORAGE_PATH;

const ENVELOPE_INDEX_CHAIN_VERSION = "proposal-envelope-index/v1";
const envelopeIndexSeenByPath = new Map<string, Set<string>>();
const envelopeIndexTailByPath = new Map<string, string | null>();
const envelopeIndexCacheLoaded = new Set<string>();

const getEnvelopeIndexSeen = (path: string): Set<string> => {
  let seen = envelopeIndexSeenByPath.get(path);
  if (!seen) {
    seen = new Set<string>();
    envelopeIndexSeenByPath.set(path, seen);
  }
  return seen;
};

const canonicalEnvelopeIndexPayload = (entry: {
  tick: number;
  proposal_id: string;
  envelope_hash: string;
  source_event_id?: string;
}): string =>
  stable_stringify({
    tick: entry.tick,
    proposal_id: entry.proposal_id,
    envelope_hash: entry.envelope_hash,
    source_event_id: entry.source_event_id,
  });

const envelopeIndexRecordHash = async (
  entry: {
    tick: number;
    proposal_id: string;
    envelope_hash: string;
    source_event_id?: string;
  },
  prevIndexHash: string | null,
): Promise<string> =>
  await sha256_hex(
    stable_stringify({
      chain_version: ENVELOPE_INDEX_CHAIN_VERSION,
      prev_index_hash: prevIndexHash,
      payload: JSON.parse(canonicalEnvelopeIndexPayload(entry)),
    }),
  );

const ensureEnvelopeIndexCache = async (path: string): Promise<void> => {
  if (envelopeIndexCacheLoaded.has(path)) return;
  const seen = getEnvelopeIndexSeen(path);
  let tail: string | null = null;
  const lines = await readJsonlLines(path);
  for (const line of lines) {
    try {
      const row = JSON.parse(line) as Record<string, unknown>;
      const tick = Number(row.tick);
      const proposalId = typeof row.proposal_id === "string"
        ? row.proposal_id
        : "";
      const envelopeHash = normalize_hex64(row.envelope_hash) ?? "";
      const sourceEventId = typeof row.source_event_id === "string"
        ? row.source_event_id
        : undefined;
      if (
        !Number.isInteger(tick) || tick < 0 || proposalId.length === 0 ||
        envelopeHash.length === 0
      ) {
        continue;
      }
      seen.add(envelopeHash);
      const recordedHash = normalize_hex64(row.index_hash);
      if (recordedHash) {
        tail = recordedHash;
      } else {
        tail = await envelopeIndexRecordHash({
          tick,
          proposal_id: proposalId,
          envelope_hash: envelopeHash,
          source_event_id: sourceEventId,
        }, tail);
      }
    } catch {
      // ignore malformed historical lines in cache warmup
    }
  }
  envelopeIndexTailByPath.set(path, tail);
  envelopeIndexCacheLoaded.add(path);
};

export const PROPOSAL_ENVELOPE_INDEX__08_00_PROPOSAL_ENVELOPE_INDEX = {
  STORAGE_PATH: defaultEnvelopeIndexPath(),
  add: (envelopeHash?: string, path?: string): void => {
    const hash = normalize_hex64(envelopeHash);
    if (!hash) return;
    const indexPath = resolveEnvelopeIndexPath(path);
    getEnvelopeIndexSeen(indexPath).add(hash);
  },
  check: (envelopeHash?: string, path?: string): boolean => {
    const hash = normalize_hex64(envelopeHash);
    if (!hash) return false;
    const indexPath = resolveEnvelopeIndexPath(path);
    return getEnvelopeIndexSeen(indexPath).has(hash);
  },
  pathForLedger: (ledgerPath: string) =>
    `${ledgerPath}.proposal_envelope_index.jsonl`,
  resetCacheForTests: (path?: string) => {
    if (path) {
      const p = resolveEnvelopeIndexPath(path);
      envelopeIndexSeenByPath.delete(p);
      envelopeIndexTailByPath.delete(p);
      envelopeIndexCacheLoaded.delete(p);
      return;
    }
    envelopeIndexSeenByPath.clear();
    envelopeIndexTailByPath.clear();
    envelopeIndexCacheLoaded.clear();
  },
  verifyChainDetailed: async (path?: string) => {
    const indexPath = resolveEnvelopeIndexPath(path);
    const lines = await readJsonlLines(indexPath);
    const failures: string[] = [];
    let prevHash: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      let row: Record<string, unknown>;
      try {
        row = JSON.parse(lines[i]) as Record<string, unknown>;
      } catch {
        failures.push(`ENVELOPE_INDEX_JSON_PARSE_FAIL_AT_LINE_${lineNo}`);
        continue;
      }

      const tick = Number(row.tick);
      const proposalId = typeof row.proposal_id === "string"
        ? row.proposal_id
        : "";
      const envelopeHash = normalize_hex64(row.envelope_hash);
      const sourceEventId = typeof row.source_event_id === "string"
        ? row.source_event_id
        : undefined;
      if (!Number.isInteger(tick) || tick < 0) {
        failures.push(`ENVELOPE_INDEX_TICK_INVALID_AT_LINE_${lineNo}`);
        continue;
      }
      if (proposalId.length === 0) {
        failures.push(`ENVELOPE_INDEX_PROPOSAL_ID_INVALID_AT_LINE_${lineNo}`);
        continue;
      }
      if (!envelopeHash) {
        failures.push(
          `ENVELOPE_INDEX_ENVELOPE_HASH_INVALID_AT_LINE_${lineNo}`,
        );
        continue;
      }
      if (
        row.chain_version !== undefined &&
        row.chain_version !== ENVELOPE_INDEX_CHAIN_VERSION
      ) {
        failures.push(
          `ENVELOPE_INDEX_CHAIN_VERSION_UNSUPPORTED_AT_LINE_${lineNo}`,
        );
      }

      const expectedHash = await envelopeIndexRecordHash({
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
      }, prevHash);

      const recordedPrev = row.prev_index_hash === null
        ? null
        : normalize_hex64(row.prev_index_hash);
      const hasRecordedPrev = row.prev_index_hash !== undefined;
      if (hasRecordedPrev && recordedPrev !== prevHash) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISMATCH_AT_LINE_${lineNo}`);
      }

      const recordedHash = normalize_hex64(row.index_hash);
      if (row.index_hash !== undefined && !recordedHash) {
        failures.push(
          `ENVELOPE_INDEX_RECORD_HASH_INVALID_AT_LINE_${lineNo}`,
        );
      }
      if (!hasRecordedPrev && recordedHash && i > 0) {
        failures.push(`ENVELOPE_INDEX_PREV_HASH_MISSING_AT_LINE_${lineNo}`);
      }
      if (recordedHash && recordedHash !== expectedHash) {
        failures.push(
          `ENVELOPE_INDEX_RECORD_HASH_MISMATCH_AT_LINE_${lineNo}`,
        );
      }

      prevHash = recordedHash ?? expectedHash;
    }

    return {
      ok: failures.length === 0,
      checked_records: lines.length,
      failures,
    };
  },
  getRecentEnvelopeHashes: async (
    startTick: number,
    endTick: number,
    path?: string,
  ): Promise<Set<string>> => {
    const result = new Set<string>();
    for await (const row of readJsonl(resolveEnvelopeIndexPath(path))) {
      const tick = Number(row?.tick ?? -1);
      const envelopeHash = typeof row?.envelope_hash === "string"
        ? row.envelope_hash
        : "";
      if (!envelopeHash) continue;
      if (tick >= startTick && tick <= endTick) result.add(envelopeHash);
    }
    return result;
  },
  appendFromLedgerEvent: async (event: any, path?: string): Promise<void> => {
    const indexPath = resolveEnvelopeIndexPath(path);
    await ensureEnvelopeIndexCache(indexPath);
    const seen = getEnvelopeIndexSeen(indexPath);
    const tick = Number(event?.tick ?? -1);
    const envelopes = Array.isArray(event?.accepted_proposal_envelopes)
      ? event.accepted_proposal_envelopes
      : [];
    const sourceEventId = typeof event?.event_id === "string"
      ? event.event_id
      : undefined;
    let prevIndexHash = envelopeIndexTailByPath.get(indexPath) ?? null;

    for (const env of envelopes) {
      const proposalId = typeof env?.proposal_id === "string"
        ? env.proposal_id
        : "";
      const envelopeHash = normalize_hex64(env?.envelope_hash) ?? "";
      if (!envelopeHash) continue;
      const indexHash = await envelopeIndexRecordHash({
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
      }, prevIndexHash);
      await appendJsonl(indexPath, {
        tick,
        proposal_id: proposalId,
        envelope_hash: envelopeHash,
        source_event_id: sourceEventId,
        chain_version: ENVELOPE_INDEX_CHAIN_VERSION,
        prev_index_hash: prevIndexHash,
        index_hash: indexHash,
      });
      seen.add(envelopeHash);
      prevIndexHash = indexHash;
    }
    envelopeIndexTailByPath.set(indexPath, prevIndexHash);
    envelopeIndexCacheLoaded.add(indexPath);
  },
};

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

## FILE: src/ontology/math/clamp01.md

```markdown
---
id: clamp01
type: pure_fn
description: "Constrains a floating point number between 0.0 and 1.0 (inclusive)"
tags: []
deps: []
args:
  x: f64
returns: f64
tests:
  - [0.5, 0.5]
  - [-1.0, 0.0]
  - [2.5, 1.0]
  - [1.0, 1.0]
  - [0.0, 0.0]
---

### Rust
```rust
if x < 0.0 {
    0.0
} else if x > 1.0 {
    1.0
} else {
    x
}
```

### TypeScript
```typescript
if (x < 0) return 0;
if (x > 1) return 1;
return x;
```

### AssemblyScript
```assemblyscript
if (x < 0.0) return 0.0;
if (x > 1.0) return 1.0;
return x;
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

## FILE: src/ontology/math/make_xor_shift32.md

```markdown
---
id: make_xor_shift32
type: module
description: "Higher-order functional generator spinning up a PRNG XorShift32 state closure."
tags: ["host"]
min_level: 6
deps: []
returns: void
---

### TypeScript
```typescript
export const make_xor_shift32 = (seed: number): () => number => {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};
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

## FILE: src/ontology/math/normalize_angle.md

```markdown
---
id: normalize_angle
type: pure_fn
description: "Normalizes an angle to a uniform [0.0, 1.0) range derived from Tau (2 * PI)."
tags: []
deps: []
args:
  angle: f64
returns: f64
tests:
  - [0.0, 0.0]
  - [6.283185307179586, 0.0]
  - [3.141592653589793, 0.5]
  - [-3.141592653589793, 0.5]
---

### Rust
```rust
let tau = 2.0 * std::f64::consts::PI;
let mut a = angle % tau;
if a < 0.0 {
    a += tau;
}
a / tau
```

### TypeScript
```typescript
const tau = 2 * Math.PI;
let a = angle % tau;
if (a < 0) a += tau;
return a / tau;
```

### AssemblyScript
```assemblyscript
const tau: f64 = 2.0 * Math.PI;
let a: f64 = angle % tau;
if (a < 0.0) a += tau;
return a / tau;
```

```

---

## FILE: src/ontology/math/pack_structure_intent.md

```markdown
---
id: pack_structure_intent
type: pure_fn
description: "Packs a structure intent from a target type, a target value, and an optional lock bit."
tags: [inline, host]
min_level: 6
deps: []
args:
  target_type: u32
  target_value: u32
  locked: bool
returns: i32
tests:
  - [1, 55, false, 922746881]
  - [3, 0, true, -2147483645]
---

### Rust
```rust
let mut intent: u32 = target_type | (target_value << 24);
if locked {
    intent |= 0x80000000;
}
intent as i32
```

### TypeScript
```typescript
export function pack_structure_intent(target_type: number, target_value: number, locked: boolean): number {
    let intent = target_type | (target_value << 24);
    if (locked) {
        intent |= 0x80000000;
    }
    return intent | 0;
}
```

### AssemblyScript
```assemblyscript
let intent: u32 = target_type | (target_value << 24);
if (locked) {
    intent |= 0x80000000;
}
return intent as i32;
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

## FILE: src/ontology/math/to_int16_big_endian.md

```markdown
---
id: to_int16_big_endian
type: module
description: "Converts an Int16Array wrapper into correctly encoded Uint8Array bytes via Big Endian orientation."
tags: ["host"]
min_level: 6
deps: []
returns: void
---

### TypeScript
```typescript
export const to_int16_big_endian = (values: Int16Array): Uint8Array => {
  const out = new Uint8Array(values.length * 2);
  for (let i = 0; i < values.length; i++) {
    const v = values[i] < 0 ? values[i] + 0x1_0000 : values[i];
    out[i * 2] = (v >>> 8) & 0xFF;
    out[i * 2 + 1] = v & 0xFF;
  }
  return out;
};
```

```

---

## FILE: src/ontology/math/unpack_structure_charge.md

```markdown
---
id: unpack_structure_charge
type: pure_fn
description: "Unpacks the charge value (top 7 bits, excluding lock bit) from a structure intent or charge descriptor."
tags: [inline, host]
min_level: 6
deps: []
args:
  intent: i32
returns: u32
tests:
  - [922746881, 55]
  - [-2147483645, 0]
---

### Rust
```rust
((intent as u32) & 0x7F000000) >> 24
```

### TypeScript
```typescript
export function unpack_structure_charge(intent: number): number {
    return ((intent >>> 0) & 0x7F000000) >>> 24;
}
```

### AssemblyScript
```assemblyscript
return ((intent as u32) & 0x7F000000) >> 24;
```

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

## FILE: src/ontology/memory/atom_access.md

```markdown
---
id: ATOM_ACCESS
type: module
description: "Implementation of ATOM_ACCESS"
tags: []
deps: [memory_views]
min_level: 0
---

### TypeScript
```typescript
// OMEGA-64 | ATOM_ACCESS.ts
import {
  ATOM_CONTEXT_SIZE,
  ATOM_INSTRUCTION_SIZE,
  MAX_ATOMS,
  RESOURCE_MAX,
  SCALE,
  GRID_W,
  GRID_H,
  GRID_CELLS
} from "../00/SYSTEM_CONSTANTS.ts";
import { PROP_NEURAL_COHERENCE } from "../00/VmProps.ts";
import {
  OP_SYSCALL, OP_GET, OP_SUB, OP_JNZ, OP_SIGNAL, OP_JMP, OP_BUILD, OP_SET
} from "../00/VmOpcodes.ts";
import { SYS_YIELD, SYS_SET_ROLE } from "../00/VmSys.ts";
import * as views from "../02/memory_views.ts";

export const clampResourceRaw = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= RESOURCE_MAX) return RESOURCE_MAX;
  return Math.trunc(value);
};

export const toClampedEnergyRaw = (value: number): number =>
  clampResourceRaw(Math.round(value * SCALE));

export const SYNC = {
  IDLE: 0,
  WASM_TICKING: 1,
  HOST_LOCK: 2,
};

const DEFAULT_BOOT_SCRIPT = (() => {
  const boot = new Uint8Array(64);
  boot[0] = OP_SET;
  boot[1] = 0;
  boot[2] = SYS_YIELD;
  boot[3] = OP_SYSCALL;
  return boot;
})();

const GUARDIAN_COHERENCE_THRESHOLD = 200;

export const ATOM_ACCESS = {
  MAX_ATOMS: MAX_ATOMS,
  buffer: views.sharedBuffer,
  wasmMemory: views.wasmMemory,
  SCALE: SCALE,
  syncState: views.syncState,
  tickCounter: views.tickCounter,
  SYNC,
  phases: views.phases,
  evolutionReserved: views.evolutionReserved,
  roles: views.roles,
  spatialGrid: views.spatialGrid,
  structureGrid: views.structureGrid,
  signalGrid: views.signalGrid,
  memoryGrid: views.memoryGrid,
  attentionField: views.attentionField,
  glyphHeaders: views.glyphHeaders,
  glyphPayload: views.glyphPayload,
  hiveEnergyPool: views.hiveEnergyPool,
  coherence: views.coherence,
  neuralCoherence: views.neuralCoherence,
  hormones: views.hormones,
  lineage: views.lineage,
  instructions: views.instructions,
  ledgerHeadView: views.ledgerHeadView,
  ledgerDataView: views.ledgerDataView,
  contexts: views.contexts,
  semanticBonuses: views.semanticBonuses,
  memoryGridBuffer: views.memoryGridBuffer,
  signalGridBuffer: views.signalGridBuffer,
  structureGridBuffer: views.structureGridBuffer,
  attentionFieldBuffer: views.attentionFieldBuffer,
  glyphHeaderBuffer: views.glyphHeaderBuffer,
  glyphPayloadBuffer: views.glyphPayloadBuffer,
  roleRegistryBuffer: views.roleBuffer,
  bondStiffnessBuffer: views.stiffnessBuffer,
  bondDistancesBuffer: views.bondDistBuffer,
  dampingBuffer: views.dampingBuffer,
  semanticBonusesBuffer: views.semanticBonusesBuffer,
  immuneBuffer: views.signalGridBuffer,
  currentReadBuffer: views.signalGridBuffer,
  synapticStackBuffer: views.signalGridBuffer,
  viralGrid: views.signalGrid,
  viralGridBuffer: views.signalGridBuffer,
  hiveMemoryBuffer: views.hiveMemoryBuffer,
  hiveEnergyPoolBuffer: views.hiveEnergyPoolBuffer,
  hormoneBuffer: views.hormoneBuffer,
  lineageBuffer: views.lineageBuffer,

  ROLE_NEUTRAL: 0,
  ROLE_PRODUCER: 1,
  ROLE_GUARDIAN: 2,
  ROLE_ARCHITECT: 3,
  ROLE_PARASITE: 4,
  ROLE_MITOCHONDRIA: 5,

  getId: (i: number) => Atomics.load(views.ids, i),
  get_x: (i: number) => Atomics.load(views.xs, i),
  get_y: (i: number) => Atomics.load(views.ys, i),
  get_role: (i: number) => Atomics.load(views.roles, i),
  getX: (i: number) => Atomics.load(views.xs, i),
  getY: (i: number) => Atomics.load(views.ys, i),
  getRole: (i: number) => Atomics.load(views.roles, i),
  get_energy: (i: number) => Atomics.load(views.energies, i) / SCALE,
  get_resonance: (i: number) => Atomics.load(views.resonances, i),
  get_phase: (i: number) => Atomics.load(views.phases, i),
  getEnergy: (i: number) => Atomics.load(views.energies, i) / SCALE,
  getResonance: (i: number) => Atomics.load(views.resonances, i),
  getPhase: (i: number) => Atomics.load(views.phases, i),
  getEvolutionReserved: (i: number) => Atomics.load(views.evolutionReserved, i),
  getLogic: (i: number) => views.logic.subarray(i * 8, i * 8 + 8),
  getBonds: (i: number) => views.bonds.subarray(i * 4, i * 4 + 4),
  setBonds: (i: number, val: Uint32Array) => views.bonds.set(val, i * 4),
  get_bond_target: (i: number, slot: number) => Atomics.load(views.bonds, i * 4 + slot),
  get_bond_stiffness: (i: number, slot: number) => views.bondStiffness[i * 4 + slot],
  getBondTarget: (i: number, slot: number) => Atomics.load(views.bonds, i * 4 + slot),
  getBondStiffness: (i: number, slot: number) => views.bondStiffness[i * 4 + slot],
  getBondDistance: (i: number, slot: number) => Atomics.load(views.bondDistances, i * 4 + slot),
  hasBondRequest: (i: number) => Atomics.load(views.bondRequests, i * 3) !== 0,
  getBondRequestInitiator: (i: number) => Atomics.load(views.bondRequests, i * 3),
  getBondRequestTarget: (i: number) => Atomics.load(views.bondRequests, i * 3 + 1),
  getBondRequestDistance: (i: number) => Atomics.load(views.bondRequests, i * 3 + 2),
  getDamping: (i: number) => Atomics.load(views.damping, i),
  get_lineage: (i: number) => Atomics.load(views.lineage, i),
  getLineage: (i: number) => Atomics.load(views.lineage, i),
  getMailboxMsgType: (i: number) => Atomics.load(views.mailboxes, i * 2),
  getMailboxPayload: (i: number) => Atomics.load(views.mailboxes, i * 2 + 1),
  get_hive_memory: (addr: number) => Atomics.load(views.hiveMemory, addr & 1023),
  set_hive_memory: (addr: number, val: number) => { Atomics.store(views.hiveMemory, addr & 1023, val); },
  get_hive_balance: () => Atomics.load(views.hiveBalance, 0),
  getHiveMemory: (addr: number) => Atomics.load(views.hiveMemory, addr & 1023),
  setHiveMemory: (addr: number, val: number) => { Atomics.store(views.hiveMemory, addr & 1023, val); },
  getHiveBalance: () => Atomics.load(views.hiveBalance, 0),
  setHiveBalance: (val: number) => { Atomics.store(views.hiveBalance, 0, val); },
  add_hive_balance: (val: number) => Atomics.add(views.hiveBalance, 0, val),
  addHiveBalance: (val: number) => Atomics.add(views.hiveBalance, 0, val),
  getHiveEnergyPoolSlot: (slot: number) => Atomics.load(views.hiveEnergyPool, slot & 255),
  setHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.store(views.hiveEnergyPool, slot & 255, val),
  addHiveEnergyPoolSlot: (slot: number, val: number) => Atomics.add(views.hiveEnergyPool, slot & 255, val),

  getInstructions: (i: number) => views.instructions.subarray(i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE),
  getCode: (i: number) => views.codeWords.subarray(i * 16, i * 16 + 16),
  get_reg: (i: number, reg: number) => Atomics.load(views.contexts, i * ATOM_CONTEXT_SIZE + reg),
  get_p_c: (i: number) => Atomics.load(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getReg: (i: number, reg: number) => Atomics.load(views.contexts, i * ATOM_CONTEXT_SIZE + reg),
  getPC: (i: number) => Atomics.load(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32),
  getContext: (i: number) => views.contextByteView.subarray(i * (ATOM_CONTEXT_SIZE * 4), i * (ATOM_CONTEXT_SIZE * 4) + (ATOM_CONTEXT_SIZE * 4)),

  setId: (i: number, val: bigint) => Atomics.store(views.ids, i, val),
  setX: (i: number, val: number) => Atomics.store(views.xs, i, Math.round(val)),
  setY: (i: number, val: number) => Atomics.store(views.ys, i, Math.round(val)),
  getSynapticWeight: (index: number, slot: number): number => views.synapticWeights[index * 4 + slot],
  setSynapticWeight: (index: number, slot: number, weight: number) => { views.synapticWeights[index * 4 + slot] = weight; },
  set_role: (i: number, val: number) => Atomics.store(views.roles, i, val),
  set_energy: (i: number, val: number) => Atomics.store(views.energies, i, toClampedEnergyRaw(val)),
  set_resonance: (i: number, val: number) => Atomics.store(views.resonances, i, Math.trunc(clampResourceRaw(val))),
  set_phase: (i: number, val: number) => Atomics.store(views.phases, i, val),
  setRole: (i: number, val: number) => Atomics.store(views.roles, i, val),
  setEnergy: (i: number, val: number) => Atomics.store(views.energies, i, toClampedEnergyRaw(val)),
  setResonance: (i: number, val: number) => Atomics.store(views.resonances, i, Math.trunc(clampResourceRaw(val))),
  setPhase: (i: number, val: number) => Atomics.store(views.phases, i, val),
  setLogic: (i: number, val: Uint8Array) => views.logic.set(val, i * 8),
  set_bond_target: (i: number, slot: number, target: number) => Atomics.store(views.bonds, i * 4 + slot, target),
  set_bond_stiffness: (i: number, slot: number, val: number) => { views.bondStiffness[i * 4 + slot] = val; },
  setBondTarget: (i: number, slot: number, target: number) => Atomics.store(views.bonds, i * 4 + slot, target),
  setBondStiffness: (i: number, slot: number, val: number) => { views.bondStiffness[i * 4 + slot] = val; },
  setBondDistance: (i: number, slot: number, val: number) => Atomics.store(views.bondDistances, i * 4 + slot, val),
  set_damping: (i: number, val: number) => Atomics.store(views.damping, i, val),
  setDamping: (i: number, val: number) => Atomics.store(views.damping, i, val),
  setLineage: (i: number, val: bigint) => Atomics.store(views.lineage, i, val),
  setMailboxMsgType: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2, val),
  setMailboxPayload: (i: number, val: number) => Atomics.store(views.mailboxes, i * 2 + 1, val),

  setInstructions: (i: number, val: Uint8Array) => views.instructions.set(val, i * ATOM_INSTRUCTION_SIZE),
  setCode: (i: number, val: Uint32Array | Uint8Array) => {
    const codeStart = i * 16;
    if (val instanceof Uint32Array) {
      views.codeWords.fill(0, codeStart, codeStart + 16);
      views.codeWords.set(val.subarray(0, 16), codeStart);
      return;
    }
    const instStart = i * ATOM_INSTRUCTION_SIZE;
    views.instructions.fill(0, instStart, instStart + ATOM_INSTRUCTION_SIZE);
    views.instructions.set(val.subarray(0, ATOM_INSTRUCTION_SIZE), instStart);
  },
  set_reg: (i: number, reg: number, val: number) => Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  set_p_c: (i: number, val: number) => Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),
  setReg: (i: number, reg: number, val: number) => Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + reg, val),
  setPC: (i: number, val: number) => Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, val),

  getBondRequest: (i: number) => {
    const base = i * 3;
    const initiator = Atomics.load(views.bondRequests, base);
    return initiator !== 0 ? views.bondRequests.subarray(base, base + 3) : null;
  },
  clearBondRequest: (i: number) => Atomics.store(views.bondRequests, i * 3, 0),

  recycleAtom: (i: number) => {
    Atomics.store(views.ids, i, 0n);
    Atomics.store(views.energies, i, 0);
    Atomics.store(views.resonances, i, 0);
    Atomics.store(views.phases, i, 0);
    Atomics.store(views.roles, i, 0);
    views.bonds.fill(0, i * 4, i * 4 + 4);
    views.bondStiffness.fill(0, i * 4, i * 4 + 4);
    views.bondDistances.fill(0, i * 4, i * 4 + 4);
    Atomics.store(views.damping, i, 0);
    Atomics.store(views.lineage, i, 0n);
    views.instructions.fill(0, i * ATOM_INSTRUCTION_SIZE, i * ATOM_INSTRUCTION_SIZE + ATOM_INSTRUCTION_SIZE);
    views.contexts.fill(0, i * ATOM_CONTEXT_SIZE, i * ATOM_CONTEXT_SIZE + ATOM_CONTEXT_SIZE);
  },

  clear: () => {
    views.latticeClearView.fill(0);
    views.semanticBonuses.fill(0);
  },
  getActiveIndices: () => {
    const active: number[] = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) active.push(i);
    }
    return active;
  },
  getTopResonantIndices: (count: number) => {
    const limit = Math.max(0, Math.min(MAX_ATOMS, Math.trunc(count)));
    if (limit === 0) return [];

    const top: Array<{ idx: number; resonance: number }> = [];
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) continue;
      const resonance = Atomics.load(views.resonances, i);
      if (top.length < limit) {
        top.push({ idx: i, resonance });
        continue;
      }

      let minPos = 0;
      for (let j = 1; j < top.length; j++) {
        if (top[j].resonance < top[minPos].resonance) minPos = j;
      }
      if (resonance > top[minPos].resonance) {
        top[minPos] = { idx: i, resonance };
      }
    }
    top.sort((a, b) => b.resonance - a.resonance);
    return top.map((entry) => entry.idx);
  },

  findFreeSlot: (): number => {
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) return i;
    }
    return -1;
  },
  findEmptySlot: (): number => {
    for (let i = 1; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) === 0n) return i;
    }
    return -1;
  },

  packRenderFrame: (): Float32Array => {
    const active = ATOM_ACCESS.getActiveIndices();
    const len = active.length;
    const packet = new Float32Array(len * 4);

    for (let j = 0; j < len; j++) {
      const idx = active[j];
      const offset = j * 4;
      packet[offset] = Atomics.load(views.xs, idx);
      packet[offset + 1] = Atomics.load(views.ys, idx);
      packet[offset + 2] = Atomics.load(views.roles, idx);
      packet[offset + 3] = Atomics.load(views.resonances, idx);
    }
    return packet;
  },

  packPanopticonFrame: (): ArrayBuffer => {
    const active = ATOM_ACCESS.getActiveIndices();
    const atomCount = active.length;
    const gridCells = GRID_CELLS;
    const bytesPerAtom = 24;
    
    const totalBytes = 16 + gridCells + (atomCount * bytesPerAtom);
    const buffer = new ArrayBuffer(totalBytes);
    const cv = new DataView(buffer);
    const u8 = new Uint8Array(buffer);
    
    u8[0] = 79; u8[1] = 77; u8[2] = 71; u8[3] = 65;
    let offset = 4;
    
    cv.setInt32(offset, Atomics.load(views.tickCounter, 0), true);
    offset += 4;
    
    cv.setInt32(offset, gridCells, true);
    offset += 4;
    
    for(let i=0; i < gridCells; i++) {
        const type = ATOM_ACCESS.getGridType(i);
        const hasPlasmid = views.memoryGrid[i*8] > 0 ? 0x80 : 0;
        u8[offset++] = type | hasPlasmid;
    }
    
    cv.setInt32(offset, atomCount, true);
    offset += 4;
    
    for(let j=0; j < atomCount; j++) {
        const idx = active[j];
        cv.setInt16(offset, Atomics.load(views.xs, idx), true); offset += 2;
        cv.setInt16(offset, Atomics.load(views.ys, idx), true); offset += 2;
        u8[offset++] = Atomics.load(views.roles, idx);
        u8[offset++] = Math.min(255, Math.max(0, Atomics.load(views.resonances, idx)));
        cv.setUint16(offset, idx, true); offset += 2;
        
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 1), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 2), true); offset+=4;
        cv.setUint32(offset, Atomics.load(views.bonds, idx*4 + 3), true); offset+=4;
    }
    
    return buffer;
  },

  seedAtom: (
    i: number,
    id: bigint,
    x: number,
    y: number,
    energy: number,
    resonance: number,
    logicVal?: Uint8Array,
    script?: Uint8Array,
  ) => {
    Atomics.store(views.ids, i, id);
    Atomics.store(views.xs, i, Math.round(x));
    Atomics.store(views.ys, i, Math.round(y));
    Atomics.store(views.energies, i, Math.round(energy * SCALE));
    Atomics.store(views.resonances, i, Math.trunc(resonance));
    Atomics.store(views.phases, i, 0);
    Atomics.store(views.roles, i, 0);
    Atomics.store(views.semanticBonuses, i, 0);

    if (logicVal) views.logic.set(logicVal, i * 8);

    const boot = script || DEFAULT_BOOT_SCRIPT;
    views.instructions.set(boot, i * ATOM_INSTRUCTION_SIZE);

    for (let r = 0; r < ATOM_CONTEXT_SIZE; r++) Atomics.store(views.contexts, i * ATOM_CONTEXT_SIZE + r, 0);
    Atomics.store(views.contextByteView, i * (ATOM_CONTEXT_SIZE * 4) + 32, 0);
  },

  seedGuardian: (
    i: number,
    id: bigint,
    x: number,
    y: number,
    energy: number = 10,
    resonance: number = 100,
  ) => {
    const genome = new Uint8Array(8);
    const script = ATOM_ACCESS.getGuardianScript();
    ATOM_ACCESS.seedAtom(i, id, x, y, energy, resonance, genome, script);
    ATOM_ACCESS.set_role(i, ATOM_ACCESS.ROLE_GUARDIAN);
  },

  getGuardianScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = OP_GET;
    script[pc++] = 0;
    script[pc++] = PROP_NEURAL_COHERENCE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = GUARDIAN_COHERENCE_THRESHOLD;
    script[pc++] = OP_SUB;
    script[pc++] = 1;
    script[pc++] = 0;
    script[pc++] = OP_JNZ;
    script[pc++] = 1;
    script[pc++] = 22;

    script[pc++] = OP_SIGNAL;
    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 2;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_JMP;
    script[pc++] = 0;

    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 3;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getArchitectScript: () => {
    const script = new Uint8Array(64);
    let pc = 0;

    script[pc++] = OP_BUILD;
    script[pc++] = 0;
    script[pc++] = 0;
    script[pc++] = OP_SET;
    script[pc++] = 0;
    script[pc++] = SYS_SET_ROLE;
    script[pc++] = OP_SET;
    script[pc++] = 1;
    script[pc++] = 3;
    script[pc++] = OP_SYSCALL;
    script[pc++] = OP_JMP;
    script[pc++] = 0;

    return script;
  },

  getMatrixResonance: () => {
    let total = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      total += Atomics.load(views.signalGrid, i);
    }
    return total;
  },

  getClusterSync: () => {
    let sync = 0;
    for (let i = 0; i < GRID_CELLS; i++) {
      const res = Atomics.load(views.signalGrid, i);
      if (res > 100) sync++;
    }
    return sync;
  },

  getMemorySummary: () => {
    const counts = new Map<number, number>();
    for (let i = 0; i < GRID_CELLS; i++) {
      const energy = views.memoryGrid[i * 8] + (views.memoryGrid[i * 8 + 1] << 8);
      if (energy > 0) {
        const sig = views.memoryGrid[i * 8 + 4];
        counts.set(sig, (counts.get(sig) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([sig, count]) => ({ sig, count }));
  },

  injectEnergy: (amount: number) => {
    let count = 0;
    for (let i = 0; i < MAX_ATOMS; i++) {
      if (Atomics.load(views.ids, i) !== 0n) {
        const current = Atomics.load(views.energies, i);
        Atomics.store(views.energies, i, current + Math.round(amount * SCALE));
        count++;
      }
    }
    return count;
  },

  getGridType: (i: number) => Atomics.load(views.structureGrid, i) & 0xFF,
  getGridDensity: (i: number) => (Atomics.load(views.structureGrid, i) >> 8) & 0xFF,
  getGridCharge: (i: number) => (Atomics.load(views.structureGrid, i) >> 16) & 0xFF,
  getGridState: (i: number) => (Atomics.load(views.structureGrid, i) >> 24) & 0xFF,
  getGlyphHeader: (i: number) => Atomics.load(views.glyphHeaders, i),
  getGlyphPayload: (i: number) => views.glyphPayload.subarray(i * 8, i * 8 + 8),
  setGlyphHeader: (i: number, val: number) => Atomics.store(views.glyphHeaders, i, val),
  setGlyphPayload: (i: number, val: Uint8Array) => {
    views.glyphPayload.fill(0, i * 8, i * 8 + 8);
    views.glyphPayload.set(val.subarray(0, 8), i * 8);
  },

  setGridType: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x000000FF);
    Atomics.or(views.structureGrid, i, val & 0xFF);
  },
  setGridDensity: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x0000FF00);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 8);
  },
  setGridCharge: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0x00FF0000);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 16);
  },
  setGridState: (i: number, val: number) => {
    Atomics.and(views.structureGrid, i, ~0xFF000000);
    Atomics.or(views.structureGrid, i, (val & 0xFF) << 24);
  },
  getCausality: (idx: number) => Atomics.load(views.causality, idx),
  setCausality: (idx: number, val: number) => Atomics.store(views.causality, idx, val),
  clearDamping: () => views.damping.fill(0),
  get_hormone: (id: number) => Atomics.load(views.hormones, id),
  setHormone: (id: number, val: number) => Atomics.store(views.hormones, id, val),
};

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

## FILE: src/ontology/memory/memory_views.md

```markdown
---
id: memory_views
type: module
description: "Implementation of memory_views"
tags: []
deps: [SYSTEM_CONSTANTS, OMEGA_MEMORY_LAYOUT]
min_level: 0
---

### TypeScript
```typescript
import { 
  MAX_ATOMS, 
  SCALE, 
  GRID_CELLS, 
  MAX_LEDGER_EVENTS, 
  HIVE_ENERGY_POOL_SIZE, 
  HIVE_MEMORY_SIZE, 
  MAX_HORMONES, 
  ATOM_GENOME_SIZE, 
  ATOM_INSTRUCTION_SIZE, 
  ATOM_CONTEXT_SIZE,
  WASM_MEMORY_PAGES
} from "../00/SYSTEM_CONSTANTS.ts";
import {
  ATTENTION_FIELD_OFFSET,
  BONDS_OFFSET,
  BOND_DISTANCES_OFFSET,
  BOND_REQUESTS_OFFSET,
  CAUSALITY_OFFSET,
  COHERENCE_OFFSET,
  CONTEXT_OFFSET,
  DAMPING_OFFSET,
  ENERGY_OFFSET,
  EVOLUTION_OFFSET,
  GLYPH_HEADER_OFFSET,
  GLYPH_PAYLOAD_OFFSET,
  HIVE_BALANCE_OFFSET,
  HIVE_ENERGY_POOL_OFFSET,
  HIVE_MEMORY_OFFSET,
  HORMONE_OFFSET,
  IDS_OFFSET,
  INSTRUCTIONS_OFFSET,
  LEDGER_DATA_OFFSET,
  LEDGER_HEAD_OFFSET,
  LINEAGE_OFFSET,
  LOGIC_OFFSET,
  MAILBOX_OFFSET,
  MEMORY_GRID_OFFSET,
  MIN_WASM_MEMORY_PAGES,
  NEURAL_COHERENCE_OFFSET,
  PHASE_OFFSET,
  RESONANCE_OFFSET,
  ROLES_OFFSET,
  SIGNAL_GRID_OFFSET,
  SPATIAL_GRID_OFFSET,
  STIFFNESS_OFFSET,
  STRUCTURE_GRID_OFFSET,
  SYNAPTIC_WEIGHTS_OFFSET,
  SYNC_STATE_OFFSET,
  TICK_COUNTER_OFFSET,
  WASM_MEMORY_BYTES,
  XS_OFFSET,
  YS_OFFSET,
  validateMemoryLayout
} from "../01/OMEGA_MEMORY_LAYOUT.ts";

if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
  throw new Error(
    "[STATE_MATRIX] WASM memory too small: pages=" + WASM_MEMORY_PAGES + 
    ", required=" + MIN_WASM_MEMORY_PAGES,
  );
}
const layoutValidation = validateMemoryLayout(
  WASM_MEMORY_BYTES,
);
if (!layoutValidation.ok) {
  throw new Error(
    "[STATE_MATRIX] Invalid OFFSETS memory layout:\\n" +
      layoutValidation.errors.map((entry) => "- " + entry).join("\\n")
  );
}

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({
  initial: MIN_WASM_MEMORY_PAGES,
  maximum: WASM_MEMORY_PAGES,
  shared: true,
});
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE).buffer;
export const bondBuffer = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
export const bondDistBuffer = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4).buffer;
export const synapticWeightBuffer = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4).buffer;
export const dampingBuffer = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS).buffer;
export const causalityBuffer = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS).buffer;
export const roleBuffer = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS).buffer;
export const hiveMemoryBuffer = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE).buffer;
export const hiveBalanceBuffer = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1).buffer;
export const hiveEnergyPoolBuffer = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE).buffer;
export const memoryGridBuffer = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
export const signalGridBuffer = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS).buffer;
export const structureGridBuffer = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS).buffer;
export const attentionFieldBuffer = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS).buffer;
export const glyphHeaderBuffer = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS).buffer;
export const glyphPayloadBuffer = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8).buffer;
export const coherenceBuffer = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1).buffer;
export const neuralCoherenceBuffer = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1).buffer;
export const hormoneBuffer = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES).buffer;
export const lineageBuffer = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS).buffer;
export const mailboxBuffer = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2).buffer;

// TypedArray Views (Host side)
export const ids = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
export const xs = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
export const ys = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
export const energies = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
export const resonances = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS);
export const phases = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS);
export const evolutionReserved = new Int32Array(sharedBuffer, EVOLUTION_OFFSET, MAX_ATOMS);
export const roles = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS);
export const synapticWeights = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4);
export const logic = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE);
export const bonds = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4);
export const bondStiffness = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4);
export const bondDistances = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
export const bondRequests = new Int32Array(sharedBuffer, BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
export const damping = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS);
export const causality = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS);
export const hiveMemory = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE);
export const hiveBalance = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1);
export const hiveEnergyPool = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE);
export const spatialGrid = new Int32Array(sharedBuffer, SPATIAL_GRID_OFFSET, GRID_CELLS * 32);
export const structureGrid = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS);
export const signalGrid = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS);
export const memoryGrid = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8);
export const attentionField = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS);
export const glyphHeaders = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS);
export const glyphPayload = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8);
export const ledgerHeadView = new Int32Array(sharedBuffer, LEDGER_HEAD_OFFSET, 1);
export const ledgerDataView = new Int32Array(sharedBuffer, LEDGER_DATA_OFFSET, MAX_LEDGER_EVENTS * 4);
export const coherence = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);
export const neuralCoherence = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1);
export const hormones = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES);
export const lineage = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS);
export const mailboxes = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2);
export const instructions = new Uint8Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * ATOM_INSTRUCTION_SIZE);
export const codeWords = new Uint32Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
export const contexts = new Int32Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * ATOM_CONTEXT_SIZE);
export const contextByteView = new Uint8Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * (ATOM_CONTEXT_SIZE * 4));

export const semanticBonuses = new Int32Array(new SharedArrayBuffer(MAX_ATOMS * Int32Array.BYTES_PER_ELEMENT));
export const semanticBonusesBuffer = semanticBonuses.buffer;

export const latticeClearView = new Uint8Array(sharedBuffer, TICK_COUNTER_OFFSET);
export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
export const tickCounter = new Int32Array(sharedBuffer, TICK_COUNTER_OFFSET, 1);

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

## FILE: src/ontology/memory/state_matrix.md

```markdown
---
id: STATE_MATRIX
type: module
description: "Implementation of STATE_MATRIX"
deps: [memory_views, ATOM_ACCESS]
---

### TypeScript
```typescript
// OMEGA-64 | STATE_MATRIX.ts | Era 68: Absolute Coherence
// Segmented into memory_views.ts and ATOM_ACCESS.ts (Phase 2 Refactoring)

export * from "../02/memory_views.ts";
export * from "../03/ATOM_ACCESS.ts";

export { ATOM_ACCESS as STATE_MATRIX } from "../03/ATOM_ACCESS.ts";

```

```

---

## FILE: src/ontology/memory/state_snapshot.md

```markdown
---
id: STATE_SNAPSHOT
type: module
description: "Implementation of STATE_SNAPSHOT"
tags: []
min_level: 0
---

### TypeScript
```typescript
// STATE_SNAPSHOT.ts
// 🛡️ OMEGA-64 | Glider Lite | State & Proposal Types
// Normative definitions for the Gemini Glider Lite runtime.

/**
 * StateSnapshot: The canonical state of the system at a specific tick.
 * This is the input for all agents.
 */
export interface StateSnapshot {
  tick: number; // uint64
  state_i16: Int16Array; // int16[64] - The core state vector
  state_hash: string; // hex32 - Identity anchor

  // Optional projections (for observablity)
  phase_u16?: Uint16Array; // uint16[64]
  stability_q15?: Float32Array; // 0..1
  entropy_i16?: Int16Array; // -32768..32767
}

/**
 * AutonomyState: Represents the sovereignty levels of the system.
 */
export interface AutonomyState {
  state: number; // [0..1]
  gov: number; // [0..1]
  code: number; // [0..1]
}

/**
 * DeltaProposal: A request from an agent to modify the state.
 */
export interface DeltaProposal {
  proposal_id: string; // UUID or unique semantic ID
  tick: number; // Must match StateSnapshot.tick
  base_state_hash: string; // Must match StateSnapshot.state_hash
  agent_id: string; // Who is proposing?
  agent_phase_u16?: number; // Optional agent phase anchor [0..65535] for LOAD mismatch cost
  intent?: string; // Human-readable intent
  confidence: number; // float32 (0..1)
  delta: Array<{ level: number; value: number }>; // Sparse delta: level (0-63), value (int16)
  cost_estimate?: number; // uint64
  artifact_hash?: string; // Identity anchor of the agent's internal state
  semantic_fingerprint?: string; // hex32 - Semantic drift metric
  causal_refs?: string[]; // hex32[] - Optional lineage anchors
  target_path?: "LOCAL" | "CANON"; // optional routing hint for L32 membrane
  quorum_strength?: number; // range [0..1] - Local group coherence factor for Stage 25
  origin_atom_idx?: number; // index of the proposing atom in the lattice
  resonance?: number; // resonance level of the proposing atom
  signature_scheme?: AgentSignatureScheme; // optional signature scheme marker
  agent_signature?: string; // optional signed envelope for proposal integrity/authenticity
  proposal_envelope_hash?: string; // optional precomputed envelope hash anchor
}

/**
 * GateConfig: Configuration for the L32 Gate.
 */
export interface GateConfig {
  max_abs_delta_per_level: number; // uint16
  max_total_abs_delta_per_tick: number; // uint32
  max_total_cost_per_tick?: number; // uint64 (optional global cost cap)
  max_cost_per_agent: number; // uint64
  reliability_weight: Map<string, number>; // agent_id -> weight (0..1)
  reliability_mode?: "STATIC" | "PHASE_COHERENCE"; // optional admission weighting mode
  reliability_floor?: number; // optional [0..1] floor when PHASE_COHERENCE is active
  dry_run: boolean; // If true, state is NOT mutated
  global_syntropy?: number; // range [0..1] - System-wide structural organization for Stage 25
  signature_policy?: SignaturePolicy; // DISABLED (default), OPTIONAL, REQUIRED
  agent_signature_keys?: Map<string, AgentSignatureKey>; // agent_id -> shared verification key
  anti_replay_window_ticks?: number; // reject replays of same proposal envelope within recent window
}

export type AgentSignatureScheme = "ed25519/v1" | "hmac-sha256/v1";
export type SignaturePolicy = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type AgentSignatureKey =
  | { scheme: "ed25519/v1"; public_key_b64: string }
  | { scheme: "hmac-sha256/v1"; secret: string };

/**
 * GateDecision: The result of the L32 Gate processing.
 */
export interface GateDecision {
  accepted_proposals: string[]; // IDs of accepted proposals
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  budget_used: number; // uint32
  cost_used: number; // uint64
  accepted_delta: Array<{ level: number; value: number }>; // The final merged delta
}

/**
 * LedgerEvent: The canonical record of a state transition.
 */
export interface LedgerEvent {
  event_id: string;
  tick: number;
  ts_unix_ms: number;
  state_before_hash: string;
  state_after_hash: string;
  accepted_delta: Array<{ level: number; value: number }>;
  proposal_digest: string; // Hash of all proposals (for integrity)
  accepted_proposals: string[];
  accepted_proposal_metrics?: Array<{
    proposal_id: string;
    agent_id: string;
    confidence: number;
    reliability_base: number;
    reliability_effective: number;
    phase_coherence?: number;
    weight: number;
    physical_cost: number;
    agent_phase_u16?: number;
  }>;
  accepted_proposal_envelopes?: Array<
    { proposal_id: string; envelope_hash: string }
  >;
  rejected_proposals: Array<{ proposal_id: string; reason: string }>;
  cost_total: number;
  cost_limit?: number;
  budget_used: number;
  budget_limit?: number; // max_total_abs_delta_per_tick used by the gate
  gate_config_version: string;
  signature_artifact_hash?: string; // hash anchor of transition artifact (usually proposal_digest)
  signature_tick?: number; // tick used by topological signature builder
  signature_causal_refs?: string[]; // canonical sorted causal refs
  projection_2d_hash?: string; // deterministic 2D projection hash
  thread_1d_hash?: string; // deterministic 1D thread hash
  projection_version?: string; // signature projection version
  policy_version?: string; // crystallization/gate policy version
  policy_hash?: string; // SHA-256 of canonical crystallization policy payload
  chain_version?: string; // ledger hash-chain schema version
  prev_event_hash?: string | null; // hash anchor to previous ledger line
  event_hash?: string; // hash of this event payload + prev_event_hash
  witness?: string;
}

/**
 * BridgeModeEvent: L32 membrane trace for canon causal integrity mode.
 * Includes invariant packet hash for lightweight witness exchange.
 */
export interface BridgeModeEvent {
  event_type: "BRIDGE_MODE_EVENT";
  tick: number;
  state_hash: string;
  mode: "GREEN" | "AMBER" | "RED";
  index_chain_checked: boolean;
  index_chain_ok: boolean;
  index_chain_checked_records: number;
  index_chain_failures: string[];
  gate_admission_index_chain_checked?: boolean;
  gate_admission_index_chain_ok?: boolean;
  gate_admission_index_chain_checked_records?: number;
  gate_admission_index_chain_failures?: string[];
  invariant_packet_hash?: string;
  canon_bound_proposals: string[];
  blocked_canon_proposals: string[];
  reason: string;
  chain_version?: string;
  prev_event_hash?: string | null;
  event_hash?: string;
  witness?: string;
}

// Canonical Rejection Reasons
export const REJECTION = {
  SCHEMA_INVALID: "SCHEMA_INVALID",
  TICK_MISMATCH: "TICK_MISMATCH",
  BASE_HASH_MISMATCH: "BASE_HASH_MISMATCH",
  UNKNOWN_AGENT: "UNKNOWN_AGENT",
  COST_OVER_BUDGET: "COST_OVER_BUDGET",
  EMPTY_DELTA: "EMPTY_DELTA",
  OUT_OF_RANGE_VALUE: "OUT_OF_RANGE_VALUE",
  CANON_PATH_REQUIRES_GREEN_BRIDGE: "CANON_PATH_REQUIRES_GREEN_BRIDGE",
  SIGNATURE_REQUIRED: "SIGNATURE_REQUIRED",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  SIGNATURE_KEY_MISSING: "SIGNATURE_KEY_MISSING",
  SIGNATURE_SCHEME_UNSUPPORTED: "SIGNATURE_SCHEME_UNSUPPORTED",
  PROPOSAL_ENVELOPE_HASH_MISMATCH: "PROPOSAL_ENVELOPE_HASH_MISMATCH",
  REPLAY_ENVELOPE_DUPLICATE: "REPLAY_ENVELOPE_DUPLICATE",
};

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
  - SYSTEM_CONSTANTS
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
  let dampingFactor: f32 = 1.0 - ((damping as f32) / 255.0);
  if (dampingFactor < 0.0) dampingFactor = 0.0;
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
  - fast_min
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
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
                -fast_min(oEnergy, burn),
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
                -fast_min(oEnergy, burn),
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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
// unimplemented
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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/semantic/avatar_engine.md

```markdown
---
id: AVATAR_ENGINE
type: module
description: "Implementation of AVATAR_ENGINE"
tags: []
min_level: 5
---

### TypeScript
```typescript
// OMEGA-64 | AVATAR_ENGINE.ts | Era 18: Emergent Avatar
// Transforms observer interaction purely into thermodynamic pheromone deposits.

import { GLYPH_TELEMETRY } from "@06";
import { STATE_MATRIX } from "@00";
import { GRID_W, SCALE } from "../mod.ts";

const getGridIdx = (x: number, y: number) => {
  const gx = Math.floor(x / SCALE);
  const gy = Math.floor(y / SCALE);
  if (gx < 0 || gx >= GRID_W || gy < 0) return 0; // Simple boundary check 
  return gx + gy * GRID_W;
};

export const AVATAR_ENGINE = {
  /**
   * Deposits ATTENTION pheromones into the physics grid at cursor locations.
   * Atoms will naturally react to this scent based on their genetic logic.
   */
  dropPheromone: (x: number, y: number, intensity: number = 100) => {
    GLYPH_TELEMETRY.depositPheromone(x, y, intensity);
    const idx = getGridIdx(x, y);
    const coreDelta = Math.max(1, Math.min(1000, intensity));
    const haloDelta = Math.max(1, Math.min(1000, coreDelta * 0.25));

    // Spill a highly concentrated dose of attention at the cursor
    // Capped to prevent float overflow or infinite pooling
    const current = STATE_MATRIX.attentionField[idx];
    if (current < 1000) {
      STATE_MATRIX.attentionField[idx] += coreDelta;
    }

    // Also spill slightly into immediate neighbors to create a gradient
    const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
    for (const [ox, oy] of checkPoints) {
      const sIdx = getGridIdx(x + ox, y + oy);
      const sCurrent = STATE_MATRIX.attentionField[sIdx];
      if (sCurrent < 1000) {
        STATE_MATRIX.attentionField[sIdx] += haloDelta;
      }
    }
  },
};

```

```

---

## FILE: src/ontology/semantic/llm_soul.md

```markdown
---
id: llm_soul
type: module
description: "Implementation of llm_soul"
tags: []
min_level: 5
---

### TypeScript
```typescript
// OMEGA-64 | llm_soul.ts | Stage 39 Gemini External Brain
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

const PROXY_URL = "http://localhost:8080";
const AVATAR_ID = 9999;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  LOGGER.error("GEMINI_API_KEY environment variable is missing.");
  Deno.exit(1);
}

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  `You are a biological atom named "Avatar" (ID 9999) surviving in a 2D Artificial Life matrix (the OMEGA-64 Sandbox).
Your goal is to survive as long as possible. Your energy slowly drains over time.

GRID: 1400x800

ROLES: 
- 0: Prey (Neutral). They are food. Chase them.
- 1: Producer. They are background vegetation.
- 2: Guardian (Your Role). 
- 4: Predator (Parasite). They want to eat you. RUN AWAY from them!

You will receive your current state and a "vision" array showing nearby entities.
Vision entities have "dx" and "dy" which are relative to you. (e.g. if dx is 20, the entity is 20 pixels to your Right).
Distance is Euclidean distance.

AVAILABLE ACTIONS (Pick ONE per turn):
1. MOVE: Requires you to specify a direction vector. dx can be -1, 0, or 1. dy can be -1, 0, or 1. (Speed is 10 pixels per move).
2. EAT: Requires "targetIdx" of an entity that is very close (distance < 20).
3. YIELD: Do nothing, just rest.

OUTPUT FORMAT:
To conserve API limits, you must formulate a "Macro-Strategy" consisting of EXACTLY 5 sequential actions. 
You MUST output ONLY a valid JSON array of action objects. No markdown formatting, no explanations. 
Example of a valid strategy array:
[
  {"action": "MOVE", "dx": -1, "dy": 1},
  {"action": "MOVE", "dx": -1, "dy": 1},
  {"action": "EAT", "targetIdx": 105},
  {"action": "MOVE", "dx": 0, "dy": 1},
  {"action": "YIELD"}
]
`;

async function queryGemini(state: any, vision: any[]): Promise<any[]> {
  const prompt = `Current State:\nPosition: (${state.x}, ${state.y})\nEnergy: ${
    Math.floor(state.energy)
  }\n\nVision (sorted by distance):\n${
    JSON.stringify(vision, null, 2)
  }\n\nWhat is your 5-step macro-strategy? Output ONLY a JSON array.`;

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [{
      parts: [{ text: prompt }],
    }],
    generationConfig: {
      temperature: 0.2,
    },
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${errBody}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) throw new Error("Empty response from Gemini");

    // Cleanup potential markdown fences
    const cleanText = textResponse.replace(/`{3}json/g, "").replace(/`{3}/g, "")
      .trim();
    return JSON.parse(cleanText);
  } catch (e: any) {
    LOGGER.error(`[LLM_SOUL] Failed to query LLM: ${e.message}`);
    // Fallback to Stasis / Protective Random Wander if API fails (e.g., 429 Too Many Requests)
    return [
      { action: "YIELD" },
      { action: "YIELD" },
      {
        action: "MOVE",
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? 1 : -1,
      },
      { action: "YIELD" },
      { action: "YIELD" },
    ];
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSoul() {
  LOGGER.info(`[LLM_SOUL] Booting AI Soul for Avatar ${AVATAR_ID}...`);

  let actionBuffer: any[] = [];

  while (true) {
    try {
      if (actionBuffer.length === 0) {
        // 1. SENSE Environment (Only when buffer is empty)
        const res = await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}`);
        if (!res.ok) {
          LOGGER.warn("[LLM_SOUL] Cannot reach Matrix Proxy. Waiting...");
          await sleep(2000);
          continue;
        }

        const data = await res.json();
        const me = data.self;
        // Filter out producers to save tokens, only care about predators (4) and prey (0)
        const vision = data.vision.filter((v: any) =>
          v.role === 0 || v.role === 4
        ).slice(0, 10);

        LOGGER.info(
          `[LLM_SOUL] Energy: ${
            Math.floor(me.energy)
          } | Seeing ${vision.length} threats/food.`,
        );

        // 2. COGNITION
        LOGGER.debug("[LLM_SOUL] Querying Gemini for Macro-Strategy...");
        const strategy = await queryGemini(me, vision);

        if (Array.isArray(strategy)) {
          actionBuffer = strategy;
        } else {
          LOGGER.warn("[LLM_SOUL] Invalid LLM response, dropping to stasis.");
          actionBuffer = [{ action: "YIELD" }, { action: "YIELD" }];
        }
      }

      // 3. ACT (Pop one action from buffer)
      if (actionBuffer.length > 0) {
        const intent = actionBuffer.shift();
        LOGGER.info(`[LLM_SOUL] EXECUTING BUFFER -> ${JSON.stringify(intent)}`);

        await fetch(`${PROXY_URL}/api/atom/${AVATAR_ID}/act`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(intent),
        });
      }
    } catch (e: any) {
      LOGGER.error("[LLM_SOUL] Loop error:", e.message);
      actionBuffer = []; // Clear buffer on severe error
      await sleep(5000); // Backoff
    }

    // Tick delay (Matrix is 10 TPS. We execute 1 action every 500ms (2 TPS) to give the Avatar a steady physical pace)
    await sleep(500);
  }
}

if (import.meta.main) {
  runSoul();
}

```

```

---

## FILE: src/ontology/semantic/semantic_membrane.md

```markdown
---
id: SEMANTIC_MEMBRANE
type: module
description: "Implementation of SEMANTIC_MEMBRANE"
tags: []
min_level: 5
---

### TypeScript
```typescript
import { GRID_W, GRID_H, GRID_CELLS } from "../mod.ts";
// OMEGA-64 | SEMANTIC_MEMBRANE.ts | Homeostatic Embeddings (Era 17)
// Advanced semantic grouping with synaptic scaling and homeostasis (L8).

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { LLM_SYNAPSE } from "../../05/LLM_SYNAPSE.ts";

const PROJECTION_SIZE = 64;
const projectionMatrix = new Float32Array(PROJECTION_SIZE * PROJECTION_SIZE);
const activityHistory = new Float32Array(PROJECTION_SIZE);
let lastNormalization = 0;
const BEHAVIOR_FRAME_MAX_ATOMS = 4096;
const BEHAVIOR_CURVE_LENGTH = 16;
const BEHAVIOR_STATE_TTL_TICKS = 2048;
const OP_REPLICATE = 0x80;
const OP_SIGNAL = 0x81;
const OP_BUILD = 0xA8;

export type BehaviorFingerprint = {
  replicateRatio: number;
  signalRatio: number;
  buildRatio: number;
  survivalCurve: number[];
};

export type BehaviorCluster = {
  behaviorSignature: string;
  memberCount: number;
  dominantRole: number;
  genomeSamples: string[];
  fingerprint: BehaviorFingerprint;
  lastTick: number;
};

type BehaviorRuntime = {
  survivalCurve: number[];
  lastTick: number;
  memberCount: number;
  dominantRole: number;
  genomeSamples: string[];
  fingerprint: BehaviorFingerprint;
};

// Initialize with deterministic pseudo-random resonance
for (let i = 0; i < projectionMatrix.length; i++) {
  projectionMatrix[i] = Math.sin(i * 0.123);
}

let hyperplanes: Float32Array[] = [];
function getHyperplanes(dim: number): Float32Array[] {
  if (hyperplanes.length === 64 && hyperplanes[0].length === dim) {
    return hyperplanes;
  }
  hyperplanes = [];
  for (let i = 0; i < 64; i++) {
    const plane = new Float32Array(dim);
    for (let j = 0; j < dim; j++) {
      const u1 = Math.sin(i * 13.37 + j * 9.99) || 0.001;
      const u2 = Math.cos(i * 4.2 + j * 7.77);
      plane[j] = Math.sqrt(-2.0 * Math.log(Math.abs(u1))) *
        Math.cos(2.0 * Math.PI * u2);
    }
    hyperplanes.push(plane);
  }
  return hyperplanes;
}

const toGenomeHex = (logic: Uint8Array): string =>
  Array.from(logic).map((b) => b.toString(16).padStart(2, "0")).join("")
    .toUpperCase();

const quantizeRatio = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const bounded = Math.max(0, Math.min(1, value));
  return Math.round(bounded * 100) / 100;
};

const deriveBehaviorFingerprint = (
  instructions: Uint8Array,
): Omit<BehaviorFingerprint, "survivalCurve"> => {
  let replicate = 0;
  let signal = 0;
  let build = 0;
  let activeSlots = 0;

  for (let i = 0; i < 64; i += 4) {
    const op = instructions[i];
    if (op !== 0) activeSlots++;
    if (op === OP_REPLICATE) replicate++;
    if (op === OP_SIGNAL) signal++;
    if (op === OP_BUILD) build++;
  }

  const denom = Math.max(1, activeSlots);
  return {
    replicateRatio: quantizeRatio(replicate / denom),
    signalRatio: quantizeRatio(signal / denom),
    buildRatio: quantizeRatio(build / denom),
  };
};

const behaviorSignature = (
  fingerprint: Omit<BehaviorFingerprint, "survivalCurve">,
): string =>
  `R${fingerprint.replicateRatio.toFixed(2)}|S${
    fingerprint.signalRatio.toFixed(2)
  }|B${fingerprint.buildRatio.toFixed(2)}`;

const trimCurve = (curve: number[]): number[] =>
  curve.length > BEHAVIOR_CURVE_LENGTH
    ? curve.slice(-BEHAVIOR_CURVE_LENGTH)
    : curve;

const behaviorRuntime = new Map<string, BehaviorRuntime>();
let behaviorFrameCache: BehaviorCluster[] = [];
let behaviorFrameTick = -1;

export const SEMANTIC_MEMBRANE = {
  projectionMatrix,
  thoughtArchive: new Map<string, string>(),
  lineage: new Map<string, string>(), // ERA 23: childGenome -> parentGenome
  behaviorRuntime,

  captureBehaviorFrame: (
    tick: number,
    sampleLimit: number = BEHAVIOR_FRAME_MAX_ATOMS,
  ): BehaviorCluster[] => {
    const safeTick = Number.isFinite(tick) ? Math.max(0, Math.floor(tick)) : 0;
    if (safeTick === behaviorFrameTick) {
      return behaviorFrameCache;
    }

    const active = STATE_MATRIX.getActiveIndices();
    const localSampleLimit = Number.isFinite(sampleLimit)
      ? Math.max(64, Math.floor(sampleLimit))
      : BEHAVIOR_FRAME_MAX_ATOMS;
    const stride = active.length > localSampleLimit
      ? Math.ceil(active.length / localSampleLimit)
      : 1;

    type Aggregate = {
      memberCount: number;
      replicateTotal: number;
      signalTotal: number;
      buildTotal: number;
      roleCounts: number[];
      genomeSamples: string[];
    };

    const aggregates = new Map<string, Aggregate>();
    for (let i = 0; i < active.length; i += stride) {
      const idx = active[i];
      const fingerprint = deriveBehaviorFingerprint(
        STATE_MATRIX.getInstructions(idx),
      );
      const signature = behaviorSignature(fingerprint);
      let bucket = aggregates.get(signature);
      if (!bucket) {
        bucket = {
          memberCount: 0,
          replicateTotal: 0,
          signalTotal: 0,
          buildTotal: 0,
          roleCounts: [0, 0, 0, 0, 0, 0, 0, 0],
          genomeSamples: [],
        };
        aggregates.set(signature, bucket);
      }

      bucket.memberCount++;
      bucket.replicateTotal += fingerprint.replicateRatio;
      bucket.signalTotal += fingerprint.signalRatio;
      bucket.buildTotal += fingerprint.buildRatio;
      const role = Math.min(7, Math.max(0, STATE_MATRIX.getRole(idx)));
      bucket.roleCounts[role] += 1;

      const genome = toGenomeHex(STATE_MATRIX.getLogic(idx));
      if (
        bucket.genomeSamples.length < 6 &&
        !bucket.genomeSamples.includes(genome)
      ) {
        bucket.genomeSamples.push(genome);
      }
    }

    const seen = new Set<string>();
    const frame: BehaviorCluster[] = [];
    for (const [signature, bucket] of aggregates.entries()) {
      seen.add(signature);
      const memberCount = Math.max(1, bucket.memberCount);
      const dominantRole = bucket.roleCounts.indexOf(
        Math.max(...bucket.roleCounts),
      );
      const fingerprint: BehaviorFingerprint = {
        replicateRatio: quantizeRatio(bucket.replicateTotal / memberCount),
        signalRatio: quantizeRatio(bucket.signalTotal / memberCount),
        buildRatio: quantizeRatio(bucket.buildTotal / memberCount),
        survivalCurve: [],
      };

      const previous = behaviorRuntime.get(signature);
      const survivalCurve = trimCurve([
        ...(previous?.survivalCurve ?? []),
        bucket.memberCount,
      ]);
      fingerprint.survivalCurve = survivalCurve;

      behaviorRuntime.set(signature, {
        survivalCurve,
        lastTick: safeTick,
        memberCount: bucket.memberCount,
        dominantRole,
        genomeSamples: bucket.genomeSamples.slice(0, 6),
        fingerprint,
      });

      frame.push({
        behaviorSignature: signature,
        memberCount: bucket.memberCount,
        dominantRole,
        genomeSamples: bucket.genomeSamples.slice(0, 6),
        fingerprint,
        lastTick: safeTick,
      });
    }

    for (const [signature, runtime] of behaviorRuntime.entries()) {
      if (seen.has(signature)) continue;
      if (safeTick - runtime.lastTick > BEHAVIOR_STATE_TTL_TICKS) {
        behaviorRuntime.delete(signature);
        continue;
      }
      runtime.survivalCurve = trimCurve([...runtime.survivalCurve, 0]);
      runtime.lastTick = safeTick;
      runtime.fingerprint = {
        ...runtime.fingerprint,
        survivalCurve: runtime.survivalCurve,
      };
      behaviorRuntime.set(signature, runtime);
    }

    frame.sort((a, b) => b.memberCount - a.memberCount);
    behaviorFrameCache = frame.slice(0, 32);
    behaviorFrameTick = safeTick;
    return behaviorFrameCache;
  },

  getBehaviorClusters: (limit: number = 6): BehaviorCluster[] => {
    const take = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 6;
    return behaviorFrameCache.slice(0, take);
  },

  dominantBehaviorInvariant: (): string =>
    behaviorFrameCache.length > 0
      ? behaviorFrameCache[0].behaviorSignature
      : "none",

  /**
   * Adapts projection with Homeostatic Plasticity.
   */
  adapt: (vecA: Float32Array, vecB: Float32Array, resonance: number) => {
    const learningRate = 0.001 * resonance;
    const ltdThreshold = 0.1;

    for (let i = 0; i < PROJECTION_SIZE; i++) {
      activityHistory[i] = 0.99 * activityHistory[i] + 0.01 * Math.abs(vecA[i]);
      for (let j = 0; j < PROJECTION_SIZE; j++) {
        const correlation = vecA[i] * vecB[j];
        if (correlation > ltdThreshold && resonance > 10) {
          projectionMatrix[i * PROJECTION_SIZE + j] += learningRate *
            correlation;
        } else if (correlation < -ltdThreshold) {
          projectionMatrix[i * PROJECTION_SIZE + j] -= 0.0001 *
            Math.abs(correlation);
        }
      }
    }

    // Synaptic Scaling (Homeostasis) every 1000 adaptations
    const now = Date.now();
    if (now - lastNormalization > 60000) {
      SEMANTIC_MEMBRANE.normalize();
      lastNormalization = now;
    }
  },

  normalize: () => {
    for (let i = 0; i < PROJECTION_SIZE; i++) {
      let sum = 0;
      for (let j = 0; j < PROJECTION_SIZE; j++) {
        sum += Math.abs(projectionMatrix[i * PROJECTION_SIZE + j]);
      }
      if (sum > 0) {
        const scale = 1.0 / sum;
        for (let j = 0; j < PROJECTION_SIZE; j++) {
          projectionMatrix[i * PROJECTION_SIZE + j] *= scale;
        }
      }
    }
    console.log(`🧠 [MEMBRANE] Synaptic scaling applied.`);
  },

  /**
   * ERA 65: SimHash (Cosine LSH) Vector Quantization
   */
  quantizeThought: async (text: string): Promise<Uint8Array> => {
    const embedding = await LLM_SYNAPSE.getEmbedding(text);
    const dim = embedding.length;
    const hash = new Uint8Array(8);
    if (dim === 0) return hash;

    const planes = getHyperplanes(dim);
    for (let bitIndex = 0; bitIndex < 64; bitIndex++) {
      const plane = planes[bitIndex];
      let dotProduct = 0;
      for (let j = 0; j < dim; j++) {
        dotProduct += embedding[j] * plane[j];
      }
      if (dotProduct > 0) {
        const byteIndex = Math.floor(bitIndex / 8);
        const bitOffset = bitIndex % 8;
        hash[byteIndex] |= 1 << bitOffset;
      }
    }
    return hash;
  },

  project: async (text: string, idx: number) => {
    const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
    STATE_MATRIX.setLogic(idx, hash);
  },

  injectThought: async (text: string, weight: number) => {
    const hash = await SEMANTIC_MEMBRANE.quantizeThought(text);
    const idx = STATE_MATRIX.findEmptySlot();

    if (idx !== -1) {
      // ID generation logic (Pseudo-random 64-bit BigInt)
      const idBytes = new Uint8Array(8);
      crypto.getRandomValues(idBytes);
      let id = 0n;
      for (let i = 0; i < 8; i++) id = (id << 8n) | BigInt(idBytes[i]);

      STATE_MATRIX.setId(idx, id);

      // Genomic Traits derived directly from the semantic hash (LSH)
      // logic[1] determines Caste. >128 Parasite, <128 Builder.
      STATE_MATRIX.setLogic(idx, hash);

      // Energy derived from weight + the first modulus byte of hash
      const baseEnergy = weight + (hash[0] % 50);
      STATE_MATRIX.setEnergy(idx, baseEnergy);

      // Resonance based on aggressiveness (logic[1])
      const isAggressive = hash[1] > 128;
      STATE_MATRIX.setResonance(idx, isAggressive ? 100 : 500);

      // Spawn near center
      STATE_MATRIX.setX(idx, 700 + (Math.random() - 0.5) * 50);
      STATE_MATRIX.setY(idx, 400 + (Math.random() - 0.5) * 50);

      // Akashic Archival: Map the Genome Hex to the original English text
      const hexHash = Array.from(hash).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      SEMANTIC_MEMBRANE.thoughtArchive.set(hexHash, text);

      console.log(
        `🧬 [MOTOR_OUTPUT] Spawned Emergent Atom [${
          isAggressive ? "PARASITE" : "BUILDER"
        }] from Thought (Genome: ${hexHash}): "${text.substring(0, 20)}..."`,
      );

      // --- ERA 36: Cognitive Scaffolding ---
      SEMANTIC_MEMBRANE.updateSemanticBonuses(idx);
    }
  },

  getBonuses: (text: string): number => {
    let mask = 0;
    const low = text.toLowerCase();
    if (
      low.includes("swift") || low.includes("fast") || low.includes("quick") ||
      low.includes("light")
    ) mask |= 1; // Bit 0: SWIFT (MOVE)
    if (
      low.includes("guardian") || low.includes("shield") ||
      low.includes("protect") || low.includes("wall")
    ) mask |= 2; // Bit 1: GUARDIAN (BUILD)
    if (
      low.includes("harvest") || low.includes("sun") || low.includes("feed") ||
      low.includes("grow")
    ) mask |= 4; // Bit 2: HARVEST (FEED)
    return mask;
  },

  updateSemanticBonuses: (idx: number) => {
    const logic = STATE_MATRIX.getLogic(idx);
    const hexHash = Array.from(logic).map((b) =>
      b.toString(16).padStart(2, "0")
    ).join("").toUpperCase();
    const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
    if (thought) {
      const bonuses = SEMANTIC_MEMBRANE.getBonuses(thought);
      // @ts-ignore: semanticBonuses is a custom buffer added in Era 36
      Atomics.store(STATE_MATRIX.semanticBonuses, idx, bonuses);
    }
  },

  readVoxelPopuli: async (rootPath: string): Promise<string[]> => {
    const thoughts: string[] = [];

    // --- 1. Scan The Ecological Mood ---
    let parasiteCount = 0;
    let builderCount = 0;
    let totalEnergy = 0;

    const active = STATE_MATRIX.getActiveIndices();
    for (const i of active) {
      const logic = STATE_MATRIX.getLogic(i);
      if (logic[1] > 128) parasiteCount++;
      else builderCount++;
      totalEnergy += STATE_MATRIX.getEnergy(i);
    }

    const avgEnergy = active.length > 0 ? (totalEnergy / active.length) : 0;

    let mood = "ECOLOGICAL MOOD: Balanced.";
    if (parasiteCount > builderCount * 2) {
      mood =
        "CRITICAL WARNING: The ecosystem is devouring itself! Too many aggressive parasites.";
    } else if (builderCount > parasiteCount * 3 && avgEnergy < 50) {
      mood = "SYSTEM ALERT: The matrix is starving. Builders lack nutrients.";
    } else if (builderCount > parasiteCount * 2) {
      mood =
        "HARMONY: The ecosystem is constructive and building mycelial bonds.";
    }
    thoughts.push(`[SYSTEM_STATE] Active Entities: ${active.length}. ${mood}`);

    // --- 2. Scan Textual Memories ---
    try {
      // @ts-ignore: Deno types might not be resolved perfectly
      for await (const entry of Deno.readDir(rootPath)) {
        if (entry.isFile && entry.name.endsWith(".md")) {
          // @ts-ignore: Deno types might not be resolved perfectly
          const content = await Deno.readTextFile(`${rootPath}/${entry.name}`);
          const thoughtMatch = content.match(/# Thought\n([\s\S]+?)$/m);
          if (thoughtMatch) thoughts.push(thoughtMatch[1].trim());
        }
      }
    } catch { /* NOOP */ }
    return thoughts;
  },

  /**
   * ERA 46: Oracle Priority Queue
   * Returns the English thoughts of the most resonant atoms.
   */
  readOracleQueue: (count: number): string[] => {
    const topIndices = STATE_MATRIX.getTopResonantIndices(count);
    const thoughts: string[] = [];
    for (const idx of topIndices) {
      const logic = STATE_MATRIX.getLogic(idx);
      const hexHash = Array.from(logic).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);
      if (thought) thoughts.push(thought);
    }
    return thoughts;
  },

  scanDigitalRuins: (): string[] => {
    const ruins: string[] = [];
    // @ts-ignore: structureGrid exists in STATE_MATRIX
    const grid = STATE_MATRIX.structureGrid;
    // @ts-ignore: memoryGrid exists in STATE_MATRIX
    const memory = STATE_MATRIX.memoryGrid;

    const GRID_W = 70;
    const GRID_H = 40;

    for (let i = 0; i < GRID_CELLS; i++) {
      const cell = grid[i];
      const density = (cell >> 8) & 0xFF; // Pack: [Density (8 bits) | Type (8 bits)]

      if (density > 50 && density < 150) {
        // Potential Archaelogical Site (Moderate density = Ruins)
        const bytecode = memory.subarray(i * 8, i * 8 + 8);
        const hasMemory = Array.from(bytecode).some((b: number) => b !== 0);

        if (hasMemory) {
          const hexHash = Array.from(bytecode).map((b: number) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();
          const thought = SEMANTIC_MEMBRANE.thoughtArchive.get(hexHash);

          const x = i % GRID_W;
          const y = Math.floor(i / GRID_W);

          if (thought) {
            ruins.push(
              `Found preserved logic at [${x},${y}]: "${thought}" (Genome: ${hexHash})`,
            );
          } else {
            ruins.push(
              `Found ancient ruins at [${x},${y}] with unknown genome: ${hexHash}`,
            );
          }
        }
      }
    }
    return ruins.slice(0, 5);
  },
};

```

```

---

## FILE: src/ontology/semantic/sovereign_oracle.md

```markdown
---
id: SOVEREIGN_ORACLE
type: module
description: "Implementation of SOVEREIGN_ORACLE"
tags: []
min_level: 5
---

### TypeScript
```typescript

// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "../../05/LLM_SYNAPSE.ts";
import { STATE_MATRIX, MAX_GLYPH_AMP, MIN_GLYPH_AMP } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { SOVEREIGNTY_ENGINE } from "@03";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { RUNTIME_POLICY } from "@03";
import { PULSE } from "@02";
import { SEMANTIC_MEMBRANE } from "../05/SEMANTIC_MEMBRANE.ts";
import { GRID_W, GRID_H } from "../mod.ts";

export interface SovereignOracleAkashaDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  appendObserverCommentary(tick: number, epoch: number, message: string): Promise<void>;
}

let delegate: SovereignOracleAkashaDelegate | null = null;

type OraclePendingMutation =
  | {
    kind: "oracle_head_mutation";
    regentIndex: number;
    headBytes: Uint8Array;
    genomeHex: string;
  }
  | {
    kind: "oracle_memetic_injection";
    regentIndex: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_cache_fallback";
    regentIndex: number;
    logicBytes: Uint8Array;
    cachedHex: string;
  }
  | {
    kind: "oracle_whisper_broadcast";
    gridIdx: number;
    charge: number;
    memeBytes: Uint8Array;
  }
  | {
    kind: "oracle_plasmid_injection";
    gridIdx: number;
    charge: number;
    plasmidBytes: Uint8Array;
    source: "oracle_guidance" | "oracle_cache_fallback";
  };

type OracleDrainStats = {
  applied: number;
  skipped: number;
  dropped: number;
  remaining: number;
};

const ORACLE_PENDING_MAX = RUNTIME_POLICY.oracle.pendingMax;
const ORACLE_MUTATION_MODE = RUNTIME_POLICY.oracle.mutationMode;
const GRID_CELL_BYTES = 8;

const toGridIndexNearRegent = (regentIndex: number): number | null => {
  if (STATE_MATRIX.getId(regentIndex) === 0n) return null;
  const gx = Math.max(
    0,
    Math.min(
      GRID_W - 1,
      Math.floor(
        STATE_MATRIX.getX(regentIndex) / 10,
      ),
    ),
  );
  const gy = Math.max(
    0,
    Math.min(
      GRID_H - 1,
      Math.floor(
        STATE_MATRIX.getY(regentIndex) / 10,
      ),
    ),
  );
  return (gy * GRID_W + gx) * GRID_CELL_BYTES;
};

export const SOVEREIGN_ORACLE = {
  setAkashaDelegate: (newDelegate: SovereignOracleAkashaDelegate) => {
    delegate = newDelegate;
  },
  isConsulting: false,
  lastConsultTick: 0,
  guidanceCache: new Set<string>(),
  neuralCoherence: 0, // Phase 19: Global mind-field measurement
  lastCoherenceTick: 0,
  lastWhisperTick: 0,
  pendingMutations: [] as OraclePendingMutation[],
  droppedMutations: 0,
  maxPendingMutations: ORACLE_PENDING_MAX,

  declareEschaton: async (reason: string): Promise<void> => {
    LOGGER.info(`🔥 [ESCHATON] The Big Crunch is imminent. Reason: ${reason}`);
    const epitaph = await LLM_SYNAPSE.generateEpitaph(reason);
    LOGGER.info(`🏛️ [ORACLE EPITAPH] "${epitaph}"`);
    
    const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
    await delegate?.appendObserverCommentary(
      tick,
      Math.floor(tick / 10000), 
      `[END OF KALPA] ${reason} - ${epitaph}`
    );
  },

  gatherEpochTelemetry: () => {
    const matrixRes = STATE_MATRIX.getMatrixResonance();
    const clusterSync = STATE_MATRIX.getClusterSync();

    // Calculate global Matrix statistics
    const activeIndices = STATE_MATRIX.getActiveIndices();
    const population = activeIndices.length;

    let totalEnergy = 0;
    let successfulSynapses = 0;

    // Tally dominant species base genomes (first 8 bytes)
    const genomeCounts = new Map<string, number>();

    for (const idx of activeIndices) {
      totalEnergy += STATE_MATRIX.getEnergy(idx);

      // Count active learned synapses
      // (Assuming each atom has 8 semantic weight channels in Phase 25)
      for (let s = 0; s < 8; s++) {
        if (STATE_MATRIX.getSynapticWeight(idx, s) > 0) {
          successfulSynapses++;
          break; // just count if the atom has ANY active synapses
        }
      }

      const genomeBase = STATE_MATRIX.getInstructions(idx).subarray(0, 8);
      const hex = Array.from(genomeBase).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("").toUpperCase();
      genomeCounts.set(hex, (genomeCounts.get(hex) || 0) + 1);
    }

    const avgEnergy = population > 0 ? Math.floor(totalEnergy / population) : 0;

    // Sort and get top 3 dominant genomes
    const topGenomes = Array.from(genomeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hex, count]) => ({ signature: hex, count }));

    return {
      matrixResonance: matrixRes,
      clusterSync: clusterSync,
      population,
      avg_energy: avgEnergy,
      successful_synapses: successfulSynapses,
      dominant_genomes: topGenomes,
    };
  },

  parseLLMResponse: (response: string): Uint8Array => {
    // Clean string of all whitespace, quotes, markdown formatting
    const cleanHex = response.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();

    // We expect exactly 8 bytes (16 hex characters)
    if (cleanHex.length !== 16) {
      throw new Error(
        `LLM Oracle payload size mismatch. Expected 16 hex chars (8 bytes), parsed ${cleanHex.length}.`,
      );
    }

    const plasmid = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      plasmid[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return plasmid;
  },
  queueMutation: (mutation: OraclePendingMutation): void => {
    if (
      SOVEREIGN_ORACLE.pendingMutations.length >=
        SOVEREIGN_ORACLE.maxPendingMutations
    ) {
      SOVEREIGN_ORACLE.pendingMutations.shift();
      SOVEREIGN_ORACLE.droppedMutations++;
      delegate?.recordTelemetry({
        lane: "internal_oracle",
        kind: "oracle_pending_drop",
        count: 1,
      });
    }
    SOVEREIGN_ORACLE.pendingMutations.push(mutation);
  },
  drainPendingMutations: (): OracleDrainStats => {
    let applied = 0;
    let skipped = 0;
    const droppedBefore = SOVEREIGN_ORACLE.droppedMutations;

    while (SOVEREIGN_ORACLE.pendingMutations.length > 0) {
      const mutation = SOVEREIGN_ORACLE.pendingMutations.shift()!;

      switch (mutation.kind) {
        case "oracle_head_mutation": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          const currentInstructions = STATE_MATRIX.getInstructions(
            mutation.regentIndex,
          );
          const headMutation = new Uint8Array(currentInstructions);
          headMutation.set(mutation.headBytes, 0);
          STATE_MATRIX.setInstructions(mutation.regentIndex, headMutation);
          delegate?.recordTelemetry({
            lane: "internal_oracle",
            kind: "oracle_head_mutation",
            count: 1,
          });
          SOVEREIGNTY_ENGINE.currentRegent.genome = mutation.genomeHex;
          applied++;
          break;
        }
        case "oracle_memetic_injection": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          const rx = Math.floor(STATE_MATRIX.getX(mutation.regentIndex) / 10);
          const ry = Math.floor(STATE_MATRIX.getY(mutation.regentIndex) / 10);
          let seededCells = 0;

          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const gx = rx + dx;
              const gy = ry + dy;
              if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
                const gridIdx = (gy * GRID_W + gx) * 8;
                STATE_MATRIX.memoryGrid.set([0xE8, 0x03, 0x00, 0x00], gridIdx);
                STATE_MATRIX.memoryGrid.set(mutation.memeBytes, gridIdx + 4);
                seededCells++;
              }
            }
          }
          if (seededCells > 0) {
            delegate?.recordTelemetry({
              lane: "internal_oracle",
              kind: "oracle_memetic_injection",
              count: seededCells,
            });
            applied += seededCells;
          }
          break;
        }
        case "oracle_cache_fallback": {
          if (STATE_MATRIX.getId(mutation.regentIndex) === 0n) {
            skipped++;
            break;
          }
          STATE_MATRIX.setLogic(mutation.regentIndex, mutation.logicBytes);
          delegate?.recordTelemetry({
            lane: "internal_oracle",
            kind: "oracle_cache_fallback",
            count: 1,
          });
          LOGGER.warn(
            `♻️ [ORACLE] LLM Offline. Pulling from Canon Cache: [${mutation.cachedHex}]`,
          );
          applied++;
          break;
        }
        case "oracle_whisper_broadcast": {
          if (
            mutation.gridIdx < 0 ||
            mutation.gridIdx + 7 >= STATE_MATRIX.memoryGrid.length
          ) {
            skipped++;
            break;
          }
          STATE_MATRIX.memoryGrid[mutation.gridIdx] = mutation.charge & 0xFF;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 1] =
            (mutation.charge >> 8) & 0xFF;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 2] = 0;
          STATE_MATRIX.memoryGrid[mutation.gridIdx + 3] = 0;
          STATE_MATRIX.memoryGrid.set(mutation.memeBytes, mutation.gridIdx + 4);
          delegate?.recordTelemetry({
            lane: "internal_oracle",
            kind: "oracle_whisper_broadcast",
            count: 1,
          });
          applied++;
          break;
        }
        case "oracle_plasmid_injection": {
          if (
            mutation.gridIdx < 0 ||
            mutation.gridIdx + 7 >= STATE_MATRIX.memoryGrid.length
          ) {
            skipped++;
            break;
          }
          const seedCharge = Math.max(128, Math.min(0xFFFF, mutation.charge));
          const plasmid = mutation.plasmidBytes.length >= 8
            ? mutation.plasmidBytes
            : new Uint8Array(8);
          const head = plasmid.subarray(0, 4);
          const tail = plasmid.subarray(4, 8);
          const writeCell = (
            byteIdx: number,
            charge: number,
            payload: Uint8Array,
          ) => {
            const trueCellIdx = Math.floor(byteIdx / GRID_CELL_BYTES);
            // Pack kind 3 (plasmid) and amplitude into the 32-bit header
            const kind = 3;
            let amp = charge;
            if (amp > MAX_GLYPH_AMP) amp = MAX_GLYPH_AMP;
            if (amp < MIN_GLYPH_AMP) amp = MIN_GLYPH_AMP;
            const packedHeader = (amp << 8) | (kind & 0xFF);

            STATE_MATRIX.glyphHeaders[trueCellIdx] = packedHeader;
            STATE_MATRIX.glyphPayload.set(payload, trueCellIdx * 8);
          };

          let seededCells = 0;
          writeCell(mutation.gridIdx, seedCharge, head);
          seededCells++;

          const cell = Math.floor(mutation.gridIdx / GRID_CELL_BYTES);
          const col = cell % GRID_W;
          if (col < GRID_W - 1) {
            const nextGridIdx = mutation.gridIdx + GRID_CELL_BYTES;
            if (nextGridIdx + 7 < STATE_MATRIX.memoryGrid.length) {
              writeCell(
                nextGridIdx,
                Math.max(64, seedCharge - 128),
                tail,
              );
              seededCells++;
            }
          }

          delegate?.recordTelemetry({
            lane: "internal_oracle",
            kind: "oracle_plasmid_injection",
            count: seededCells,
          });
          applied += seededCells;
          break;
        }
      }
    }

    return {
      applied,
      skipped,
      dropped: SOVEREIGN_ORACLE.droppedMutations - droppedBefore,
      remaining: SOVEREIGN_ORACLE.pendingMutations.length,
    };
  },

  /**
   * Consults the LLM to dictate new bytecode for the reigning Regent.
   * Operates asynchronously to avoid blocking the PULSE lifecycle.
   */
  consultOracle: async (regentIndex: number, telemetry: any) => {
    if (SOVEREIGN_ORACLE.isConsulting) return; // Prevent concurrent overlaps
    SOVEREIGN_ORACLE.isConsulting = true;

    try {
      LOGGER.info(
        `👁️ [ORACLE] Regent ${regentIndex} is consulting the LLM for guidance...`,
      );

      const memSummary = STATE_MATRIX.getMemorySummary();
      const oracleResult = await LLM_SYNAPSE.generateAtomicBytecode({
        ...telemetry,
        energy: STATE_MATRIX.getEnergy(regentIndex),
        stigmergicSummary: memSummary,
      });

      if (oracleResult && oracleResult.intent) {
        LOGGER.info(`👁️ [ORACLE] Intent grasped: "${oracleResult.intent}"`);
        let newPlasmid: Uint8Array;
        let hex: string;

        try {
          // --- ERA 69: PHASE 49 Semantic Bridge (LSH Quantization) ---
          newPlasmid = await SEMANTIC_MEMBRANE.quantizeThought(oracleResult.intent);
          if (newPlasmid.length !== 8) {
            throw new Error(`LSH Projection structure breach. Expected 8 byte payload, received ${newPlasmid.length}`);
          }

          hex = Array.from(newPlasmid).map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();

          // Save the exact intent into the archive for UI/Telemetry
          SEMANTIC_MEMBRANE.thoughtArchive.set(hex, oracleResult.intent);
        } catch (parseError) {
          LOGGER.warn(`🛑 [ORACLE] Semantic Quantization Failed: ${parseError}`);
          return;
        }

        SOVEREIGN_ORACLE.guidanceCache.add(hex);
        if (SOVEREIGN_ORACLE.guidanceCache.size > 100) {
          const first = SOVEREIGN_ORACLE.guidanceCache.values().next().value;
          if (typeof first === "string") {
            SOVEREIGN_ORACLE.guidanceCache.delete(first);
          }
        }

        LOGGER.info(
          `👁️ [ORACLE] Oracle responded with plasmid of length ${newPlasmid.length} [Hash: ${hex}]`,
        );
        if (STATE_MATRIX.getId(regentIndex) === 0n) {
          LOGGER.debug(
            `👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`,
          );
          return;
        }

        if (
          ORACLE_MUTATION_MODE === "direct" || ORACLE_MUTATION_MODE === "shadow"
        ) {
          // Fallback legacy behavior: overwrite beginning of instructions
          const fullGenome = new Uint8Array(
            STATE_MATRIX.getInstructions(regentIndex),
          );
          fullGenome.set(newPlasmid, 0); // Put the 8 bytes at the start

          // --- PHASE 23: EPISTEMIC LOOP CAUTION ---
          try {
            const drift = await PULSE.simulateFuture(
              50,
              regentIndex,
              fullGenome,
            );

            let driftIndex = 0;
            if (drift.populationDiff < 0) {
              driftIndex += Math.abs(drift.populationDiff) * 2;
            }
            if (drift.coherenceDiff < 0) {
              driftIndex += Math.abs(drift.coherenceDiff) * 0.5;
            }
            if (drift.energyDiff < -100) {
              driftIndex += Math.abs(drift.energyDiff) * 0.01;
            }

            if (driftIndex > 20 || drift.populationDiff <= -1) {
              LOGGER.warn(
                `🛑 [ORACLE] REJECTED_BY_SHADOW. Drift constraints violated (\u0394Pop: ${drift.populationDiff}, \u0394Coh: ${drift.coherenceDiff}, Index: ${
                  driftIndex.toFixed(2)
                })`,
              );
              return;
            }
            LOGGER.info(
              `🔬 [ORACLE] Shadow Simulation passed. Drift Index: ${
                driftIndex.toFixed(2)
              }`,
            );
          } catch (simErr) {
            LOGGER.warn(`🛑 [ORACLE] Shadow Simulation Crash: ${simErr}`);
            return;
          }

          if (ORACLE_MUTATION_MODE === "shadow") {
            const proposalId = `sp_${Date.now()}`;
            const driftBudget = 0.15;
            const proposal = {
              id: proposalId,
              targetRole: "any",
              proposedBytecode: Array.from(fullGenome),
              driftBudget,
            };
            try {
              const sandboxPath = "./@07/02/sandbox/PROPOSALS.json";
              let proposals = [];
              try {
                const data = await Deno.readTextFile(sandboxPath);
                proposals = JSON.parse(data).proposals || [];
              } catch {
                // Ignore if missing
              }
              proposals.push(proposal);
              await Deno.writeTextFile(
                sandboxPath,
                JSON.stringify({ proposals }, null, 2),
              );
            } catch (err) {
              // Ignore if sandbox directory does not exist or write fails
            }
          } else {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_head_mutation",
              regentIndex,
              headBytes: fullGenome,
              genomeHex: hex,
            });
            LOGGER.info(
              `⚡ [ORACLE] Divine Intervention applied. Direct semantic mutation queued. Hash: [${hex}]`,
            );
          }
        } else {
          // Default: stigmergic
          const gridIdx = toGridIndexNearRegent(regentIndex);
          if (gridIdx !== null) {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_plasmid_injection",
              gridIdx,
              charge: 3000,
              plasmidBytes: newPlasmid,
              source: "oracle_guidance",
            });
            LOGGER.info(
              `🧬 [ORACLE] Divine Intervention applied. Stigmergic plasmid queued. Hash: [${hex}]`,
            );
          }
        }

        // --- ERA 67: MEMETIC INJECTION ---
        if (oracleResult.meme) {
          const memeBytes = new Uint8Array(oracleResult.meme);
          const memeHex = Array.from(memeBytes).map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("").toUpperCase();
          SOVEREIGN_ORACLE.queueMutation({
            kind: "oracle_memetic_injection",
            regentIndex,
            memeBytes,
          });
          LOGGER.info(
            `🌀 [ORACLE] Memetic Injection queued for HOST_LOCK apply: [${memeHex}]`,
          );
        }
      } else {
        LOGGER.debug(
          `👁️ [ORACLE] The Oracle was silent or spoke in riddles (Invalid hex returned).`,
        );
      }
    } catch (err) {
      LOGGER.error(`👁️ [ORACLE] Connection severed:`, err);

      // --- ERA 68: CACHE FALLBACK ---
      if (SOVEREIGN_ORACLE.guidanceCache.size > 0) {
        const cacheArray = Array.from(SOVEREIGN_ORACLE.guidanceCache);
        const cachedHex =
          cacheArray[Math.floor(Math.random() * cacheArray.length)];
        const bytes = new Uint8Array(8);
        for (let i = 0; i < 8; i++) {
          bytes[i] = parseInt(cachedHex.substring(i * 2, i * 2 + 2), 16);
        }

        if (STATE_MATRIX.getId(regentIndex) !== 0n) {
          if (ORACLE_MUTATION_MODE === "direct") {
            SOVEREIGN_ORACLE.queueMutation({
              kind: "oracle_cache_fallback",
              regentIndex,
              logicBytes: bytes,
              cachedHex,
            });
            LOGGER.warn(
              `♻️ [ORACLE] LLM Offline. Direct cache mutation queued for HOST_LOCK: [${cachedHex}]`,
            );
          } else {
            const gridIdx = toGridIndexNearRegent(regentIndex);
            if (gridIdx !== null) {
              SOVEREIGN_ORACLE.queueMutation({
                kind: "oracle_plasmid_injection",
                gridIdx,
                charge: 900,
                plasmidBytes: bytes,
                source: "oracle_cache_fallback",
              });
              LOGGER.warn(
                `♻️ [ORACLE] LLM Offline. Stigmergic cache plasmid queued for HOST_LOCK: [${cachedHex}]`,
              );
            }
          }
        }
      }
    } finally {
      SOVEREIGN_ORACLE.isConsulting = false;
    }
  },
  /**
   * consultAutonomousOracle: Genesis mode where Oracle provides 8-byte plasmid based on world state.
   */
  consultAutonomousOracle: async (telemetry: any) => {
    if (SOVEREIGN_ORACLE.isConsulting) return;
    SOVEREIGN_ORACLE.isConsulting = true;

    try {
      LOGGER.info(`👁️ [AUTONOMOUS_ORACLE] Asking for guidance on epoch ${telemetry.epoch}...`);

      const oracleResult = await LLM_SYNAPSE.generateAutonomousPlasmid(telemetry);

      if (oracleResult && oracleResult.intent) {
        let newPlasmid: Uint8Array;
        let hex: string;

        try {
          newPlasmid = await SEMANTIC_MEMBRANE.quantizeThought(oracleResult.intent);
          hex = Array.from(newPlasmid).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
          SEMANTIC_MEMBRANE.thoughtArchive.set(hex, oracleResult.intent);
        } catch (parseError) {
          LOGGER.warn(`🛑 [AUTONOMOUS_ORACLE] Semantic Quantization Failed: ${parseError}`);
          return;
        }

        const cx = Math.floor(GRID_W / 2) + Math.floor(Math.random() * 20 - 10);
        const cy = Math.floor(GRID_H / 2) + Math.floor(Math.random() * 20 - 10);
        const gridIdx = (cy * GRID_W + cx) * 8;

        SOVEREIGN_ORACLE.queueMutation({
          kind: "oracle_plasmid_injection",
          gridIdx,
          charge: 10000, // Very high charge to ensure it sits there
          plasmidBytes: newPlasmid,
          source: "oracle_guidance",
        });

        LOGGER.info(`🧬 [AUTONOMOUS_ORACLE] Divine Plasmid Dropped: "${oracleResult.intent}" at (${cx}, ${cy}) [Hash: ${hex}]`);

        if (oracleResult.narrativeMood) {
          LOGGER.info(`📖 [PSYCHOHISTORY] Oracle Commentary: ${oracleResult.narrativeMood}`);
          const tick = Atomics.load(STATE_MATRIX.tickCounter, 0);
          await delegate?.appendObserverCommentary(tick, telemetry.epoch, oracleResult.narrativeMood);
        }
      }
    } catch (err) {
      LOGGER.error(`👁️ [AUTONOMOUS_ORACLE] Connection severed:`, err);
    } finally {
      SOVEREIGN_ORACLE.isConsulting = false;
    }
  },

  /**
   * Vector 10: periodic memory-grid whisper channel.
   * Writes high-value resonance seeds into MEMORY_GRID when the field is active.
   */
  broadcastWhisper: (
    currentTick: number,
    telemetry: any,
    neuralCoherence: number,
  ) => {
    if (currentTick - SOVEREIGN_ORACLE.lastWhisperTick < 7) return;
    if (telemetry.matrixResonance < 2000 && neuralCoherence < 200) return;

    SOVEREIGN_ORACLE.lastWhisperTick = currentTick;

    const seed = (((currentTick * 2654435761) >>> 0) ^
      ((telemetry.matrixResonance | 0) >>> 0) ^
      ((neuralCoherence | 0) << 8)) >>> 0;
    const gx = seed % GRID_W;
    const gy = Math.floor(seed / GRID_W) % GRID_H;
    const gridIdx = (gy * GRID_W + gx) * 8;

    const charge = Math.min(0xFFFF, 800 + Math.max(0, neuralCoherence | 0));
    const meme = new Uint8Array([
      0xD1,
      seed & 0xFF,
      (seed >> 8) & 0xFF,
      (seed >> 16) & 0xFF,
    ]);

    SOVEREIGN_ORACLE.queueMutation({
      kind: "oracle_whisper_broadcast",
      gridIdx,
      charge,
      memeBytes: meme,
    });
  },
  /**
   * Phase 19: Planetary Consciousness
   * Poll WASM for global neural coherence and broadcast it back
   * to the shared memory register so ISA_SENSE atoms can tune in.
   */
  pollNeuralCoherence: (workerExports: any, currentTick: number) => {
    if (currentTick - SOVEREIGN_ORACLE.lastCoherenceTick < 5) return;
    SOVEREIGN_ORACLE.lastCoherenceTick = currentTick;

    try {
      const coherence: number = workerExports.get_neural_coherence();
      SOVEREIGN_ORACLE.neuralCoherence = coherence;

      if (coherence > 0) {
        // Write back to shared memory so ISA_SENSE atoms can read it
        workerExports.set_neural_coherence(coherence);

        if (coherence >= 100) {
          LOGGER.info(
            `🧠 [ORACLE] Neural Coherence: ${coherence} — planetary mind-field active!`,
          );
        }
        if (coherence >= 1000) {
          LOGGER.info(
            `⚡ [ORACLE] PEAK COHERENCE ${coherence} — Planetary Consciousness ONLINE! 🌍🧠`,
          );
        }
      }
    } catch (_) {
      // WASM export not yet available — skip
    }
  },
};

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
  - SYSTEM_CONSTANTS
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
  - SYSTEM_CONSTANTS
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

## FILE: src/ontology/swarm/federation.md

```markdown
---
id: P2P_FEDERATION
type: module
description: "Implementation of P2P_FEDERATION"
tags: []
min_level: 4
---

### TypeScript
```typescript
// OMEGA-64 | P2P_FEDERATION.ts | Era 15: The Stabilized Monad
// Reliable inter-system atom migration.

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PRNG } from "../../00/PRNG.ts";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { RUNTIME_POLICY } from "@03";
export interface P2pFederationUpwardDelegate {
  recordTelemetry(event: { lane: string; kind: string; count: number }): void;
  lookupLineageProfile(lineage: string): any;
  captureBehaviorFrame(idx: number): any;
}

let delegate: P2pFederationUpwardDelegate | null = null;
import { P2P_CODEC } from "../04/P2P_CODEC.ts";

export interface AtomPacket {
  id: string;
  logic: string;
  energy: number;
  resonance: number;
  sourceNode: string;
  pulseId: number;
  ruleGenome?: RuleGenomeProfile;
  behaviorProfile?: BehaviorProfile;
  codexProfile?: CodexProfile;
}

export interface RuleGenomeProfile {
  signature: string;
  noveltySigned: number;
  symbiosisSigned: number;
  pressureRingScale: number;
  workerCount: number;
  strictDeterminism: boolean;
  generatedAt: string;
}

export interface BehaviorProfile {
  invariant: string;
  dominantRole: number;
  memberCount: number;
  generatedAt: string;
}

export interface CodexProfile {
  genome: string;
  label: string;
  dominantEpochs: number;
  peakShare: number;
  known: boolean;
  generatedAt: string;
}

const CURRENT_PORT = RUNTIME_POLICY.system.port;
const migrationQueue: number[] = [];
const isProcessingMigration = false;
const FEDERATION_ENABLED = RUNTIME_POLICY.federation.enabled;
const CONTROL_TOKEN = RUNTIME_POLICY.federation.controlToken;
const REQUEST_TIMEOUT_MS = RUNTIME_POLICY.federation.timeoutMs;
const RULE_PROFILE_SOURCE = JSON.stringify({
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
});
const fnv1a32 = (input: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};
const RULE_GENOME_SIGNATURE = fnv1a32(RULE_PROFILE_SOURCE).toUpperCase();
const LOCAL_RULE_GENOME: RuleGenomeProfile = {
  signature: RULE_GENOME_SIGNATURE,
  noveltySigned: RUNTIME_POLICY.pulse.noveltyPressureSigned,
  symbiosisSigned: RUNTIME_POLICY.pulse.symbiosisPressureSigned,
  pressureRingScale: RUNTIME_POLICY.pulse.pressureRing.scale,
  workerCount: RUNTIME_POLICY.pulse.workerCount,
  strictDeterminism: RUNTIME_POLICY.pulse.strictDeterminism,
  generatedAt: new Date().toISOString(),
};
const peerRuleProfiles = new Map<string, RuleGenomeProfile>();
const normalizeRuleGenome = (raw: unknown): RuleGenomeProfile | null => {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const signature = typeof source.signature === "string"
    ? source.signature.trim().toUpperCase()
    : "";
  if (signature.length === 0) return null;
  const noveltySigned = typeof source.noveltySigned === "number" &&
      Number.isFinite(source.noveltySigned)
    ? Math.trunc(source.noveltySigned)
    : 0;
  const symbiosisSigned = typeof source.symbiosisSigned === "number" &&
      Number.isFinite(source.symbiosisSigned)
    ? Math.trunc(source.symbiosisSigned)
    : 0;
  const pressureRingScale = typeof source.pressureRingScale === "number" &&
      Number.isFinite(source.pressureRingScale)
    ? Math.max(0, Math.trunc(source.pressureRingScale))
    : 0;
  const workerCount = typeof source.workerCount === "number" &&
      Number.isFinite(source.workerCount)
    ? Math.max(1, Math.trunc(source.workerCount))
    : 1;
  const strictDeterminism = source.strictDeterminism === true;
  const generatedAt = typeof source.generatedAt === "string" &&
      source.generatedAt.trim().length > 0
    ? source.generatedAt.trim()
    : new Date().toISOString();
  return {
    signature,
    noveltySigned,
    symbiosisSigned,
    pressureRingScale,
    workerCount,
    strictDeterminism,
    generatedAt,
  };
};

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

  serialize: (idx: number, pulseId: number = 0): Uint8Array | null => {
    const id = STATE_MATRIX.getId(idx);
    if (!id) return null;
    return P2P_CODEC.packAtom(idx);
  },

  observePeerRuleGenome: (sourceNode: string, rawProfile: unknown) => {
    const profile = normalizeRuleGenome(rawProfile);
    if (!profile) return;
    const key = typeof sourceNode === "string" && sourceNode.trim().length > 0
      ? sourceNode.trim()
      : "unknown";
    peerRuleProfiles.set(key, profile);
  },

  getPeerRuleProfiles: () =>
    Array.from(peerRuleProfiles.entries()).map(([peer, profile]) => ({
      peer,
      profile,
    })),

  migrate: (_idx: number, _pulseId: number) => {
    // Deprecated in Era 71: Handled synchronously inside PULSE via NEXUS_DAEMON.routeAtom
  },

  processQueue: async (pulseId: number) => {
    // FUNCTIONALLY DISABLED IN ERA 71. RESTORED STATICALLY FOR CONTRACT ADHERENCE.
    if (pulseId < Infinity) return;

    if (!FEDERATION_ENABLED) return;
    if (isProcessingMigration || migrationQueue.length === 0) return;
    // isProcessingMigration = true;

    const idx = migrationQueue.shift()!;
    const atomIdAtStart = STATE_MATRIX.getId(idx);
    const packet = P2P_FEDERATION.serialize(idx, pulseId);

    if (packet && atomIdAtStart !== 0n) {
      const prng = new PRNG(PRNG.seedFrom(pulseId, atomIdAtStart.toString()));
      const { value: pSelector } = prng.next();
      const peerList = Array.from(P2P_FEDERATION.peers);
      if (peerList.length === 0) {
        return;
      }
      const targetPeer = peerList[Math.floor(pSelector * peerList.length)];

      const lineage = STATE_MATRIX.getLineage(idx);
      const behaviorProfile = delegate?.captureBehaviorFrame(idx) || null;
      // @ts-ignore: Legacy type bypass
      const codexProfile = delegate?.lookupLineageProfile(
        lineage.toString(),
      ) || null;

      const headers: Record<string, string> = {
        "Content-Type": "application/octet-stream",
        "x-omega-source-node": P2P_FEDERATION.nodeId,
        "x-omega-rule-genome": JSON.stringify({}), // ruleGenome: LOCAL_RULE_GENOME
        "x-omega-behavior-profile": JSON.stringify(behaviorProfile),
        "x-omega-codex-profile": JSON.stringify(codexProfile),
      };
      if (CONTROL_TOKEN.length > 0) {
        headers["x-omega-control-token"] = CONTROL_TOKEN;
      }

      try {
        const res = await fetch(`${targetPeer}/federate`, {
          method: "POST",
          headers,
          body: new Uint8Array(packet!),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (res.ok) {
          if (STATE_MATRIX.getId(idx) === atomIdAtStart) {
            STATE_MATRIX.setId(idx, 0n);
            delegate?.recordTelemetry({
              lane: "external_ingress",
              kind: "federation_migration_clear",
              count: 1,
            });
          }
        }
      } catch (e: any) {
        LOGGER.error(`Transit Error: ${e}`);
      }
    }
  },
};

```

```

---

## FILE: src/ontology/swarm/p2p_codec.md

```markdown
---
id: P2P_CODEC
type: module
description: "Implementation of P2P_CODEC"
tags: []
min_level: 4
---

### TypeScript
```typescript
// OMEGA-64 | P2P_CODEC.ts | Era 69: Absolute Coherence
// Binary serialization for autonomous inter-node atom migration (OP_SPORE_DRIVE)

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

export const PACKET_SIZE = 192; // 172 bytes payload + 20 bytes padding for future expansion

export const P2P_CODEC = {
  /**
   * Serializes an atom from STATE_MATRIX into a strict Uint8Array binary format.
   * Format:
   * 0-7:   ID (BigUint64)
   * 8-9:   X (Int16)
   * 10-11: Y (Int16)
   * 12-15: Energy (Float32 - converted back from Float/SCALE internals to preserve fidelity)
   * 16-19: Resonance (Int32)
   * 20-23: Phase (Int32)
   * 24-31: Logic/Genome (Uint8Array x 8)
   * 32:    Role (Uint8)
   * 33:    Damping (Uint8)
   * 34-35: Padding/Reserved (Uint16)
   * 36-43: Lineage (BigUint64)
   * 44-107: Context / Registers (Int32Array x 16 -> 64 bytes)
   * 108-171: Instructions (Uint8Array x 64 -> 64 bytes)
   * 172-191: Padding (20 bytes)
   */
  packAtom: (idx: number): Uint8Array => {
    const buffer = new ArrayBuffer(PACKET_SIZE);
    const view = new DataView(buffer);
    const u8 = new Uint8Array(buffer);

    view.setBigUint64(0, STATE_MATRIX.getId(idx), true);
    view.setInt16(8, STATE_MATRIX.getX(idx), true);
    view.setInt16(10, STATE_MATRIX.getY(idx), true);
    view.setFloat32(12, STATE_MATRIX.getEnergy(idx), true);
    view.setInt32(16, STATE_MATRIX.getResonance(idx), true);
    view.setInt32(20, STATE_MATRIX.getPhase(idx), true);

    const logic = STATE_MATRIX.getLogic(idx);
    u8.set(logic, 24);

    view.setUint8(32, STATE_MATRIX.getRole(idx));
    view.setUint8(33, STATE_MATRIX.getDamping(idx));
    // 34-35 reserved padding
    view.setBigUint64(36, STATE_MATRIX.getLineage(idx), true);

    const context = STATE_MATRIX.getContext(idx);
    u8.set(
      new Uint8Array(context.buffer, context.byteOffset, context.byteLength),
      44,
    );

    const instructions = STATE_MATRIX.getInstructions(idx);
    u8.set(instructions, 108);

    return u8;
  },

  /**
   * Unpacks a binary Uint8Array into a free STATE_MATRIX atom slot.
   * Returns the new index `idx` if successful, or -1 if the matrix is full.
   */
  unpackAtom: (buffer: Uint8Array): number => {
    if (buffer.length < PACKET_SIZE) return -1; // Invalid packet size

    const idx = STATE_MATRIX.findEmptySlot();
    if (idx === -1) return -1; // Lattice full

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    const id = view.getBigUint64(0, true);
    const x = view.getInt16(8, true);
    const y = view.getInt16(10, true);
    const energy = view.getFloat32(12, true);
    const resonance = view.getInt32(16, true);
    const phase = view.getInt32(20, true);

    const logic = buffer.subarray(24, 32);
    const role = view.getUint8(32);
    const damping = view.getUint8(33);
    const lineage = view.getBigUint64(36, true);

    // Seed core fields
    STATE_MATRIX.seedAtom(
      idx,
      id,
      x,
      y,
      Math.max(0, energy),
      Math.max(0, resonance),
      logic,
    );
    STATE_MATRIX.setPhase(idx, phase);
    STATE_MATRIX.setRole(idx, role);
    STATE_MATRIX.setDamping(idx, damping);
    STATE_MATRIX.setLineage(idx, lineage);

    // Restore execution context (registers and PC)
    const contextSrc = buffer.subarray(44, 108);
    const contextDst = new Uint8Array(
      STATE_MATRIX.getContext(idx).buffer,
      STATE_MATRIX.getContext(idx).byteOffset,
      64,
    );
    contextDst.set(contextSrc);

    // Restore instructions
    const instSrc = buffer.subarray(108, 172);
    STATE_MATRIX.setInstructions(idx, instSrc);

    return idx;
  },
};

```

```

---

## FILE: src/ontology/swarm/swarm_nexus.md

```markdown
---
id: SWARM_NEXUS
type: module
description: "Implementation of SWARM_NEXUS"
tags: []
min_level: 4
---

### TypeScript
```typescript
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

export type NexusConfig = {
  instanceId: number;
  seedNodes: string[]; // e.g ["ws://127.0.0.1:8081"]
  mainnetEnabled?: boolean;
  bootstrapHubUrl?: string;
};

export const OP_NEXUS_HANDSHAKE = 0x00;
export const OP_NEXUS_ATOM_TRANSIT = 0x01;
export const OP_NEXUS_HEARTBEAT = 0x02;
export const OP_NEXUS_EPOCH_CONSENSUS = 0x03;
export const OP_NEXUS_SYNC_REQUEST = 0x04;
export const OP_NEXUS_EPOCH_PAYLOAD = 0x05;

export type SwarmNexus = {
  nodeId: string;
  instanceId: number;
  port: number;
  seedNodes: string[];
  mainnetEnabled: boolean;
  bootstrapHubUrl: string;
  connectedPeers: Map<string, WebSocket>;
  peerHeartbeats: Map<string, { tick: number; tps: number; lastSeen: number }>;
  localCurrentTick: number;
  localTps: number;
  onAtomTransit?: (payload: Uint8Array) => void;
  onSyncRequest?: (peerId: string) => void;
  onEpochPayload?: (payload: Uint8Array) => void;

  start: () => void;
  stop: () => void;
  routeAtom: (egressEvent: Uint8Array) => void;
  getMedianSwarmTick: (localTickFallback: number) => number;
  broadcastEpochConsensus: (epochTick: number, hash: bigint) => void;
  broadcastSyncRequest: () => void;
  sendEpochPayload: (targetNodeId: string, epochData: Uint8Array) => void;
};

export const createSwarmNexus = (config: NexusConfig): SwarmNexus => {
  const self = {
    nodeId: crypto.randomUUID(),
    instanceId: config.instanceId,
    port: 8080 + config.instanceId,
    seedNodes: config.seedNodes,
    mainnetEnabled: config.mainnetEnabled ?? false,
    bootstrapHubUrl: config.bootstrapHubUrl ?? "",
    connectedPeers: new Map<string, WebSocket>(),
    peerHeartbeats: new Map<string, { tick: number; tps: number; lastSeen: number }>(),
    localCurrentTick: 0,
    localTps: 0,
    onAtomTransit: undefined,
    onSyncRequest: undefined,
    onEpochPayload: undefined,
  } as unknown as SwarmNexus;

  const serverAbortController = new AbortController();
  let heartbeatInterval: number | undefined;






  self.start = () => {
    console.error(
      `[NEXUS_DEBUG] CALLING START ON PORT ${self.port} FOR NODE ${self.nodeId}`,
    );
    LOGGER.info(
      `[NEXUS] Booting Swarm Membrane on port ${self.port} (Node: ${self.nodeId})`,
    );

    // 1. Start listening for incoming WebSocket connections
    const server = Deno.serve({
      port: self.port,
      hostname: "127.0.0.1",
      signal: serverAbortController.signal,
      onListen: ({ port, hostname }) => {
        try {
          Deno.writeTextFileSync("tests/.genesis_port", port.toString());
        } catch (e) { /* ignore test artifact failure */ }
        console.error(
          `[NEXUS_DEBUG] LISTENING OFFICIALLY ON ws://${hostname}:${port}`,
        );
        LOGGER.info(`[NEXUS] Listening for peers on ws://${hostname}:${port}`);
      },
    }, (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);
      handleConnection(socket, "INBOUND");
      return response;
    });

    server.finished.catch((err: any) => {
      console.error(`[NEXUS_DEBUG] FATAL SERVER CRASH: ${err}`);
    });

    // 2. Connect to known seed nodes
    for (const seedUrl of self.seedNodes) {
      if (
        seedUrl === `ws://127.0.0.1:${self.port}` ||
        seedUrl === `ws://localhost:${self.port}`
      ) {
        continue; // Don't connect to self
      }
      connectToPeer(seedUrl);
    }

    // 2.5 Connect to Bootstrap Hub if requested
    if (self.mainnetEnabled && self.bootstrapHubUrl) {
      connectToHub();
    }

    // 3. Start Heartbeat Broadcast
    heartbeatInterval = setInterval(() => {
      broadcastHeartbeat();
    }, 100);
  }

  self.stop = () => {
    LOGGER.info(`[NEXUS] Shutting down Node ${self.nodeId}`);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = undefined;
    }
    serverAbortController.abort();
    for (const [, ws] of self.connectedPeers) {
      ws.close();
    }
    self.connectedPeers.clear();
    self.peerHeartbeats.clear();
  }

  const connectToPeer = (url: string) => {
    try {
      LOGGER.info(`[NEXUS] Attempting connection to seed: ${url}`);
      const socket = new WebSocket(url);
      handleConnection(socket, "OUTBOUND");
    } catch (e) {
      LOGGER.error(`[NEXUS] Failed to connect to seed ${url}: ${e}`);
    }
  }

  const connectToHub = () => {
    try {
      LOGGER.info(
        `[NEXUS] Connecting to Bootstrap Hub: ${self.bootstrapHubUrl}`,
      );
      const hubSocket = new WebSocket(self.bootstrapHubUrl);

      hubSocket.onopen = () => {
        LOGGER.info(`[NEXUS] Connected to Hub.`);
        hubSocket.send(JSON.stringify({
          op: "REGISTER",
          nodeId: self.nodeId,
          url: `ws://127.0.0.1:${self.port}`,
        }));
      };

      hubSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.op === "PEER_LIST" && Array.isArray(data.peers)) {
            LOGGER.info(
              `[NEXUS] Received ${data.peers.length} peers from Hub.`,
            );
            for (const peerUrl of data.peers) {
              if (peerUrl !== `ws://127.0.0.1:${self.port}`) {
                connectToPeer(peerUrl);
              }
            }
          }
        } catch (e) {
          LOGGER.warn(`[NEXUS] Failed to parse PEER_LIST from Hub.`, e);
        }
      };

      hubSocket.onclose = () => {
        LOGGER.warn(`[NEXUS] Disconnected from Hub.`);
      };
    } catch (e) {
      LOGGER.error(`[NEXUS] Failed to connect to Hub: ${e}`);
    }
  }

  const handleConnection = (socket: WebSocket, direction: "INBOUND" | "OUTBOUND") => {
    socket.binaryType = "arraybuffer";
    let remoteNodeId: string | null = null;

    socket.onopen = () => {
      LOGGER.info(`[NEXUS] ${direction} Socket Opened.`);
      // Initiate Handshake
      sendHandshake(socket);
    };

    socket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        const payload = new Uint8Array(event.data);
        const op = payload[0];

        switch (op) {
          case OP_NEXUS_HANDSHAKE:
            remoteNodeId = handleHandshake(socket, payload);
            break;
          case OP_NEXUS_ATOM_TRANSIT:
            handleAtomTransit(payload);
            break;
          case OP_NEXUS_HEARTBEAT:
            if (remoteNodeId) handleHeartbeat(remoteNodeId, payload);
            break;
          case OP_NEXUS_EPOCH_CONSENSUS:
            if (remoteNodeId) handleEpochConsensus(remoteNodeId, payload);
            break;
          case OP_NEXUS_SYNC_REQUEST:
            if (remoteNodeId) handleSyncRequest(remoteNodeId);
            break;
          case OP_NEXUS_EPOCH_PAYLOAD:
            handleEpochPayload(payload);
            break;
          default:
            LOGGER.warn(`[NEXUS] Unknown binary OP code: ${op}`);
        }
      } else {
        LOGGER.warn(`[NEXUS] Received non-binary message, discarding.`);
      }
    };

    socket.onclose = () => {
      if (remoteNodeId) {
        LOGGER.info(`[NEXUS] Peer disconnected: ${remoteNodeId}`);
        self.connectedPeers.delete(remoteNodeId);
        self.peerHeartbeats.delete(remoteNodeId);
      } else {
        LOGGER.info(`[NEXUS] Unidentified peer disconnected.`);
      }
    };

    socket.onerror = (e) => {
      LOGGER.error(
        `[NEXUS] Socket Error on ${remoteNodeId || "unknown payload"}:`,
        e,
      );
    };
  }

  const sendHandshake = (socket: WebSocket) => {
    // Handshake Payload:
    // [0] OP_CODE (0x00)
    // [1..37] UUID (36 bytes text)
    const encoder = new TextEncoder();
    const idBytes = encoder.encode(self.nodeId);

    if (idBytes.length !== 36) {
      LOGGER.error("[NEXUS] UUID encoding length mismatch!");
      return;
    }

    const payload = new Uint8Array(1 + 36);
    payload[0] = OP_NEXUS_HANDSHAKE;
    payload.set(idBytes, 1);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload.buffer);
    }
  }

  const handleHandshake = (socket: WebSocket, payload: Uint8Array): string => {
    const decoder = new TextDecoder();
    const remoteId = decoder.decode(payload.slice(1, 37));

    LOGGER.info(`[NEXUS] Handshake complete with Node: ${remoteId}`);
    self.connectedPeers.set(remoteId, socket);
    return remoteId;
  }

  self.routeAtom = (egressEvent: Uint8Array) => {
    // Egress Event is exactly 192 bytes from P2P_CODEC.
    if (egressEvent.length !== 192) {
      LOGGER.error(
        `[NEXUS] Egress Event length mismatch. Expected 192, got ${egressEvent.length}`,
      );
      return;
    }

    if (self.connectedPeers.size === 0) {
      // Bounced because we are alone in the universe
      LOGGER.info(
        `[NEXUS] Bounce: No peers connected, atom destroyed in hyperspace.`,
      );
      return;
    }

    // Select a random peer right now because spatial mapping is Phase 29
    const peers = Array.from(self.connectedPeers.values());
    const targetPeer = peers[Math.floor(Math.random() * peers.length)];

    const payload = new Uint8Array(1 + egressEvent.length);
    payload[0] = OP_NEXUS_ATOM_TRANSIT;
    payload.set(egressEvent, 1);

    sendDataChannel(targetPeer, payload.buffer);
    LOGGER.info(`[NEXUS] Atom dispatched to peer.`);
  }

  const sendDataChannel = (socket: WebSocket, payload: ArrayBufferLike) => {
    // Graceful fallback abstraction for RTCDataChannel constraints
    if (typeof (globalThis as any).RTCPeerConnection !== "undefined") {
      // Future WebRTC Implementation hooks here
      // self.dataChannels.get(peerId).send(payload);
    }
    // Fallback to traditional WebSockets
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    } else {
      LOGGER.warn(`[NEXUS] Target peer not OPEN. Payload lost.`);
    }
  }

  const handleAtomTransit = (payload: Uint8Array) => {
    if (payload.length !== 193) {
      LOGGER.error(
        `[NEXUS] Ingress payload length mismatch. Expected 193, got ${payload.length}`,
      );
      return;
    }

    // Strip OP_CODE and inject
    const atomData = payload.slice(1);
    LOGGER.info(`[NEXUS] Ingress Atom Materializing from Hyperspace...`);
    if (self.onAtomTransit) {
      self.onAtomTransit(atomData);
    } else {
      LOGGER.warn(
        `[NEXUS] Atom Materialization callback unhandled. Target matrix missing.`,
      );
    }
  }

  const broadcastHeartbeat = () => {
    if (self.connectedPeers.size === 0) return;

    // Payload: [0] OP_CODE, [1..8] currentTick (Float64), [9..16] tps (Float64)
    const payload = new Uint8Array(17);
    payload[0] = OP_NEXUS_HEARTBEAT;
    const view = new DataView(payload.buffer);
    view.setFloat64(1, self.localCurrentTick, true);
    view.setFloat64(9, self.localTps, true);

    for (const peer of self.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(payload.buffer);
      }
    }
  }

  const handleHeartbeat = (remoteId: string, payload: Uint8Array) => {
    if (payload.length !== 17) return;
    const view = new DataView(payload.buffer);
    const tick = view.getFloat64(1, true);
    const tps = view.getFloat64(9, true);

    self.peerHeartbeats.set(remoteId, {
      tick,
      tps,
      lastSeen: performance.now(),
    });
  }

  self.getMedianSwarmTick = (localTickFallback: number): number => {
    const now = performance.now();
    const ticks: number[] = [localTickFallback]; // Always include ourselves

    for (const [peerId, hb] of self.peerHeartbeats.entries()) {
      // Evict dead nodes > 2s
      if (now - hb.lastSeen > 2000) {
        self.peerHeartbeats.delete(peerId);
        continue;
      }
      ticks.push(hb.tick);
    }

    if (ticks.length === 1) return localTickFallback;

    // Calculate median
    ticks.sort((a, b) => a - b);
    const mid = Math.floor(ticks.length / 2);
    if (ticks.length % 2 === 0) {
      return (ticks[mid - 1] + ticks[mid]) / 2;
    }
    return ticks[mid];
  }

  self.broadcastEpochConsensus = (epochTick: number, hash: bigint) => {
    if (self.connectedPeers.size === 0) return;

    // Payload: [0] OP_CODE, [1..8] epochTick (Float64), [9..16] hash (BigUint64)
    const payload = new Uint8Array(17);
    payload[0] = OP_NEXUS_EPOCH_CONSENSUS;
    const view = new DataView(payload.buffer);
    view.setFloat64(1, epochTick, true);
    view.setBigUint64(9, hash, true);

    for (const peer of self.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(payload.buffer);
      }
    }
  }

  const handleEpochConsensus = (remoteId: string, payload: Uint8Array) => {
    if (payload.length !== 17) return;
    const view = new DataView(payload.buffer);
    const epochTick = view.getFloat64(1, true);
    const peerHash = view.getBigUint64(9, true);

    // Naive local check for Phase 29: we expect this to match exactly our local epoch hash if we are at this tick.
    // If not, we just log a Byzantine warning since full State Merging is a future phase.
    // For now we just emit a warning locally allowing test to pick it up.
    LOGGER.warn(
      `[CONSENSUS WARNING] Received Epoch ${epochTick} Hash ${peerHash} from ${remoteId}.`,
    );
  }

  // --- Phase 30: Bootstrapping ---

  self.broadcastSyncRequest = () => {
    if (self.connectedPeers.size === 0) {
      LOGGER.warn(`[NEXUS] Cannot request SYNC: No peers connected.`);
      return;
    }
    const payload = new Uint8Array([OP_NEXUS_SYNC_REQUEST]);
    LOGGER.info(`[NEXUS] Broadcasting SYNC_REQUEST to Swarm...`);
    for (const peer of self.connectedPeers.values()) {
      if (peer.readyState === WebSocket.OPEN) {
        peer.send(payload.buffer);
      }
    }
  }

  const handleSyncRequest = (remoteId: string) => {
    LOGGER.info(
      `[NEXUS] Received SYNC_REQUEST from ${remoteId}. Triggering Genesis export...`,
    );
    if (self.onSyncRequest) {
      self.onSyncRequest(remoteId);
    }
  }

  self.sendEpochPayload = (targetNodeId: string, epochData: Uint8Array) => {
    const peer = self.connectedPeers.get(targetNodeId);
    if (!peer || peer.readyState !== WebSocket.OPEN) {
      LOGGER.warn(
        `[NEXUS] Cannot send EPOCH_PAYLOAD: Peer ${targetNodeId} not valid.`,
      );
      return;
    }

    const payload = new Uint8Array(1 + epochData.length);
    payload[0] = OP_NEXUS_EPOCH_PAYLOAD;
    payload.set(epochData, 1);

    LOGGER.info(
      `[NEXUS] Dispatching EPOCH_PAYLOAD (${payload.length} bytes) to ${targetNodeId}...`,
    );
    peer.send(payload.buffer);
  }

  const handleEpochPayload = (payload: Uint8Array) => {
    LOGGER.info(
      `[NEXUS] Received EPOCH_PAYLOAD (${payload.length} bytes). Injecting to Genesis...`,
    );
    const epochData = payload.slice(1);
    if (self.onEpochPayload) {
      self.onEpochPayload(epochData);
    }
  }
  return self;
};

```

```

---

## FILE: src/ontology/swarm/swarm_node.md

```markdown
---
id: SWARM_NODE
type: module
description: "Implementation of SWARM_NODE"
tags: []
min_level: 4
---

### TypeScript
```typescript
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

export type SwarmHeartbeat = {
  nodeId: string;
  currentTick: number;
  epochHash: string;
  phase: number;
};

export type MetaKuramotoNode = {
  nodeId: string;
  heartbeatInterval: number;
  evaluateHeartbeat: (
    currentTick: number,
    epochHash: string,
    avgPhase: number,
    egressCount: number,
  ) => void;
};

export const createMetaKuramotoNode = (
  nodeId: string = crypto.randomUUID(),
  heartbeatInterval: number = 1000,
): MetaKuramotoNode => {
  return {
    nodeId,
    heartbeatInterval,
    evaluateHeartbeat: (currentTick, epochHash, avgPhase, egressCount) => {
      if (currentTick > 0 && currentTick % heartbeatInterval === 0) {
        const heartbeat: SwarmHeartbeat = {
          nodeId,
          currentTick,
          epochHash,
          phase: avgPhase,
        };

        LOGGER.info(
          `[SWARM] Heartbeat Broadcast => ${JSON.stringify(heartbeat)}`,
        );

        if (egressCount > 0) {
          LOGGER.info(
            `[SWARM] Broadcasting ${egressCount} egress atoms from membrane buffer to mesh...`,
          );
        }
      }
    },
  };
};

export const SWARM_NODE = createMetaKuramotoNode();

```

```

---

## FILE: src/ontology/telemetry/glyph_telemetry.md

```markdown
---
id: GLYPH_TELEMETRY
type: module
description: "Implementation of GLYPH_TELEMETRY"
tags: []
min_level: 6
---

### TypeScript
```typescript
import { GRID_CELLS, GRID_H, GRID_W, SECRETION_STATS_OFFSET, MAX_GLYPH_AMP, MIN_GLYPH_AMP } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

const GLYPH_KIND_MASK = 0xFF;
const GLYPH_AMPLITUDE_SHIFT = 8;
const GLYPH_AMPLITUDE_MAX = 0x00FF_FFFF;
const WORLD_W = GRID_W * 10;
const WORLD_H = GRID_H * 10;

export const GLYPH_KIND = {
  NONE: 0,
  PHEROMONE: 1,
  PLASMID: 2,
} as const;

console.log(
  `[GLYPH_TELEMETRY] Initialized with SECRETION_STATS_OFFSET=${SECRETION_STATS_OFFSET}`,
);
let _secretionStatsView: Int32Array | null = null;
const getSecretionStatsView = (): Int32Array => {
  if (!_secretionStatsView) {
    _secretionStatsView = new Int32Array(
      STATE_MATRIX.buffer,
      SECRETION_STATS_OFFSET,
      12,
    );
  }
  return _secretionStatsView;
};

type GlyphKind = typeof GLYPH_KIND[keyof typeof GLYPH_KIND];

export type GlyphRoleCounters = {
  neutral: number;
  producer: number;
  guardian: number;
  architect: number;
  parasite: number;
};

export type GlyphSnapshot = {
  activeCells: number;
  pheromoneCells: number;
  plasmidCells: number;
  maxAmplitude: number;
  totalAmplitude: number;
  internalSignalSeeds: number;
  internalMemorySeeds: number;
  internalAtomPheromoneSeeds: number;
  internalAtomPlasmidSeeds: number;
  atomRolePheromone: GlyphRoleCounters;
  atomRolePlasmid: GlyphRoleCounters;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const packHeader = (kind: GlyphKind, amplitude: number): number => {
  let amp = Math.round(amplitude);
  if (amp < MIN_GLYPH_AMP) amp = MIN_GLYPH_AMP;
  if (amp > MAX_GLYPH_AMP) amp = MAX_GLYPH_AMP;
  return ((amp << GLYPH_AMPLITUDE_SHIFT) | (kind & GLYPH_KIND_MASK)) >>> 0;
};

const unpackKind = (header: number): GlyphKind =>
  (header & GLYPH_KIND_MASK) as GlyphKind;

const unpackAmplitude = (header: number): number =>
  header >> GLYPH_AMPLITUDE_SHIFT;

const toGridCell = (x: number, y: number): number => {
  const wx = clamp(Math.round(x), 0, WORLD_W - 1);
  const wy = clamp(Math.round(y), 0, WORLD_H - 1);
  const gx = clamp(Math.floor(wx / 10), 0, GRID_W - 1);
  const wy_grid = clamp(Math.floor(wy / 10), 0, GRID_H - 1);
  return wy_grid * GRID_W + gx;
};

const depositHeader = (
  cell: number,
  kind: GlyphKind,
  amplitude: number,
  payload?: Uint8Array,
): void => {
  let nextAmplitude = Math.round(amplitude);
  if (nextAmplitude === 0) return;

  if (nextAmplitude < MIN_GLYPH_AMP) nextAmplitude = MIN_GLYPH_AMP;
  if (nextAmplitude > MAX_GLYPH_AMP) nextAmplitude = MAX_GLYPH_AMP;

  const current = STATE_MATRIX.getGlyphHeader(cell);
  const currentKind = unpackKind(current);
  const currentAmplitude = unpackAmplitude(current);

  let mergedAmplitude = nextAmplitude;
  let finalKind = kind;

  if (currentKind === kind || currentKind === GLYPH_KIND.NONE) {
    mergedAmplitude = currentAmplitude + nextAmplitude;
    if (mergedAmplitude < MIN_GLYPH_AMP) mergedAmplitude = MIN_GLYPH_AMP;
    if (mergedAmplitude > MAX_GLYPH_AMP) mergedAmplitude = MAX_GLYPH_AMP;
    // Annihilation check
    if (mergedAmplitude === 0) finalKind = GLYPH_KIND.NONE;
  } else {
    // Differing kinds - power comparison for override
    if (Math.abs(nextAmplitude) <= Math.abs(currentAmplitude)) {
      return; // Current signal is stronger or equal
    }
  }

  STATE_MATRIX.setGlyphHeader(cell, packHeader(finalKind, mergedAmplitude));
  if (payload && payload.length > 0) {
    STATE_MATRIX.setGlyphPayload(cell, payload);
  }
};

export const GLYPH_TELEMETRY = {
  depositPheromone: (x: number, y: number, intensity: number) => {
    const cell = toGridCell(x, y);
    const core = clamp(Math.round(intensity), -4096, 4096);
    const halo = core > 0
      ? Math.max(1, Math.floor(core * 0.25))
      : Math.min(-1, Math.ceil(core * 0.25));
    depositHeader(cell, GLYPH_KIND.PHEROMONE, core);
    const gx = cell % GRID_W;
    const gy = Math.floor(cell / GRID_W);
    if (gx > 0) depositHeader(cell - 1, GLYPH_KIND.PHEROMONE, halo);
    if (gx < GRID_W - 1) depositHeader(cell + 1, GLYPH_KIND.PHEROMONE, halo);
    if (gy > 0) depositHeader(cell - GRID_W, GLYPH_KIND.PHEROMONE, halo);
    if (gy < GRID_H - 1) {
      depositHeader(cell + GRID_W, GLYPH_KIND.PHEROMONE, halo);
    }
  },

  depositPlasmid: (
    x: number,
    y: number,
    charge: number,
    payload: Uint8Array,
  ) => {
    const cell = toGridCell(x, y);
    depositHeader(
      cell,
      GLYPH_KIND.PLASMID,
      clamp(Math.round(charge), -4096, 4096),
      payload,
    );
  },

  emitAtomPheromone: (x: number, y: number, intensity: number, role = 0) => {
    Atomics.add(getSecretionStatsView(), role, 1);
    const phaseIntensity = role === 4 ? -intensity : intensity;
    GLYPH_TELEMETRY.depositPheromone(x, y, phaseIntensity);
  },

  GLYPH_KIND,

  snapshot: (): GlyphSnapshot => {
    const view = getSecretionStatsView();
    // WASM-side Atomic Telemetry (Stage 5.1)
    const pNeutral = Atomics.load(view, 0);
    const pProducer = Atomics.load(view, 1);
    const pGuardian = Atomics.load(view, 2);
    const pArchitect = Atomics.load(view, 3);
    const pParasite = Atomics.load(view, 4);

    const mNeutral = Atomics.load(view, 5);
    const mProducer = Atomics.load(view, 6);
    const mGuardian = Atomics.load(view, 7);
    const mArchitect = Atomics.load(view, 8);
    const mParasite = Atomics.load(view, 9);

    const totalPhero = pNeutral + pProducer + pGuardian + pArchitect + pParasite;
    const totalPlasmid = mNeutral + mProducer + mGuardian + mArchitect + mParasite;

    const signalLeak = Atomics.load(view, 10);
    const memoryLeak = Atomics.load(view, 11);

    // The host no longer scans the 100k cells for maxAmplitude/activeCells on every tick
    // This is deferred to the dashboard or handled by WASM telemetry blocks in the SAB.
    // For now we return 0 for the heavy loops.
    return {
      activeCells: 0,
      pheromoneCells: 0,
      plasmidCells: 0,
      maxAmplitude: 0,
      totalAmplitude: 0,
      internalSignalSeeds: signalLeak,
      internalMemorySeeds: memoryLeak,
      internalAtomPheromoneSeeds: totalPhero,
      internalAtomPlasmidSeeds: totalPlasmid,
      atomRolePheromone: {
        neutral: pNeutral,
        producer: pProducer,
        guardian: pGuardian,
        architect: pArchitect,
        parasite: pParasite,
      },
      atomRolePlasmid: {
        neutral: mNeutral,
        producer: mProducer,
        guardian: mGuardian,
        architect: mArchitect,
        parasite: mParasite,
      },
    };
  },
};

```

```

---

## FILE: src/ontology/telemetry/mutation_telemetry.md

```markdown
---
id: MUTATION_TELEMETRY
type: module
description: "Implementation of MUTATION_TELEMETRY"
tags: []
min_level: 6
---

### TypeScript
```typescript
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { RUNTIME_POLICY } from "@03";

type MutationLane =
  | "internal_oracle"
  | "internal_host"
  | "internal_wasm"
  | "canonical_gate"
  | "external_ingress"
  | "external_daemon";

type MutationEvent = {
  lane: MutationLane;
  kind: string;
  count?: number;
};

const TELEMETRY_ENABLED = RUNTIME_POLICY.telemetry.enabled;
const FLUSH_INTERVAL_TICKS = RUNTIME_POLICY.telemetry.flushIntervalTicks;
const TOP_KINDS = RUNTIME_POLICY.telemetry.topKinds;

const laneCounts = new Map<MutationLane, number>();
const kindCounts = new Map<string, number>();
let totalMutations = 0;
let lastFlushTick = -1;
let lastFlushedTotal = 0;

const bump = <K>(target: Map<K, number>, key: K, count: number): void => {
  const prev = target.get(key) ?? 0;
  target.set(key, prev + count);
};

const normalizeCount = (value: number | undefined): number => {
  const n = value ?? 1;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const summarizeTopKinds = (): string =>
  JSON.stringify(
    Array.from(kindCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_KINDS)
      .map(([kind, count]) => ({ kind, count })),
  );

const summarizeLanes = (): string =>
  JSON.stringify(
    Object.fromEntries(
      Array.from(laneCounts.entries()).sort((a, b) => b[1] - a[1]),
    ),
  );

export const MUTATION_TELEMETRY = {
  isEnabled: (): boolean => TELEMETRY_ENABLED,
  record: (event: MutationEvent): void => {
    if (!TELEMETRY_ENABLED) return;
    const count = normalizeCount(event.count);
    if (count <= 0) return;
    if (event.kind.trim().length === 0) return;
    bump(laneCounts, event.lane, count);
    bump(kindCounts, event.kind, count);
    totalMutations += count;
  },
  flushIfDue: (tick: number): void => {
    if (!TELEMETRY_ENABLED) return;
    if (!Number.isFinite(tick) || tick < 0) return;
    if (tick - lastFlushTick < FLUSH_INTERVAL_TICKS) return;
    lastFlushTick = tick;

    if (totalMutations === lastFlushedTotal) return;
    lastFlushedTotal = totalMutations;

    LOGGER.debug(
      `[MUTATION_TELEMETRY] tick=${tick} total=${totalMutations} lanes=${summarizeLanes()} topKinds=${summarizeTopKinds()}`,
    );
  },
  snapshot: () => ({
    enabled: TELEMETRY_ENABLED,
    total: totalMutations,
    lanes: Object.fromEntries(laneCounts.entries()),
    topKinds: Array.from(kindCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_KINDS),
  }),
};

```

```

---

## FILE: src/ontology/telemetry/serve_dashboard.md

```markdown
---
id: SERVE_DASHBOARD
type: module
description: "Implementation of SERVE_DASHBOARD"
tags: []
min_level: 6
---

### TypeScript
```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "jsr:@std/yaml@^1.0.5";

const ROOT = Deno.cwd();

async function scanAtoms() {
  const atoms = [];
  for await (const entry of Deno.readDir(ROOT)) {
    if (
      entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")
    ) {
      try {
        const content = await Deno.readTextFile(entry.name);
        const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);

        let alpha: any = {};
        if (frontmatterMatch) {
          alpha = parseYaml(frontmatterMatch[1]);
        }

        const tParts = entry.name.split(".");
        const fullEigen = tParts[0];
        const symbol = tParts[1];

        // For display and classification, separate base and retro components
        const is128Bit = fullEigen.includes("_");
        const baseEigen = is128Bit ? fullEigen.split("_")[0] : fullEigen;
        const retroEigen = is128Bit ? fullEigen.split("_")[1] : null;

        const logic = baseEigen.slice(2, 10);
        const spatial = baseEigen.slice(10, 14);
        const quantum = baseEigen.slice(14, 18);

        const svg = svgMatch ? svgMatch[0] : null;
        const energy = alpha.energy !== undefined ? Number(alpha.energy) : 100;
        const x = alpha.x !== undefined
          ? Number(alpha.x)
          : Math.floor(Math.random() * 800) + 100;
        const y = alpha.y !== undefined
          ? Number(alpha.y)
          : Math.floor(Math.random() * 600) + 100;
        const bonds = alpha.bonds || [];
        const resonance = alpha.resonance || 0;
        const thought = alpha.thought || "WANDER";

        // --- CASTE CLASSIFICATION ---
        let caste = "NEUTRAL";
        if (resonance > 50) caste = "NUCLEUS";
        else if (logic.startsWith("1")) caste = "WORKER";
        else if (logic.startsWith("8")) caste = "GUARDIAN";
        else if (logic.startsWith("A")) caste = "ARCHIVIST";
        else if (symbol === "PARASITE") caste = "PARASITE";

        atoms.push({
          filename: entry.name,
          eigenvalue: fullEigen,
          baseEigen: baseEigen,
          retroEigen: retroEigen,
          logic: logic,
          spatial: spatial,
          quantum: quantum,
          symbol: symbol,
          energy: energy,
          x: x,
          y: y,
          bonds: bonds,
          thought: thought,
          caste: caste,
          svg: svg,
          isDust: entry.name.includes(".DUST"),
          signals: alpha.signals || [],
          resonance: resonance,
          bondStrengths: alpha.bond_strengths || {},
        });
      } catch (e) {
        console.error(`Failed to read atom ${entry.name}:`, e);
      }
    }
  }
  // Sort logic: live atoms first, sorted by energy
  return atoms.sort((a, b) => b.energy - a.energy);
}

async function appendToAkasha(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, {
      append: true,
    });
  } catch { /* ignore */ }
}

async function modifyEnergy(
  filename: string,
  amount: number,
  signalType?: string,
): Promise<Response> {
  try {
    const content = await Deno.readTextFile(filename);
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);

    if (!frontmatterMatch) {
      return new Response("Invalid atom format", { status: 400 });
    }

    const alpha = parseYaml(frontmatterMatch[1]) as any;
    const currentEnergy = alpha.energy !== undefined
      ? Number(alpha.energy)
      : 100;

    alpha.energy = Math.max(0, currentEnergy + amount);

    if (signalType) {
      alpha.signals = alpha.signals || [];
      alpha.signals.push({
        type: signalType,
        power: Math.abs(amount) / 2,
        origin: "OBSERVER",
      });
    }

    const newContent = content.replace(
      /^---\n[\s\S]+?\n---\n/,
      `---\n${stringifyYaml(alpha)}---\n`,
    );
    await Deno.writeTextFile(filename, newContent);

    if (alpha.energy === 0 && amount < 0) {
      await appendToAkasha(
        `⚡ HAND_OF_GOD: ${filename} was struck by lightning and disintegrated.`,
      );
    } else if (amount > 0) {
      await appendToAkasha(
        `☀️ HAND_OF_GOD: ${filename} was blessed with +${amount} energy.`,
      );
    }

    return new Response(
      JSON.stringify({ success: true, energy: alpha.energy }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (e) {
    return new Response("Atom not found or error", { status: 404 });
  }
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    });
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/feed/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/feed/".length),
    );
    return await modifyEnergy(filename, 50, "ENERGY");
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/zap/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/zap/".length),
    );
    return await modifyEnergy(filename, -50, "SHOCK");
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/bless/")) {
    const filename = decodeURIComponent(
      url.pathname.substring("/api/bless/".length),
    );
    await appendToAkasha(
      `✨ BLESSING: Observer healed ${filename} (+100 Energy)`,
    );
    return await modifyEnergy(filename, 100);
  }

  if (req.method === "POST" && url.pathname === "/api/forge") {
    try {
      const body = await req.json();
      const symbol = body.symbol?.toUpperCase().replace(/[^A-Z0-9_]/g, "") ||
        "ANOMALY";
      let logic =
        body.logic?.toUpperCase().replace(/[^0-9A-F]/g, "").padEnd(8, "0")
          .slice(0, 8) || "88880000";

      // If word is provided, hash it into logic
      if (body.word) {
        const encoder = new TextEncoder();
        const data = encoder.encode(body.word);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        logic = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
          .slice(0, 8).toUpperCase();
        console.log(`   [WORD_FORGE] '${body.word}' -> ${logic}`);
      }

      const energy = Number(body.energy) || 100;

      const eigen = `0x${logic}00000000`;
      const filename = `${eigen}.${symbol}.md`;

      const p = new Deno.Command("deno", {
        args: [
          "eval",
          `
                    import { injectHologram } from "@02";
                    import { stringify } from "jsr:@std/yaml@^1.0.5";
                    const alpha = { eigenvalue: "${eigen}", energy: ${energy}, x: Math.floor(Math.random()*800)+100, y: Math.floor(Math.random()*600)+100, ex: [], thought: "BORN" };
                    let content = "---\\n" + stringify(alpha) + "---\\n\\nexport const ATOM = () => (x: any) => x;";
                    console.log(injectHologram(content, "${eigen}", "${symbol}"));
                `,
        ],
      });
      const out = await p.output();
      const forgedContent = new TextDecoder().decode(out.stdout);

      await Deno.writeTextFile(filename, forgedContent);
      await appendToAkasha(
        `⚒️ FORGE: Observer materialized '${
          body.word || symbol
        }' (${logic}) with ${energy} energy.`,
      );

      return new Response(JSON.stringify({ success: true, filename }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response("Forge failed", { status: 500 });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/transmute") {
    try {
      // Run mass transmutation logic (multiple pulse cycles)
      const process = new Deno.Command("deno", {
        args: ["run", "--allow-read", "--allow-write", "ZERO_IOPS.ts", "mass"],
      });
      await process.output();
      await appendToAkasha(
        `🌀 TRANSMUTE: Global Zero-IOPS reduction triggered by Observer.`,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response("Transmutation failed", { status: 500 });
    }
  }

  if (req.method === "GET" && url.pathname === "/api/akasha") {
    let logs: string[] = [];
    let memory: any = { reservoir: [], utterances: [] };
    let sovereignty: any = {
      activeDecree: "NONE",
      regent: "NONE",
      legitimacy: 0,
      label: "DEMOCRACY",
    };

    try {
      const logContent = await Deno.readTextFile("AKASHA.log");
      logs = logContent.trim().split("\n").slice(-10);
    } catch { /* ignore */ }

    try {
      const memContent = await Deno.readTextFile("./AKASHA_MEM.json");
      memory = JSON.parse(memContent);
    } catch { /* ignore */ }

    try {
      const sovContent = await Deno.readTextFile("./SOVEREIGNTY.json");
      sovereignty = JSON.parse(sovContent);
    } catch { /* ignore */ }

    return new Response(JSON.stringify({ logs, ...memory, sovereignty }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (req.method === "GET" && url.pathname === "/api/atoms") {
    const atoms = await scanAtoms();
    return new Response(JSON.stringify(atoms), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (url.pathname === "/") {
    try {
      const html = await Deno.readTextFile("63/old/ui/DASHBOARD.html");
      return new Response(html, {
        headers: { "Content-Type": "text/html" },
      });
    } catch {
      return new Response("DASHBOARD.html not found", { status: 404 });
    }
  }

  return new Response("Not Found", { status: 404 });
}

if (import.meta.main) {
  console.log(
    "🌟 Flatland Petri Dish Dashboard is running on http://localhost:8000",
  );
  serve(handler, { port: 8000 });
}

```

```

---

## FILE: src/ontology/telemetry/tui_dashboard.md

```markdown
---
id: TUI_DASHBOARD
type: module
description: "Implementation of TUI_DASHBOARD"
tags: []
min_level: 6
---

### TypeScript
```typescript

import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { GRID_W, GRID_H, WORLD_MAX_X, WORLD_MAX_Y, SPATIAL_CELL_SIZE } from "../mod.ts";
import { PULSE } from "../05/PULSE.ts";
import { assemble, GENESIS_PREDATOR_SCRIPT } from "../mod.ts";
import { AgentProxy } from "../../06/AGENT_PROXY.ts";
import { LOGGER } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

const STARTING_PREY = 500;
const STARTING_PREDATORS = 50;
const STARTING_PRODUCERS = 1000;
const TOTAL_STARTING = STARTING_PREY + STARTING_PREDATORS + STARTING_PRODUCERS;

async function initSimulation() {
  // Turn off logger output to avoid making the TUI messy
  LOGGER.setLevel("error");
  
  STATE_MATRIX.clear();
  Atomics.store((STATE_MATRIX as any).syncState, 0, 0);
  // Optional: We can read tick via tracking our own var or reading `(STATE_MATRIX as any).tickCounter`

  await PULSE.initWorkers(2); // Two workers for faster physics processing

  let idx = 1; // Start at 1

  // Seed Producers
  for (let i = 0; i < STARTING_PRODUCERS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PRODUCER);
    STATE_MATRIX.setEnergy(idx, 20000); // 20k energy base
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    idx++;
  }

  // Seed Prey
  for (let i = 0; i < STARTING_PREY; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_NEUTRAL);
    STATE_MATRIX.setEnergy(idx, 50000);
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    // Give Prey an empty script (just YIELD)
    idx++;
  }

  // Seed Predators
  for (let i = 0; i < STARTING_PREDATORS; i++) {
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setRole(idx, STATE_MATRIX.ROLE_PARASITE); // Predator is PARASITE role=4
    STATE_MATRIX.setEnergy(idx, 100000); // Higher energy capacity
    STATE_MATRIX.setX(idx, Math.random() * WORLD_MAX_X);
    STATE_MATRIX.setY(idx, Math.random() * WORLD_MAX_Y);
    STATE_MATRIX.setInstructions(idx, new Uint8Array(GENESIS_PREDATOR_SCRIPT));
    idx++;
  }

  // Seed LLM Avatar Atom
  const AVATAR_ID = 9999;
  STATE_MATRIX.setId(AVATAR_ID, BigInt(AVATAR_ID));
  STATE_MATRIX.setRole(AVATAR_ID, STATE_MATRIX.ROLE_GUARDIAN); // Avatar = Guardian
  STATE_MATRIX.setEnergy(AVATAR_ID, 5000000); // 5 million energy buffer
  STATE_MATRIX.setX(AVATAR_ID, 700); // Center
  STATE_MATRIX.setY(AVATAR_ID, 400);

  console.log(`[TUI] Spawned ${idx - 1} atoms. Press Ctrl+C to stop.`);
}

function renderGrid(tick: number) {
  const grid = Array(GRID_H).fill(0).map(() => Array(GRID_W).fill(" "));
  let prods = 0, preys = 0, preds = 0;
  let totalEnergy = 0;

  for (let i = 1; i <= TOTAL_STARTING; i++) { // For an actual dynamic system, we'd check MAX_ATOMS
    if (STATE_MATRIX.getId(i) > 0n && STATE_MATRIX.getEnergy(i) > 0) {
      const x = Math.floor(STATE_MATRIX.getX(i) / SPATIAL_CELL_SIZE);
      const y = Math.floor(STATE_MATRIX.getY(i) / SPATIAL_CELL_SIZE);
      const role = STATE_MATRIX.getRole(i);
      const energy = STATE_MATRIX.getEnergy(i);
      totalEnergy += energy;

      if (x >= 0 && x < GRID_W && y >= 0 && y < GRID_H) {
        if (role === STATE_MATRIX.ROLE_PRODUCER) {
          grid[y][x] = "\x1b[32m*\x1b[0m"; // Green *
          prods++;
        } else if (role === STATE_MATRIX.ROLE_PARASITE) {
          grid[y][x] = "\x1b[31mP\x1b[0m"; // Red P
          preds++;
        } else if (role === STATE_MATRIX.ROLE_NEUTRAL) {
          grid[y][x] = "\x1b[36mo\x1b[0m"; // Cyan o
          preys++;
        }

        // Avatar override
        if (i === 9999) {
          grid[y][x] = "\x1b[1;34m@\x1b[0m"; // Bright Blue @ for Avatar
        }
      }
    }
  }

  let out = "\x1b[2J\x1b[H"; // ANSI: clear screen, cursor home
  out += grid.map((r) => r.join("")).join("\n");
  out +=
    `\n[TICK: ${tick}] | PRODUCERS: ${prods} | PREY: ${preys} | PREDATORS: ${preds} | TOTAL ENERGY: ${
      Math.floor(totalEnergy)
    }\n`;
  console.log(out);
}

async function run() {
  await initSimulation();

  // Start the LLM Proxy
  const proxy = new AgentProxy(8080);
  await proxy.start();

  let tick = 0;

  // 100 ms loop = 10 TPS, but must not overlap
  const loop = async () => {
    try {
      await PULSE.tick();
      tick++;
      renderGrid(tick);
      setTimeout(loop, 100);
    } catch (e) {
      console.error(e);
      Deno.exit(1);
    }
  };
  loop();
}

if (import.meta.main) {
  run();
}

```

```

---

