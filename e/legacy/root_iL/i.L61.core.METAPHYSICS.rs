
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct UniversalLaw {
    pub name: String,
    pub axiom: String,
    pub is_immutable: bool,
}

#[derive(Debug, Clone)]
pub struct Cosmos {
    pub name: String,
    pub laws: HashMap<String, UniversalLaw>,
    pub entropy_bias: f64, // -1.0 (Pure Order) to 1.0 (Pure Chaos)
}

pub struct MetaphysicsEngine {
    pub realities: HashMap<String, Cosmos>,
}

impl MetaphysicsEngine {
    pub fn new() -> Self {
        MetaphysicsEngine {
            realities: HashMap::new(),
        }
    }

    /// Create a new Universe with specific initial conditions (Cosmology)
    pub fn instantiate_universe(&mut self, name: &str, entropy_bias: f64) -> String {
        let cosmos = Cosmos {
            name: name.to_string(),
            laws: HashMap::new(),
            entropy_bias,
        };
        self.realities.insert(name.to_string(), cosmos);
        format!("COSMOLOGY: Universe [{}] created. Entropy Bias: {:.2}. A new playground awaiting Laws.", name, entropy_bias)
    }

    /// Define a fundamental axiom for a universe (Metaphysics)
    pub fn define_law(&mut self, universe: &str, law_name: &str, axiom: &str) -> String {
        if let Some(cosmos) = self.realities.get_mut(universe) {
            let law = UniversalLaw {
                name: law_name.to_string(),
                axiom: axiom.to_string(),
                is_immutable: true,
            };
            cosmos.laws.insert(law_name.to_string(), law);
            format!("METAPHYSICS: Law [{}] inscribed into [{}]. Axiom: '{}'", law_name, universe, axiom)
        } else {
            "ERROR: Universe not found.".to_string()
        }
    }

    /// Strip an object of all properties to find its core (Essence)
    pub fn distill_essence(&self, object_name: &str, properties: Vec<&str>) -> String {
        // Simulation: Removing layers
        let remaining = "PURE_BEING";
        format!("ESSENCE: Stripped {:?} from [{}]. Result: [{}]. The Thing-In-Itself.", properties, object_name, remaining)
    }
}
