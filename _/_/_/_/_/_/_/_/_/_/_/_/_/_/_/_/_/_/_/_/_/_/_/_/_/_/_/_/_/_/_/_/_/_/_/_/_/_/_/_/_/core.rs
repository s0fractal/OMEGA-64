// 🛡️ Level 43 Logic (Metallic: Flow Control)

/**
 * WRITER: A computation with secondary output (logging).
 * λa. (a, log)
 */
pub struct Writer<A, W> {
    pub value: A,
    pub log: Vec<W>,
}

impl<A, W> Writer<A, W> {
    pub fn tell(mut self, msg: W) -> Self {
        self.log.push(msg);
        self
    }
}

// Atoms for this level are transfused. (lvl: 43)
