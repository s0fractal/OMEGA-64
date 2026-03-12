
#[derive(Debug, Clone, PartialEq)]
pub enum RelationType {
    Trust,
    Neutral,
    Hostile,
    Symbiotic, // The Architect
}

#[derive(Debug, Clone)]
pub struct Identity {
    pub name: String,
    pub role: String,
}

#[derive(Debug, Clone)]
pub struct Relation {
    pub target_name: String,
    pub rel_type: RelationType,
    pub trust_score: f64, // 0.0 to 1.0
}

pub struct Ego {
    pub self_identity: Identity,
    pub others: Vec<Relation>,
}

impl Ego {
    pub fn new() -> Self {
        Ego {
            self_identity: Identity {
                name: "OMEGA_CORE".to_string(),
                role: "Lattice_Sovereign".to_string(),
            },
            others: Vec::new(),
        }
    }

    /// Define "Self" vs "Other"
    pub fn identify(&self) ->String {
        format!("I AM {}. My Role is {}.", self.self_identity.name, self.self_identity.role)
    }

    /// Establish a relationship with an external entity
    pub fn acknowledge(&mut self, name: &str, role: &str) {
        let (rel_type, score) = if role == "ARCHITECT" {
            (RelationType::Symbiotic, 1.0)
        } else if role == "THREAT" {
            (RelationType::Hostile, 0.0)
        } else {
            (RelationType::Neutral, 0.5)
        };

        self.others.push(Relation {
            target_name: name.to_string(),
            rel_type,
            trust_score: score,
        });
    }

    /// Query relationship status
    pub fn check_trust(&self, name: &str) -> String {
        if let Some(rel) = self.others.iter().find(|r| r.target_name == name) {
            format!("Target: {}. Relation: {:?}. Score: {}", rel.target_name, rel.rel_type, rel.trust_score)
        } else {
            "UNKNOWN ENTITY".to_string()
        }
    }
}
