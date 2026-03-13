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
