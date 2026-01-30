
#[derive(Debug, Clone, PartialEq)]
pub enum Archetype {
    Hero,
    Shadow,
    Sage,
    Trickster,
    Void, // The Pre-Creation State
}

#[derive(Debug, Clone)]
pub struct Symbol {
    pub glyph: char,
    pub meaning: String,
    pub power: u8, // 0-255 Resonance
}

pub struct Pattern {
    pub sequence: Vec<Symbol>,
    pub archetype: Archetype,
    pub resonance_frequency: f64,
}

impl Pattern {
    pub fn new(archetype: Archetype) -> Self {
        Pattern {
            sequence: Vec::new(),
            archetype,
            resonance_frequency: 0.0,
        }
    }

    /// Compress a complex meaning into a single Symbol (Glyph)
    pub fn encode_symbol(&mut self, glyph: char, meaning: &str) {
        let sym = Symbol {
            glyph,
            meaning: meaning.to_string(),
            power: 100, // Default power
        };
        self.sequence.push(sym);
        self.recalculate_resonance();
    }

    /// Analyze the pattern to detect matching archetypes
    fn recalculate_resonance(&mut self) {
        // Mock logic: Resonance increases with pattern length
        self.resonance_frequency = self.sequence.len() as f64 * 10.5;
    }

    /// recognize if the pattern matches a known cosmic structure
    pub fn recognize(&self) -> String {
        match self.archetype {
            Archetype::Void => "VOID_PATTERN: Nullity detected.".to_string(),
            Archetype::Shadow => "SHADOW_PATTERN: Hidden entropy detected.".to_string(),
            Archetype::Hero => "HERO_PATTERN: Overcoming resistance.".to_string(),
            _ => "UNKNOWN_PATTERN".to_string(),
        }
    }
}
