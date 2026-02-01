
// Mocking types for independent compilation
// In a real scenario, this would import Vector3 from L26

#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

pub struct Product;

impl Product {
    /// Scalar Product (Dot): Measures alignment between two intents
    /// Returns > 0 if aligned, < 0 if opposed, 0 if orthogonal
    pub fn dot(a: &Vector3, b: &Vector3) -> f64 {
        a.x * b.x + a.y * b.y + a.z * b.z
    }

    /// Vector Product (Cross): Emergent force perpendicular to both inputs
    /// Used to generate new dimensions of intent
    pub fn cross(a: &Vector3, b: &Vector3) -> Vector3 {
        Vector3 {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x,
        }
    }
}
