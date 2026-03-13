#[allow(unused_imports)]
use super::super::L00::*;

pub fn calculate_shannon_entropy(data: &[u8; 64]) -> i32 {
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
}
