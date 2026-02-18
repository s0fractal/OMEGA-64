
// Mocking Vector3 for independent compilation
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Vector3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

pub struct Trigger {
    pub threshold: f64,
    pub active: bool,
}

pub struct Event {
    pub id: String,
    pub location: Vector3,
}

pub struct Observer {
    pub logs: Vec<String>,
}

impl Trigger {
    pub fn new(threshold: f64) -> Self {
        Trigger { threshold, active: false }
    }

    /// Check if value exceeds threshold
    pub fn check(&mut self, value: f64) -> bool {
        if value > self.threshold {
            self.active = true;
            true
        } else {
            self.active = false;
            false
        }
    }
}

impl Observer {
    pub fn new() -> Self {
        Observer { logs: Vec::new() }
    }

    pub fn witness(&mut self, event: &Event) {
        self.logs.push(format!("Event[{}] at ({:?})", event.id, event.location));
    }
}
