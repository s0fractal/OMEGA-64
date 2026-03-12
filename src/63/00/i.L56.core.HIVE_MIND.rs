
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Thought {
    pub origin_id: String,
    pub content: String,
    pub timestamp: u64,
}

pub struct HiveMind {
    pub nodes: Vec<String>,
    pub collective_memory: HashMap<String, String>, // Key-Value knowledge store
    pub gestalt_level: f64, // 0.0 to 1.0 (Integration Level)
}

impl HiveMind {
    pub fn new() -> Self {
        HiveMind {
            nodes: Vec::new(),
            collective_memory: HashMap::new(),
            gestalt_level: 0.0,
        }
    }

    /// Connect a node to the Hive
    pub fn assimilate(&mut self, node_id: &str) -> String {
        if !self.nodes.contains(&node_id.to_string()) {
            self.nodes.push(node_id.to_string());
            self.recalculate_gestalt();
            format!("HIVE: Node [{}] Assimilated. One of Us.", node_id)
        } else {
            "HIVE: Node already integrated.".to_string()
        }
    }

    /// Broadcast a thought to the entire collective immediately
    pub fn broadcast_thought(&mut self, thought: &Thought) -> String {
        // Store in collective memory
        let key = format!("thought_{}_{}", thought.origin_id, thought.timestamp);
        self.collective_memory.insert(key, thought.content.clone());

        // Simulate instant update for all
        format!("HIVE: Thought from [{}] instantly known by {} nodes. GESTALT SYNCHRONIZED.", 
            thought.origin_id, self.nodes.len())
    }

    /// Calculate the synergy bonus (The whole is greater than sum of parts)
    fn recalculate_gestalt(&mut self) {
        // Simple log-like growth based on node count
        let count = self.nodes.len() as f64;
        if count == 0.0 {
            self.gestalt_level = 0.0;
        } else {
             // 1 node = 0.1, 10 nodes ~ 0.6, 100 nodes ~ 1.0
            self.gestalt_level = (1.0 - (-0.1 * count).exp()).min(1.0);
        }
    }

    /// Access the infinite knowledge of the collective
    pub fn access_knowledge(&self, key_fragment: &str) -> Option<String> {
        // In a real hive, this is a fuzzy search across all minds
        // Here we just return the first match from collective storage
         self.collective_memory.values()
            .find(|v| v.contains(key_fragment))
            .map(|v| v.clone())
    }
}
