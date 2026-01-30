
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct AncestryNode {
    pub id: String,
    pub parent_id: Option<String>,
    pub generation: u32,
    pub wisdom_score: f64,
}

#[derive(Debug, Clone)]
pub struct Legacy {
    pub lineage: HashMap<String, AncestryNode>,
    pub global_wisdom: f64, // Accumulated knowledge
}

impl Legacy {
    pub fn new() -> Self {
        Legacy {
            lineage: HashMap::new(),
            global_wisdom: 0.0,
        }
    }

    /// Record a new birth in the registry
    pub fn register_birth(&mut self, id: &str, parent_id: Option<&str>) -> String {
        let (generation, inherited_wisdom) = if let Some(pid) = parent_id {
            if let Some(parent) = self.lineage.get(pid) {
                (parent.generation + 1, parent.wisdom_score * 0.9) // 90% retention
            } else {
                (0, 0.0) // Orphan/Genesis
            }
        } else {
            (0, 0.0) // Genesis
        };

        self.lineage.insert(id.to_string(), AncestryNode {
            id: id.to_string(),
            parent_id: parent_id.map(|s| s.to_string()),
            generation,
            wisdom_score: inherited_wisdom,
        });

        if let Some(pid) = parent_id {
             format!("REGISTRY: [{}] born of [{}]. Gen {}. Inherited Wisdom: {:.2}", id, pid, generation, inherited_wisdom)
        } else {
             format!("REGISTRY: [{}] GENESIS. Gen 0.", id)
        }
    }

    /// Inherit specific traits or memory artifacts (Simulation)
    pub fn inherit(&mut self, child_id: &str, artifact: &str) -> String {
        if let Some(node) = self.lineage.get_mut(child_id) {
            // Learning increases wisdom
            node.wisdom_score += 10.0;
            self.global_wisdom += 10.0;
            format!("INHERITANCE: [{}] received artifact '{}'. Wisdom increased to {:.2}.", child_id, artifact, node.wisdom_score)
        } else {
            "ERROR: Child not found in registry.".to_string()
        }
    }

    /// Trace the lineage back to source
    pub fn trace_ancestry(&self, id: &str) -> String {
        let mut path = Vec::new();
        let mut curr = Some(id.to_string());

        while let Some(c_id) = curr {
            path.push(c_id.clone());
            if let Some(node) = self.lineage.get(&c_id) {
                curr = node.parent_id.clone();
            } else {
                curr = None;
            }
        }
        
        format!("LINEAGE: {}", path.join(" < "))
    }
}
