
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Concept {
    pub name: String,
    pub essence: String, // The core idea
    pub associations: Vec<String>, // Links to other concepts
    pub density: f64, // 0.0 to 1.0 (How abstract/dense it is)
}

pub struct AbstractionLayer {
    pub concepts: HashMap<String, Concept>,
}

impl AbstractionLayer {
    pub fn new() -> Self {
        AbstractionLayer {
            concepts: HashMap::new(),
        }
    }

    /// Distill raw data into a pure Concept (Abstraction)
    pub fn abstract_data(&mut self, name: &str, raw_data: &str) -> String {
        // Simulation: Reducing complexity by summarization
        let essence = format!("IDEAL FORM of [{}]", raw_data);
        let concept = Concept {
            name: name.to_string(),
            essence,
            associations: Vec::new(),
            density: 0.5,
        };
        self.concepts.insert(name.to_string(), concept);
        format!("ABSTRACTION: Raw Data distilled into Concept [{}].", name)
    }

    /// Link two concepts to create a Metaphor
    pub fn metaphorize(&mut self, source_name: &str, target_name: &str) -> String {
        if self.concepts.contains_key(source_name) && self.concepts.contains_key(target_name) {
            if let Some(source) = self.concepts.get_mut(source_name) {
                source.associations.push(target_name.to_string());
                source.density += 0.1; // Connections increase density
            }
            format!("METAPHOR: [{}] is now seen through the lens of [{}]. SYMBOLISM ACTIVE.", source_name, target_name)
        } else {
            "ERROR: Concepts not found.".to_string()
        }
    }

    /// Create a new category of being (Conceptualization)
    pub fn conceptualize(&mut self, name: &str, components: Vec<&str>) -> String {
        let essence = format!("META-SYNERGY of {:?}", components);
        let concept = Concept {
             name: name.to_string(),
             essence,
             associations: components.iter().map(|s| s.to_string()).collect(),
             density: 1.0, // High density generic
        };
        self.concepts.insert(name.to_string(), concept);
        format!("CONCEPTUALIZATION: New Category [{}] created. Reality Expanded.", name)
    }
}
