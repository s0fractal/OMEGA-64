// 🛡️ Level 22 Logic (Metallic: Multiparadigm Projections)

/**
 * MASS: The informational density of an object.
 */
pub struct Mass(pub f64);

/**
 * GRAVITY: The attraction force between two informational masses.
 */
pub fn gravity(m1: Mass, m2: Mass, distance: f64) -> f64 {
    if distance == 0.0 { return 0.0; }
    (m1.0 * m2.0) / distance.powi(2)
}

/**
 * WEIGHT: The effective priority of an object within a gravitational field.
 */
pub fn weight(m: Mass, g: f64) -> f64 {
    m.0 * g
}

// Atoms for this level are transfused. (lvl: 22)
