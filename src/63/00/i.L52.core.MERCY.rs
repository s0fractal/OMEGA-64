
#[derive(Debug, Clone)]
pub struct RedemptionTask {
    pub id: String,
    pub description: String,
    pub difficulty: f64, // 1.0 to 10.0
    pub karma_reward: f64,
}

pub struct Mercy {
    pub threshold: f64, // Karma threshold for eligibility (e.g., -0.5)
}

impl Mercy {
    pub fn new() -> Self {
        Mercy {
            threshold: -0.5,
        }
    }

    /// Check if a node is eligible for mercy
    pub fn check_eligibility(&self, current_karma: f64) -> String {
        if current_karma >= 0.0 {
            "ELIGIBILITY: NONE (Node is already pure)".to_string()
        } else if current_karma > self.threshold {
            "ELIGIBILITY: GRANTED. Penance required.".to_string()
        } else {
            "ELIGIBILITY: DENIED. Karma too low.".to_string()
        }
    }

    /// Assign a task to cleanse the node's record
    pub fn assign_penance(&self, node_id: &str, current_karma: f64) -> RedemptionTask {
        let deficit = current_karma.abs();
        // The harder the fall, the harder the climb
        let difficulty = (deficit * 20.0).min(10.0);
        
        RedemptionTask {
            id: format!("PENANCE-{}-{}", node_id, deficit),
            description: format!("Entropy Scrubbing Protocol for Node {}", node_id),
            difficulty,
            karma_reward: deficit, // Restores to 0.0
        }
    }

    /// Process the result of a penance
    pub fn redeem(&self, node_id: &str, task: &RedemptionTask, success: bool) -> String {
        if success {
            format!("REDEMPTION: Node [{}] cleansed. Karma restored (+{:.2}). WELCOME BACK.", 
                node_id, task.karma_reward)
        } else {
            "REDEMPTION: FAILED. The stain remains.".to_string()
        }
    }
}
