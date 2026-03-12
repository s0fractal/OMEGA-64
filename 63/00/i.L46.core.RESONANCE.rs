
#[derive(Debug, Clone, PartialEq)]
pub struct Frequency {
    pub hertz: f64,
}

#[derive(Debug, Clone)]
pub struct Vibration {
    pub frequency: Frequency,
    pub amplitude: f64,
}

pub struct Resonance {
    pub base_frequency: Frequency,
    pub active_vibrations: Vec<Vibration>,
}

impl Resonance {
    pub fn new(base_hz: f64) -> Self {
        Resonance {
            base_frequency: Frequency { hertz: base_hz },
            active_vibrations: Vec::new(),
        }
    }

    /// Check alignment between two frequencies
    /// Returns a multiplier factor: > 1.0 (Amplify), < 1.0 (Dampen)
    pub fn interact(&self, incoming: &Frequency) -> f64 {
        let diff = (self.base_frequency.hertz - incoming.hertz).abs();
        
        if diff < 1.0 {
            // Perfect Resonance: Constructive Interference
            2.0 
        } else if diff < 10.0 {
            // Harmonic: Mild Amplification
            1.2
        } else if diff > 100.0 {
            // Dissonance: Destructive Interference
            0.1
        } else {
            // Neutral
            1.0
        }
    }

    /// Absorb a vibration into the system
    pub fn absorb(&mut self, vib: Vibration) -> String {
        let interaction = self.interact(&vib.frequency);
        let final_amp = vib.amplitude * interaction;
        
        if final_amp < 0.1 {
            format!("Vibration DAMPENED. Frequency Mismatch. Final Amp: {:.2}", final_amp)
        } else {
            self.active_vibrations.push(Vibration {
                frequency: vib.frequency.clone(),
                amplitude: final_amp,
            });
            format!("Vibration RESONATING. Factor: {:.1}x. Final Amp: {:.2}", interaction, final_amp)
        }
    }
}
