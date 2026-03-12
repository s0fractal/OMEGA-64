
#[derive(Debug, Clone, PartialEq)]
pub struct Phase {
    pub angle: f64, // 0.0 to 360.0 degrees
}

#[derive(Debug, Clone)]
pub struct NodeState {
    pub id: String,
    pub phase: Phase,
}

pub struct Coherence {
    pub stability: f64, // 0.0 to 1.0 (Unity metric)
}

pub struct Synchronization {
    pub master_phase: Phase,
    pub nodes: Vec<NodeState>,
    pub coherence: Coherence,
}

impl Synchronization {
    pub fn new() -> Self {
        Synchronization {
            master_phase: Phase { angle: 0.0 },
            nodes: Vec::new(),
            coherence: Coherence { stability: 1.0 },
        }
    }

    /// Register a node for synchronization
    pub fn register_node(&mut self, id: &str, angle: f64) {
        self.nodes.push(NodeState {
            id: id.to_string(),
            phase: Phase { angle },
        });
        self.recalculate_coherence();
    }

    /// Calculate global coherence based on phase alignment
    fn recalculate_coherence(&mut self) {
        if self.nodes.is_empty() {
            self.coherence.stability = 1.0;
            return;
        }

        let total_deviation: f64 = self.nodes.iter()
            .map(|n| (n.phase.angle - self.master_phase.angle).abs())
            .sum();
        
        // Simple coherence metric: 1.0 minus average deviation normalized
        let avg_dev = total_deviation / self.nodes.len() as f64;
        self.coherence.stability = (1.0 - (avg_dev / 180.0)).max(0.0);
    }

    /// Force alignment of all nodes to the master phase (Laser Mode)
    pub fn align(&mut self) -> String {
        for node in &mut self.nodes {
            node.phase.angle = self.master_phase.angle;
        }
        self.recalculate_coherence();
        format!("LASER_FOCUS: All nodes aligned to {:.1} deg. Coherence: {:.2}", 
            self.master_phase.angle, self.coherence.stability)
    }

    /// Check current status
    pub fn status(&self) -> String {
        if self.coherence.stability > 0.99 {
            "STATE: COHERENT (Laser)".to_string()
        } else if self.coherence.stability > 0.5 {
            "STATE: FLUID (Wave)".to_string()
        } else {
            "STATE: DECOHERENT (Noise)".to_string()
        }
    }
}
