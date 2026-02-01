
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct Rank(pub u8);

impl Rank {
    pub fn new(val: u8) -> Self {
        Rank(val.min(64)) // Max rank 64 (The Lattice limit)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Dormant,   // 0
    Background, // 1
    Standard,  // 2
    Urgent,    // 3
    Critical,  // 4 (Interrupt)
}

pub struct Order {
    pub id: String,
    pub priority: Priority,
    pub rank: Rank,
}

impl Order {
    pub fn new(id: &str, priority: Priority, rank: u8) -> Self {
        Order {
            id: id.to_string(),
            priority,
            rank: Rank::new(rank),
        }
    }

    /// Check if this order overrides another
    pub fn overrides(&self, other: &Order) -> bool {
        if self.priority > other.priority {
            true
        } else if self.priority == other.priority {
            self.rank > other.rank
        } else {
            false
        }
    }
}
