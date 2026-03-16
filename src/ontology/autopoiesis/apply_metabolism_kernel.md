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
rsArgs:
  state: "&mut SigmaState"
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
```rust
    let population = unsafe { (&*state.matrix as *const SigmaMatrix as *const u8).add(crate::METABOLISM_SCRATCH_OFFSET + (65536 * 4)) as *const i32 };
    let population = unsafe { *population };
    if population == 0 { return; }

    let overflow_active = spatialOverflowRatio >= overflowThreshold;
    let mut band_step = homeostasisBand >> 1;
    if band_step < 1 { band_step = 1; }
    let bond_polarity = if symbiosisSigned >= 0 { 1 } else { -1 };

    for i in startIdx as usize..endIdx as usize {
        if i >= crate::MAX_ATOMS { break; }
        if state.matrix.ids[i] == 0 { continue; }

        let current = state.matrix.energy[i];

        // --- PHASE 43: FOSSILIZATION & NECROPOLIS ---
        if current <= 0 {
            let resonance = state.matrix.resonance[i];
            let role_raw = state.matrix.roles[i];
            let role = role_raw & 0x7F;
            
            let ctx13 = state.matrix.context[i][13];
            let ctx14 = state.matrix.context[i][14];
            let has_immunity = ctx13 != 0 || ctx14 != 0;

            let cx = state.matrix.xs[i] as i32;
            let cy = state.matrix.ys[i] as i32;
            let gx = cx / crate::SPATIAL_CELL_SIZE;
            let gy = cy / crate::SPATIAL_CELL_SIZE;
            let cell_idx = (gy * crate::GRID_W + gx) as usize;

            if cell_idx < crate::GRID_CELLS && (resonance > 100 || role == 2 || role == 3 || has_immunity) {
                let mut struct_val: i32 = 0;
                if role == 2 {
                    struct_val = 1 | (150 << 16); // STR_WIRE = 1
                } else if role == 3 {
                    struct_val = 1 | (100 << 16);
                }

                if struct_val != 0 {
                    state.matrix.structure_grid[cell_idx] = struct_val;
                }

                // Epigenetic memory spillage
                state.matrix.memory_grid[cell_idx][4] = (ctx13 >> 24) as u8;
                state.matrix.memory_grid[cell_idx][5] = (ctx13 >> 16) as u8;
                state.matrix.memory_grid[cell_idx][6] = (ctx13 >> 8) as u8;
                state.matrix.memory_grid[cell_idx][7] = ctx13 as u8;
                
                let boot_charge = 100u8;
                state.matrix.memory_grid[cell_idx][0] = boot_charge;
                state.matrix.memory_grid[cell_idx][1] = 0;
                state.matrix.memory_grid[cell_idx][2] = 0;

                state.matrix.resonance[i] = 0;
                state.matrix.roles[i] = 0;
                state.matrix.context[i][13] = 0;
                state.matrix.context[i][14] = 0;
                state.matrix.ids[i] = 0; // Final decommissioning
            }
            continue;
        }

        // --- PHASE 44: ENDOSYMBIOSIS ---
        let role = state.matrix.roles[i] & 0x7F;
        if role == 5 { // ROLE_MITOCHONDRIA
            let host_id = state.matrix.context[i][12] as usize;
            if host_id < crate::MAX_ATOMS && state.matrix.ids[host_id] != 0 {
                state.matrix.xs[i] = state.matrix.xs[host_id];
                state.matrix.ys[i] = state.matrix.ys[host_id];

                if current > starvationFloor {
                    let transfer = ((current - starvationFloor) * 9) / 10;
                    if transfer > 0 {
                        state.matrix.energy[host_id] += transfer;
                        state.matrix.energy[i] = current - transfer;
                    }
                }
            } else {
                state.matrix.energy[i] = 0;
                state.matrix.ids[i] = 0;
            }
            continue;
        }

        let key = genome_key16(state, i as i32);
        let same_genome_count_ptr = unsafe { (&*state.matrix as *const SigmaMatrix as *const u8).add(crate::METABOLISM_SCRATCH_OFFSET + (key as usize * 4)) as *const i32 };
        let same_genome_count = unsafe { *same_genome_count_ptr };

        let mut delta: i32 = 0;

        // Pass 1: Evolution Pressure
        if noveltySigned != 0 {
            delta += (noveltySigned * (population - (same_genome_count * 2))) / population;
        }

        if symbiosisSigned != 0 {
            let mut cross_genome_bonds = 0;
            for slot in 0..4 {
                let target = state.matrix.bonds[i * 4 + slot] as usize;
                if target < crate::MAX_ATOMS && state.matrix.ids[target] != 0 {
                    if genome_key16(state, target as i32) != key {
                        cross_genome_bonds += 1;
                    }
                }
            }
            delta += if cross_genome_bonds > 0 {
                symbiosisSigned * cross_genome_bonds
            } else {
                bond_polarity * -symbiosisSigned
            };
        }

        // 2. Homeostasis
        let mut interim_energy = current + delta;
        if interim_energy < 0 { interim_energy = 0; }

        if baseTax > 0 && interim_energy > starvationFloor {
            let tax = if baseTax < interim_energy { baseTax } else { interim_energy };
            delta -= tax;
        }

        let deviation = interim_energy - targetEnergy;
        let abs_deviation = crate::fast_abs(deviation);

        if abs_deviation > homeostasisBand {
            let gradient = abs_deviation - homeostasisBand;
            let mut step = 1 + (gradient / band_step);
            if step > homeostasisMaxDelta { step = homeostasisMaxDelta; }

            if deviation > 0 {
                delta -= step;
                if overflow_active { delta -= 1; }
            } else if subsidyEnabled != 0 {
                let mut subsidy = step;
                if overflow_active {
                    subsidy = (subsidy * 6) / 10;
                    if subsidy < 1 { subsidy = 1; }
                }
                delta += subsidy;
            }
        }

        // Starvation Floor Guard
        if interim_energy <= starvationFloor && delta < 0 {
            let pass2_delta = delta - (interim_energy - current);
            if pass2_delta < 0 {
                delta = interim_energy - current;
            }
        }

        // RESONANCE BUFFER Enhancement
        let resonance = state.matrix.resonance[i];
        if delta < 0 && resonance > 100 {
            // Buffer up to 50% of the energy loss if highly resonant
            let buffer_ratio = if resonance > 255 { 50 } else { (resonance - 100) * 50 / 155 };
            delta = delta * (100 - buffer_ratio) / 100;
        }

        if delta != 0 {
            let next = current + delta;
            state.matrix.energy[i] = if next < 0 { 0 } else { next };
            
            // Track stats
            unsafe {
                let stats_ptr = (&mut *state.matrix as *mut SigmaMatrix as *mut u8).add(crate::METABOLISM_SCRATCH_OFFSET + (65536 * 4) + 4) as *mut i32;
                *stats_ptr += 1;
                *(stats_ptr.add(1)) += delta;
            }
        }
    }
```

```typescript
```

```assemblyscript
```
