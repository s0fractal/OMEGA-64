pub fn resonance_deep(w1: f64, w2: f64) -> f64 {
    if w1 == w2 { w1 * 2.0 } else { w1 + w2 }
}
