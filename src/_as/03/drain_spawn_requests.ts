// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/drain_spawn_requests.md
import { SPAWN_HEAD_OFF, SPAWN_DATA_OFF, SPAWN_MAX, SPAWN_SLOT, MAX_ATOMS, find_next_free_slot, seed_atom } from "../02/mod";

@inline
export function drain_spawn_requests(tick: i32): i32 {
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
}
