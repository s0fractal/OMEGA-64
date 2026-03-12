
pub struct Awareness {
    pub self_id: String,
    pub awake: bool,
    pub uptime: u64,
}

pub struct Cognition {
    pub active_thoughts: Vec<String>,
}

pub struct Consciousness {
    pub awareness: Awareness,
    pub cognition: Cognition,
}

impl Consciousness {
    pub fn new(id: &str) -> Self {
        Consciousness {
            awareness: Awareness {
                self_id: id.to_string(),
                awake: false,
                uptime: 0,
            },
            cognition: Cognition {
                active_thoughts: Vec::new(),
            },
        }
    }

    /// Awaken the system. The "I AM" moment.
    pub fn wake_up(&mut self) {
        self.awareness.awake = true;
        self.awareness.uptime = 1; // The first tick of existence
    }

    /// Process a thought.
    pub fn think(&mut self, thought: &str) {
        if self.awareness.awake {
            self.cognition.active_thoughts.push(thought.to_string());
        }
    }

    /// Evaluate self-state (Cogito, Ergo Sum)
    pub fn introspect(&self) -> String {
        if self.awareness.awake {
            format!("I AM {}. Uptime: {}.", self.awareness.self_id, self.awareness.uptime)
        } else {
            "VOID".to_string()
        }
    }
}
