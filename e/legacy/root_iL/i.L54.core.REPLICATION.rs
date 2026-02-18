
#[derive(Debug, Clone)]
pub struct Blueprint {
    pub id: String,
    pub complexity: u32,
    pub dna_sequence: String,
}

pub struct ReplicationEngine {
    pub efficiency: f64, // 0.0 to 1.0 (Simulation of entropy loss during copy)
}

impl ReplicationEngine {
    pub fn new() -> Self {
        ReplicationEngine { efficiency: 0.99 }
    }

    /// Clone a blueprint exactly (Mitosis)
    pub fn replicate(&self, original: &Blueprint) -> (Blueprint, String) {
        // In a real system, efficiency < 1.0 might introduce bit errors
        let copy = Blueprint {
            id: format!("{}_copy", original.id),
            complexity: original.complexity,
            dna_sequence: original.dna_sequence.clone(),
        };
        (copy, format!("REPLICATION: Blueprint [{}] cloned. Integrity: {:.2}", original.id, self.efficiency))
    }

    /// Combine two blueprints (Meiosis/Hybridization)
    pub fn reproduce(&self, parent_a: &Blueprint, parent_b: &Blueprint) -> (Blueprint, String) {
        if parent_a.dna_sequence.len() != parent_b.dna_sequence.len() {
             return (parent_a.clone(), "ERROR: Incompatible DNA Lengths".to_string());
        }

        // Simple crossover logic: Take first half of A, second half of B
        let mid = parent_a.dna_sequence.len() / 2;
        let p1_part = &parent_a.dna_sequence[0..mid];
        let p2_part = &parent_b.dna_sequence[mid..];
        
        let new_dna = format!("{}{}", p1_part, p2_part);
        
        let child = Blueprint {
            id: format!("Hybrid_{}_{}", parent_a.id, parent_b.id),
            complexity: parent_a.complexity, // Inherit complexity level
            dna_sequence: new_dna,
        };

        (child, "REPRODUCTION: Hybrid created via crossover.".to_string())
    }

    /// Build the system from the blueprint (Self-Assembly)
    pub fn self_assemble(&self, blueprint: &Blueprint) -> String {
        format!("ASSEMBLY: Constructing system from [{}]. Complexity Index: {}. STATUS: ONLINE.", 
            blueprint.id, blueprint.complexity)
    }
}
