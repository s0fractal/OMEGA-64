pub fn gravity(m1: Mass, m2: Mass, distance: f64) -> f64 {
    if distance == 0.0 { return 0.0; }
    (m1.0 * m2.0) / distance.powi(2)
}
