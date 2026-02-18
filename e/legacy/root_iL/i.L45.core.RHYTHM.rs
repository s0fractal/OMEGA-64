
#[derive(Debug, Clone, PartialEq)]
pub enum Period {
    Active,
    Rest,
    Calibration, // Self-Optimization
    Void,        // Deep Sleep / Reboot
}

#[derive(Debug, Clone)]
pub struct Cycle {
    pub name: String,
    pub duration: u64,
    pub current_tick: u64,
}

pub struct Rhythm {
    pub current_period: Period,
    pub heartbeat: u64, // Global Tick
    pub cycles: Vec<Cycle>,
}

impl Rhythm {
    pub fn new() -> Self {
        Rhythm {
            current_period: Period::Active,
            heartbeat: 0,
            cycles: vec![Cycle {
                name: "Alpha_Wave".to_string(), // Main operational cycle
                duration: 100,
                current_tick: 0,
            }],
        }
    }

    /// Advance the rhythm by one tick
    pub fn tick(&mut self) -> String {
        self.heartbeat += 1;
        let mut status = "TICK".to_string();

        for cycle in &mut self.cycles {
            cycle.current_tick += 1;
            
            // Check for phase transitions
            if cycle.current_tick >= cycle.duration {
                cycle.current_tick = 0;
                status = self.transition_phase();
            }
        }
        
        // Return state summary
        format!("Heartbeat: {}. Phase: {:?}. Event: {}", self.heartbeat, self.current_period, status)
    }

    /// Handle automatic phase transitions based on rhythm
    fn transition_phase(&mut self) -> String {
        self.current_period = match self.current_period {
            Period::Active => Period::Rest,
            Period::Rest => Period::Calibration,
            Period::Calibration => Period::Active,
            Period::Void => Period::Active, 
        };
        format!("PHASE_SHIFT -> {:?}", self.current_period)
    }

    /// Force a specific period (e.g., emergency Rest)
    pub fn set_period(&mut self, period: Period) {
        self.current_period = period;
    }
}
