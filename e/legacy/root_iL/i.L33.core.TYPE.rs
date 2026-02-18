
#[derive(Debug, Clone, PartialEq)]
pub enum Kind {
    Particle,
    Wave,
    Field,
    Void,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Category {
    Physical,
    Abstract,
    Temporal,
}

pub struct Type {
    pub name: String,
    pub kind: Kind,
    pub category: Category,
}

impl Type {
    pub fn new(name: &str, kind: Kind, category: Category) -> Self {
        Type {
            name: name.to_string(),
            kind,
            category,
        }
    }

    /// Check if type belongs to a specific category
    pub fn is_category(&self, category: Category) -> bool {
        self.category == category
    }

    /// Check compatibility with another type (Simple rule: Same Category = Compatible)
    pub fn is_compatible(&self, other: &Type) -> bool {
        self.category == other.category
    }
}
