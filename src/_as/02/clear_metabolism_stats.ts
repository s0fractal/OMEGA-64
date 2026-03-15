/** SSoT: {@link ../../ontology/autopoiesis/clear_metabolism_stats.md} */
import { METABOLISM_SCRATCH_OFFSET } from "../01/mod";

@inline
export function clear_metabolism_stats(): void {
// Clear genome count scratch (65536 * 4 bytes = 256KB)
  // and generic stats (population, noveltyDelta, symbiosisDelta, etc)
  memory.fill(METABOLISM_SCRATCH_OFFSET, 0, (65536 * 4) + 64);
}
