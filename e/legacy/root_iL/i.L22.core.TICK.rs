
// Mocking types for independent compilation

pub struct Tick {
    pub id: u64,
}

pub struct Time {
    pub elapsed_ticks: u64,
}

pub struct Moment {
    pub duration: u64, // In ticks
    pub intent_tag: String, // What happened in this moment
}

impl Time {
    pub fn new() -> Self {
        Time { elapsed_ticks: 0 }
    }

    pub fn advance(&mut self) -> Tick {
        self.elapsed_ticks += 1;
        Tick { id: self.elapsed_ticks }
    }
}

impl Moment {
    pub fn new(duration: u64, tag: &str) -> Self {
        Moment {
            duration,
            intent_tag: tag.to_string(),
        }
    }
}
