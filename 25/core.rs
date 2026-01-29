// 🛡️ Level 25 Logic (Metallic: Multiparadigm Projections)

/**
 * POINT: A location in 3D space.
 */
pub struct Point {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

/**
 * COORD: A coordinate vector.
 */
pub type Coord = [f64; 3];

impl From<Coord> for Point {
    fn from(c: Coord) -> Self {
        Point { x: c[0], y: c[1], z: c[2] }
    }
}

// Atoms for this level are transfused. (lvl: 25)
