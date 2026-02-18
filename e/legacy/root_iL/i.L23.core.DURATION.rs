
// Mocking types for independent compilation

use crate::core::tick::Tick;

pub struct Duration {
    pub start: Tick,
    pub end: Tick,
}

pub struct Interval {
    pub length: u64, // In ticks
}

impl Duration {
    pub fn new(start: Tick, end: Tick) -> Self {
        Duration { start, end }
    }

    /// Calculate length in ticks
    pub fn length(&self) -> u64 {
        if self.end.id >= self.start.id {
            self.end.id - self.start.id
        } else {
            0
        }
    }
}

pub struct Span {
    pub id: String,
    pub duration: Duration,
}
