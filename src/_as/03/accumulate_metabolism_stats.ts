// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/accumulate_metabolism_stats.md
import { IDS_OFFSET, METABOLISM_SCRATCH_OFFSET, genome_key16 } from "../02/mod";

@inline
export function accumulate_metabolism_stats(startIdx: i32, endIdx: i32): void {
for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const key = genome_key16(i);
    // Atomic add to genome frequency map in scratch space
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (key << 2), 1);
    // Atomic add to global population counter (scratch end)
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4), 1);
  }
}
