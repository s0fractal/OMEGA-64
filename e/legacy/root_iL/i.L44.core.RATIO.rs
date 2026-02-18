
pub struct Ratio {
    pub value: f64,
}

impl Ratio {
    pub fn golden() -> Self {
        Ratio { value: 1.61803398875 }
    }

    pub fn calculate(a: f64, b: f64) -> Self {
        if b == 0.0 {
            Ratio { value: 0.0 }
        } else {
            Ratio { value: a / b }
        }
    }
}

pub struct Proportion {
    pub scale_factor: f64,
}

impl Proportion {
    /// Calculate how much force to apply given a threat level
    pub fn calibrate_response(threat: f64) -> f64 {
        // Proportional response: 10% Overmatch doctrine
        threat * 1.1 
    }
}

pub struct Harmony {
    pub entropy: f64,
    pub structure: f64,
}

impl Harmony {
    /// Check the balance between Entropy and Structure
    pub fn check_balance(entropy: f64, structure: f64) -> String {
        let total = entropy + structure;
        if total == 0.0 {
            return "VOID_BALANCE".to_string();
        }
        
        let ratio = structure / total;
        
        if ratio > 0.95 {
            "STAGNATION (Too much structure)".to_string()
        } else if ratio < 0.2 {
            "CHAOS (Too much entropy)".to_string()
        } else if (ratio - 0.618).abs() < 0.1 {
            "GOLDEN_HARMONY".to_string()
        } else {
            format!("DYNAMIC_BALANCE (Ratio: {:.2})", ratio)
        }
    }
}
