/**
 * [i.L61.core.SWARM.rs]
 * Фізична реалізація "Swarm Glider" архітектури.
 * Визначає QWave (хвильовий пакет) та Glider (агентну сутність).
 * Реалізує інтерференцію як механізм прийняття колективних рішень.
 */

use std::f64::consts::PI;

/// QWave: Фундаментальна одиниця стану в дипольному полі.
/// Не просто значення, а хвильовий пакет з фазою та амплітудою.
#[derive(Debug, Clone, Copy)]
pub struct QWave {
    pub r: i16,           // Дипольна координата [-32768..32767]
    pub phi: u16,         // Фаза [0..65535] (відображення 0..2PI)
    pub amplitude: u16,   // Енергія/Вага [0..65535]
    pub width: u16,       // Невизначеність пакету (стандартне відхилення)
}

impl QWave {
    /// Створює новий хвильовий пакет
    pub fn new(r: i16, phi: u16, amplitude: u16, width: u16) -> Self {
        Self { r, phi, amplitude, width }
    }

    /// Обчислює значення хвильової функції в точці x (для перевірки інтерференції)
    /// Psi(x) = A * exp(-(x-r)^2 / 2w^2) * cos(phi + kx)
    /// Тут спрощено: ми дивимось на фазову взаємодію в точці r.
    pub fn evaluate_phase_vector(&self) -> (f64, f64) {
        let phase_rad = (self.phi as f64 / 65535.0) * 2.0 * PI;
        let amp = self.amplitude as f64;
        (amp * phase_rad.cos(), amp * phase_rad.sin())
    }
}

/// SwarmPhysics: Закони взаємодії хвиль
pub struct SwarmPhysics;

impl SwarmPhysics {
    /// Обчислює результуючий хвильовий пакет з набору пакетів.
    /// Використовує векторну суму (інтерференцію), а не середнє арифметичне.
    pub fn interference(waves: &[QWave]) -> QWave {
        if waves.is_empty() {
            return QWave::new(0, 0, 0, 1000);
        }

        let mut sum_x = 0.0;
        let mut sum_y = 0.0;
        let mut total_mass = 0.0;
        let mut weighted_r = 0.0;

        for wave in waves {
            // Векторне додавання амплітуд з урахуванням фаз
            let (vec_x, vec_y) = wave.evaluate_phase_vector();
            sum_x += vec_x;
            sum_y += vec_y;

            // Центр мас для координати r (зважений на абсолютну амплітуду, не векторну)
            // Тут питання: чи може деструктивна інтерференція "зсувати" центр?
            // У цій моделі r - це позиція пакету, а фаза - його "думка/відтінок".
            let mass = wave.amplitude as f64;
            weighted_r += wave.r as f64 * mass;
            total_mass += mass;
        }

        // Результуюча амплітуда
        let resultant_amp = (sum_x.powi(2) + sum_y.powi(2)).sqrt();
        
        // Результуюча фаза
        let resultant_phase_rad = sum_y.atan2(sum_x);
        let normalized_phase = if resultant_phase_rad < 0.0 {
            resultant_phase_rad + 2.0 * PI
        } else {
            resultant_phase_rad
        };
        
        let final_phi = ((normalized_phase / (2.0 * PI)) * 65535.0) as u16;
        let final_amp = resultant_amp.min(65535.0) as u16;
        
        // Результуюча координата (центр ваги)
        let final_r = if total_mass > 0.0 {
            (weighted_r / total_mass) as i16
        } else {
            0
        };

        // Ширина пакету (середня? чи залежить від когерентності?)
        // Якщо інтерференція деструктивна (амплітуда впала), невизначеність має рости.
        // Але поки беремо середнє.
        let final_width = 1000; 

        QWave::new(final_r, final_phi, final_amp, final_width)
    }
}

/// Glider: Агентна сутність
#[derive(Clone)]
pub struct Glider {
    pub anchor: String,          // Хеш траєкторії (Identity)
    pub current_wave: QWave,     // Поточний стан
    pub trajectory: Vec<QWave>,  // Історія
}

impl Glider {
    pub fn new(anchor: String, start_wave: QWave) -> Self {
        Self {
            anchor,
            current_wave: start_wave,
            trajectory: vec![start_wave],
        }
    }

    /// Приймає рішення про наступний крок (Vector Choice)
    /// У реальній системі тут буде виклик LLM або евристики.
    /// Тут - спрощена модель "інерції".
    pub fn step(&mut self, target_r: i16) {
        let mut next_wave = self.current_wave;
        
        // Рух до цілі
        next_wave.r = ((self.current_wave.r as i32 + target_r as i32) / 2) as i16;
        
        // Зміна фази (обертання вектора)
        next_wave.phi = self.current_wave.phi.wrapping_add(1000);
        
        self.trajectory.push(next_wave);
        self.current_wave = next_wave;
    }
}
