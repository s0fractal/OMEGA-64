
#[derive(Debug, Clone)]
pub struct Gene {
    pub trait_id: String,
    pub value: f64,
}

#[derive(Debug, Clone)]
pub struct Organism {
    pub id: String,
    pub dna: Vec<Gene>,
    pub fitness: f64,
    pub generation: u32,
}

pub struct Evolution {
    pub population: Vec<Organism>,
    pub mutation_rate: f64,
    pub generation_count: u32,
}

impl Evolution {
    pub fn new() -> Self {
        Evolution {
            population: Vec::new(),
            mutation_rate: 0.1,
            generation_count: 0,
        }
    }

    /// Add an organism to the gene pool
    pub fn spawn(&mut self, id: &str, traits: Vec<Gene>) {
        self.population.push(Organism {
            id: id.to_string(),
            dna: traits,
            fitness: 0.0,
            generation: self.generation_count,
        });
    }

    /// Simulate fitness evaluation based on environment
    pub fn evaluate_fitness(&mut self) -> String {
        for org in &mut self.population {
            // Mock logic: Sum of gene values determines fitness
            let score: f64 = org.dna.iter().map(|g| g.value).sum();
            org.fitness = score;
        }
        "FITNESS_EVALUATED: Population Scored.".to_string()
    }

    /// Introduce controlled chaos (Mutation)
    pub fn mutate(&mut self, org_idx: usize) -> String {
        if let Some(org) = self.population.get_mut(org_idx) {
            org.generation += 1;
            // Mutate first gene for simplicity
            if let Some(gene) = org.dna.get_mut(0) {
                let original = gene.value;
                gene.value += self.mutation_rate; // Positive mutation
                return format!("MUTATION: Organism [{}] Gene [{}] mutated ({:.2} -> {:.2}). Gen {}", 
                    org.id, gene.trait_id, original, gene.value, org.generation);
            }
        }
        "ERROR: Mutation Failed.".to_string()
    }

    /// Evolve the population (Adaptation)
    pub fn adapt(&mut self) -> String {
        self.generation_count += 1;
        // Natural Selection: Remove weaklings (fitness < 1.0)
        let initial_count = self.population.len();
        self.population.retain(|org| org.fitness >= 1.0);
        let final_count = self.population.len();
        
        format!("ADAPTATION: Generation {}. Culled {} weak organisms. Survivors: {}.", 
            self.generation_count, initial_count - final_count, final_count)
    }
}
