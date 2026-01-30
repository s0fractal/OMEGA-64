
// Mocking types for independent compilation

#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
    pub x: f64, // Component 1 (e.g., Entropy Alignment)
    pub y: f64, // Component 2 (e.g., Mass Impact)
    pub z: f64, // Component 3 (e.g., Temporal Velocity)
}

pub struct Magnitude {
    pub value: f64,
}

pub struct Direction {
    pub vector: Vector3, // Normalized vector
}

impl Vector3 {
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Vector3 { x, y, z }
    }

    pub fn magnitude(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2) + self.z.powi(2)).sqrt()
    }

    pub fn normalize(&self) -> Vector3 {
        let mag = self.magnitude();
        if mag == 0.0 {
            Vector3 { x: 0.0, y: 0.0, z: 0.0 }
        } else {
            Vector3 {
                x: self.x / mag,
                y: self.y / mag,
                z: self.z / mag,
            }
        }
    }

    pub fn scale(&self, factor: f64) -> Vector3 {
        Vector3 {
            x: self.x * factor,
            y: self.y * factor,
            z: self.z * factor,
        }
    }
}
