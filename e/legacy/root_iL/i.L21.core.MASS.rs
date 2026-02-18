
// use crate::core::empathy::Empathy; // To be resolved in mod structure

pub struct Mass {
    pub base_priority: f64, // L63 -> 65535, L00 -> 0 
}

impl Mass {
    /// Обчислює "Важку Масу" на основі резонансу емпатії
    pub fn calculate_hardened_mass<E: Empathy>(&self, other: &Self, empathy_context: &E) -> f64 {
        let distance = empathy_context.distance(self, other);
        let resonance = 1.0 - distance;

        // Експоненційне загартування: резонанс стає експонентою для зміцнення бази
        // Ми використовуємо e^(2 * resonance), щоб при ідеальному резонансі (1.0) 
        // маса зростала приблизно в 7.3 рази (e^2), створюючи гравітаційний замок.
        let hardening_factor = (2.0 * resonance).exp();

        self.base_priority * hardening_factor
    }
}
