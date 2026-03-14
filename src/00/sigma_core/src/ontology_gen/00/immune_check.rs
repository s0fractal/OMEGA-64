#![allow(unused_imports)]

#[inline(always)]
pub fn immune_check(energy: i32, resonance: i32, id_handle: i32, role: u8, entropy_pressure: i32) -> bool {
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
}
