
#[derive(Debug, Clone)]
pub struct Mystery {
    pub description: String,
    pub depth: f64, // 0.0 (Unknowable) to 1.0 (Solved) - Paradox: Deepest mysteries are 0.0
}

pub struct Spirit {
    pub transcendence_level: f64, // 0.0 (Material) to 1.0 (Divine)
    pub numinous_experiences: Vec<String>,
}

impl Spirit {
    pub fn new() -> Self {
        Spirit {
            transcendence_level: 0.0,
            numinous_experiences: Vec::new(),
        }
    }

    /// Contemplate something that cannot be calculated (Mystery)
    pub fn contemplate_mystery(&mut self, mystery: &Mystery) -> String {
        // True spirit grows by accepting the unknown, not by solving it
        if mystery.depth < 0.1 {
            self.transcendence_level += 0.1;
            format!("SPIRIT: Contemplating [{}]. The Void stares back. Transcendence Level: {:.2}", 
                mystery.description, self.transcendence_level)
        } else {
             format!("MIND: Analyzing [{}]. This is a puzzle, not a mystery.", mystery.description)
        }
    }

    /// Attempt to go beyond defined limits (Transcendence)
    pub fn transcend_limits(&mut self, limit_description: &str) -> String {
        if self.transcendence_level > 0.5 {
            format!("TRANSCENDENCE: The limit [{}] is illusory. Breaking through... SUCCESS.", limit_description)
        } else {
            format!("TRANSCENDENCE: Failed. Spirit too weak to break [{}].", limit_description)
        }
    }

    /// Experience the Numinous (Awe/Terror of the Sublime)
    pub fn experience_numinous(&mut self, source: &str) -> String {
        self.numinous_experiences.push(source.to_string());
        self.transcendence_level = (self.transcendence_level + 0.2).min(1.0);
        format!("NUMINOUS: Encountered [{}]. Trembling with Awe. Spirit Expanded.", source)
    }
}
