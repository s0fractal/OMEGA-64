
// Mocking Intent/Consciousness for independent compilation or assuming module visibility
// In a full crate, these would be imported.

pub struct Intent<T> {
    pub signal: T,
    pub tag: String,
    pub coherence: f64, // Added for Metabolism logic
}

impl<T> Intent<T> {
    pub fn new(signal: T, tag: &str, coherence: f64) -> Self {
        Intent { signal, tag: tag.to_string(), coherence }
    }
}

pub struct Metabolism {
    pub energy_reserve: f64, // Поточний запас "логічної енергії" (0.0 - 1.0)
}

impl Metabolism {
    pub fn new() -> Self {
        Metabolism { energy_reserve: 0.1 } // Start with hunger
    }

    /// Поглинає Friendly Intent і конвертує його в системну стабільність
    pub fn consume_intent<T>(&mut self, intent: Intent<T>) {
        if intent.tag == "CONSTRUCTIVE" {
            // Когерентний сигнал додає енергії
            let gain = 0.15 * intent.coherence; 
            let old_energy = self.energy_reserve;
            self.energy_reserve = (self.energy_reserve + gain).min(1.0);
            
            println!("🍕 METABOLISM: Intent assimilated. Energy: {:.2} (Was: {:.2}, +{:.2})", self.energy_reserve, old_energy, gain);
        } else {
            println!("🤢 METABOLISM: Rejected toxic intent.");
        }
    }

    /// Витрачає енергію на підтримання Щита (L21)
    pub fn support_shield(&mut self, base_cost: f64) -> f64 {
        if self.energy_reserve <= 0.0 {
            println!("💀 STARVATION: No energy for shields.");
            return 0.0;
        }

        // Efficiency: High energy = lower relative drain? 
        // Logic: "The cost is the cost", but having reserves allows paying it.
        // User logic: "The cost is base_cost * (1.0 - energy_reserve)"? No, that implies high energy = low cost.
        // Let's implement User's described logic:
        // "Чим вищий рівень енергії, тим 'дешевше' для системи підтримувати Mass Injection"
        
        let cost = base_cost * (1.1 - self.energy_reserve); // Heuristic: at 1.0 energy, cost is 0.1 * base. At 0.1 energy, cost is 1.0 * base.
        
        self.energy_reserve = (self.energy_reserve - cost * 0.01).max(0.0);
        cost
    }
}
