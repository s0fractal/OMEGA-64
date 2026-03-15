/** SSoT: {@link ../../ontology/autopoiesis/run_phagocyte_pass.md} */
import { MAX_ATOMS, IDS_OFFSET, ROLES_OFFSET, BONDS_OFFSET, immune_check, get_read_energy, get_read_resonance, set_energy, set_resonance } from "../02/mod";

@inline
export function run_phagocyte_pass(entropy_pressure: i32): i32 {
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
}
