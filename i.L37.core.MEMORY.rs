
pub struct Buffer {
    pub data: Vec<String>,
}

pub struct Storage {
    pub archive: Vec<String>,
}

pub struct Memory {
    pub buffer: Buffer,
    pub storage: Storage,
}

impl Memory {
    pub fn new() -> Self {
        Memory {
            buffer: Buffer { data: Vec::new() },
            storage: Storage { archive: Vec::new() },
        }
    }

    /// Hold distinct thought in short-term buffer (Short-Term Memory)
    pub fn memorize(&mut self, thought: &str) {
        self.buffer.data.push(thought.to_string());
    }

    /// Commit buffer to long-term storage (Long-Term Consolidation)
    pub fn commit(&mut self) {
        self.storage.archive.append(&mut self.buffer.data);
    }

    /// Retrieve from deep storage
    pub fn recall(&self, index: usize) -> Option<&String> {
        self.storage.archive.get(index)
    }
    
    /// Clear the short-term buffer (Forgetting/Flush)
    pub fn wipe_buffer(&mut self) {
        self.buffer.data.clear();
    }
}
