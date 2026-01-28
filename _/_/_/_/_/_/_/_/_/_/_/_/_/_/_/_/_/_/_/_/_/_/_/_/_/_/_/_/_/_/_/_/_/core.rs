// 🛡️ Level 37 Logic (Metallic: Flow Control)

pub trait MetricSpace<T> {
    fn distance(a: &T, b: &T) -> f64;
}

pub fn is_neighbor<T, M>(a: &T, b: &T, radius: f64) -> bool 
where M: MetricSpace<T> {
    M::distance(a, b) <= radius
}

// Atoms for this level are transfused. (lvl: 37)
