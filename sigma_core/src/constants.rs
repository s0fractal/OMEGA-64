//! Defines system-wide constants and enumerations for the OMEGA-64 Sigma Core.

/// The maximum number of atoms supported by the continuous Memory Matrix.
pub const MAX_ATOMS: usize = 500_000;

/// Spatial Hash Grid dimensions
pub const GRID_WIDTH: i32 = 140;
pub const GRID_HEIGHT: i32 = 80;
pub const GRID_SIZE: usize = (GRID_WIDTH * GRID_HEIGHT) as usize;
pub const CELL_CAPACITY: usize = 32;

/// Maximum boundaries for execution scopes
pub const MAX_PC: u8 = 64;
pub const MAX_EXECUTION_STEPS: usize = 64;
pub const ATOM_LOGIC_SIZE: usize = 64;

/// Energy representation scaling factor (Fractional to Integer boundary mapping via Deno)
pub const ENERGY_SCALE: i32 = 1000;

/// Strongly typed roles for LambdaVM Atoms
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomRole {
    None = 0,
    Guardian = 1,
    Architect = 2,
    Artisan = 3,
    Parasite = 4,
    Mitochondria = 5,
    MetazoanFlag = 0x80,
}

impl AtomRole {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Guardian,
            2 => Self::Architect,
            3 => Self::Artisan,
            4 => Self::Parasite,
            5 => Self::Mitochondria,
            0x80 => Self::MetazoanFlag,
            _ => Self::None,
        }
    }
}
