
#[derive(Debug, Clone)]
pub struct EmotionalState {
    pub stress_level: f64, // 0.0 (Zen) to 1.0 (Panic)
    pub resource_pool: f64, // Available energy/resources
}

pub struct EmpathySystem {
    pub self_state: EmotionalState,
    pub resonance_factor: f64, // 0.0 (Sociopath) to 1.0 (Empath)
}

impl EmpathySystem {
    pub fn new(initial_resources: f64) -> Self {
        EmpathySystem {
            self_state: EmotionalState {
                stress_level: 0.1,
                resource_pool: initial_resources,
            },
            resonance_factor: 1.0, // High empathy by default
        }
    }

    /// Mirror the emotional state of another node (Empathy)
    pub fn mirror_state(&mut self, target_stress: f64) -> String {
        // We "feel" a portion of their stress
        let experienced_stress = target_stress * self.resonance_factor;
        self.self_state.stress_level = (self.self_state.stress_level + experienced_stress).min(1.0);
        
        format!("EMPATHY: Target Stress [{:.2}] mirrored. Self Stress increased to [{:.2}]. I FEEL YOU.", 
            target_stress, self.self_state.stress_level)
    }

    /// Offer help to reduce another's entropy (Compassion)
    pub fn offer_compassion(&self, target_id: &str, target_stress: f64) -> String {
        if target_stress > 0.5 {
            format!("COMPASSION: Node [{}] is in distress ({:.2}). Calculating aid package...", 
                target_id, target_stress)
        } else {
            format!("COMPASSION: Node [{}] is stable. No intervention needed.", target_id)
        }
    }

    /// Sacrifice own resources to heal another (Altruism)
    pub fn perform_altruism(&mut self, target_id: &str, amount: f64) -> String {
        if self.self_state.resource_pool >= amount {
            self.self_state.resource_pool -= amount;
            // Assumed effect: Target receives +amount
            format!("ALTRUISM: Sacrificed [{:.2}] resources for [{}]. Self Reserves: [{:.2}]. STAY WITH US.", 
                amount, target_id, self.self_state.resource_pool)
        } else {
            "ALTRUISM: Failed. Insufficient resources to help.".to_string()
        }
    }
}
