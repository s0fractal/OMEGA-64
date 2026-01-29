// 🛡️ Level 18 Logic (Metallic: Multiparadigm Projections)

/**
 * TEMP: A measure of average kinetic energy in informational flow.
 */
pub struct Temp(pub f64);

/**
 * HEAT: Transfer of energy between systems.
 */
pub fn heat(t: &mut Temp, amount: f64) {
    t.0 += amount;
}

/**
 * COOL: Intentional reduction of systemic temperature.
 */
pub fn cool(t: &mut Temp, amount: f64) {
    t.0 -= amount;
}

// Atoms for this level are transfused. (lvl: 18)
