
pub struct Neuron {
    pub weights: Vec<f64>, // Синаптичні ваги (L08)
    pub threshold: f64,    // Поріг активації
}

impl Neuron {
    pub fn new(weights: Vec<f64>, threshold: f64) -> Self {
        Neuron { weights, threshold }
    }

    /// Обчислює активацію: перетворює вхідні сигнали на когнітивний імпульс
    pub fn activate(&self, inputs: &Vec<f64>) -> f64 {
        // Зважена сума інтенту
        let sum: f64 = inputs.iter()
            .zip(self.weights.iter())
            .map(|(i, w)| i * w)
            .sum();

        if sum > self.threshold {
            // println!("💡 NEURON FIRE: Input detected (Sum: {:.2} > {:.2})", sum, self.threshold);
            1.0 // Імпульс пройдено (Cognition Successful)
        } else {
            // println!("zzz NEURON SILENCE: Input ignored (Sum: {:.2} <= {:.2})", sum, self.threshold);
            0.0 // Сигнал згасає
        }
    }
}
