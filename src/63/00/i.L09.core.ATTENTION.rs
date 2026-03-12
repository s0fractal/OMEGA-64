
// Mocking Force for standalone compilation or assume import
// use crate::core::force::Force;

pub struct Attention {
    pub focus_point: f64, // Точка максимального фокусу (L09) (e.g. 0.0 to 1.0 range, or arbitrary metric)
    pub sensitivity: f64, // Чутливість фільтра
}

impl Attention {
    pub fn new(focus_point: f64, sensitivity: f64) -> Self {
        Attention { focus_point, sensitivity }
    }

    /// Виконує фокусування на конкретному аспекті інтенту
    /// input: Значення сигналу/інтенту
    /// filter: Замикання, що визначає "цікавість" сигналу
    pub fn focus<F>(&self, input: f64, filter: F) -> f64
    where F: Fn(f64) -> bool 
    {
        if filter(input) {
            // Якщо сигнал у фокусі, ми його підсилюємо
            // Apply sensitivity as a gain factor
            let amplified = input * (1.0 + self.sensitivity);
            // println!("🔦 ATTENTION: Focused on signal {:.4} -> {:.4}", input, amplified);
            amplified
        } else {
            // Поза фокусом сигнал перетворюється на мінімальний фоновий тиск
            // println!("zzz ATTENTION: Ignored signal {:.4}", input);
            0.01 
        }
    }
}
