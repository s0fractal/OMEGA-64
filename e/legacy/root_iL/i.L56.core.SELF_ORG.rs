pub fn self_org(entropy: f64, complexity: f64) -> f64 {
    complexity / (entropy + 1.0)
}
