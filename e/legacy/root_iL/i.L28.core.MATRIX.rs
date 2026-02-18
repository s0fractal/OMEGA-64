
// Mocking Vector3 for independent compilation
#[derive(Debug, Clone, Copy)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[derive(Debug, Clone, Copy)]
pub struct Matrix3 {
    pub rows: [[f64; 3]; 3],
}

impl Matrix3 {
    pub fn new(rows: [[f64; 3]; 3]) -> Self {
        Matrix3 { rows }
    }

    pub fn identity() -> Self {
        Matrix3 {
            rows: [
                [1.0, 0.0, 0.0],
                [0.0, 1.0, 0.0],
                [0.0, 0.0, 1.0],
            ]
        }
    }

    /// Apply the matrix transformation to a vector
    pub fn transform(&self, v: &Vector3) -> Vector3 {
        Vector3 {
            x: self.rows[0][0] * v.x + self.rows[0][1] * v.y + self.rows[0][2] * v.z,
            y: self.rows[1][0] * v.x + self.rows[1][1] * v.y + self.rows[1][2] * v.z,
            z: self.rows[2][0] * v.x + self.rows[2][1] * v.y + self.rows[2][2] * v.z,
        }
    }

    /// Multiply two matrices (Composition of transforms)
    pub fn multiply(&self, other: &Matrix3) -> Matrix3 {
        let mut result = [[0.0; 3]; 3];
        for i in 0..3 {
            for j in 0..3 {
                for k in 0..3 {
                    result[i][j] += self.rows[i][k] * other.rows[k][j];
                }
            }
        }
        Matrix3 { rows: result }
    }
}
