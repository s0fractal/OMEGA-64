// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/build_spatial_hash.md
import { MAX_ATOMS, GRID_CELLS, GRID_W, WORLD_MAX_X, WORLD_MAX_Y, SPATIAL_CELL_SIZE, SPATIAL_GRID_OFFSET, QUORUM_OFFSET, IDS_OFFSET, get_x, get_y, get_phase, get_role } from "../02/mod";

@inline
export function build_spatial_hash(): i64 {
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
}
