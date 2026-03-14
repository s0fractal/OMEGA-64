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
