
// Mocking types for independent compilation
// use crate::core::field::Field;
// @spectral: CHORD::interference(h1,h2,h3)

#[derive(Clone, Debug, Copy)]
pub struct Wave {
    pub frequency: f64,
    pub amplitude: f64,
    pub phase: f64,
}

pub struct Chord {
    pub harmonics: Vec<Wave>,
}

impl Chord {
    pub fn new(harmonics: Vec<Wave>) -> Self {
        Chord { harmonics }
    }

    /// Обчислює загальну амплітуду акорду в точці часу t
    pub fn resonate(&self, t: f64) -> f64 {
        self.harmonics.iter()
            .map(|w| w.amplitude * (2.0 * std::f64::consts::PI * w.frequency * t + w.phase).sin())
            .sum()
    }

    /// Перевіряє гармонійну стабільність (відсутність дисонансів)
    pub fn is_stable(&self) -> bool {
        // Спрощена логіка: якщо частоти кратні основній (першій), акорд стабільний
        if let Some(fundamental) = self.harmonics.first() {
            self.harmonics.iter().all(|w| {
                let ratio = w.frequency / fundamental.frequency;
                (ratio - ratio.round()).abs() < 0.01 // Перевірка на цілочисельність
            })
        } else {
            true // Пустий акорд стабільний (тиша)
        }
    }
}
