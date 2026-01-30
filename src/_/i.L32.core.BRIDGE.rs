
// Mocking types
use std::collections::HashMap;

pub struct Interface {
    pub active: bool,
}

pub struct Map {
    pub registry: HashMap<String, u64>, // Logical ID -> Physical Address (mock)
}

pub struct Bridge {
    pub interface: Interface,
    pub map: Map,
}

impl Bridge {
    pub fn new() -> Self {
        Bridge {
            interface: Interface { active: true },
            map: Map { registry: HashMap::new() },
        }
    }

    /// Register a logical entity to a physical address
    pub fn bind(&mut self, id: &str, address: u64) {
        self.map.registry.insert(id.to_string(), address);
    }

    /// Resolve a logical ID to its physical address
    pub fn resolve(&self, id: &str) -> Option<&u64> {
        self.map.registry.get(id)
    }

    /// Simulate sending a signal across the bridge
    pub fn transfer(&self, payload: &str) -> String {
        if self.interface.active {
            format!("Transfer[{}]: OK", payload)
        } else {
            "Transfer: BLOCKED".to_string()
        }
    }
}
