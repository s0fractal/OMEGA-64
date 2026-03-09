//! Sigma-Core Memory Layout
//! Byre-for-byte compatible with OMEGA-64 OFFSETS.ts

pub const MAX_ATOMS: usize = 100_000;
pub const SAFETY_BUFFER: usize = 8_000_000;
pub const GRID_W: usize = 140;
pub const GRID_H: usize = 80;
pub const GRID_CELLS: usize = GRID_W * GRID_H;

/// The central Data-Oriented memory matrix that perfectly aligns with Deno's `SharedArrayBuffer`
#[repr(C)]
pub struct SigmaMatrix {
    pub _pad_safety: [u8; SAFETY_BUFFER - 8], // 0 to 7,999,992
    pub tick_counter: i32,                    // 7,999,992
    pub sync_state: i32,                      // 7,999,996

    // ATOMIC PROPERTIES
    pub ids: [u64; MAX_ATOMS],       // 8,000,000
    pub xs: [i16; MAX_ATOMS],        // 8,800,000
    pub ys: [i16; MAX_ATOMS],        // 9,000,000
    pub energy: [i32; MAX_ATOMS],    // 9,200,000
    pub resonance: [i32; MAX_ATOMS], // 9,600,000
    pub phase: [i32; MAX_ATOMS],     // 10,000,000
    pub logic: [[u8; 8]; MAX_ATOMS], // 10,400,000

    // BONDS & KINEMATICS
    pub bonds: [i32; MAX_ATOMS * 4],         // 11,200,000
    pub stiffness: [f32; MAX_ATOMS * 4],     // 12,800,000
    pub instructions: [[u8; 64]; MAX_ATOMS], // 14,400,000
    pub context: [[i32; 16]; MAX_ATOMS],     // 20,800,000

    // REPRODUCTION & CAUSALITY
    pub evolution_reserved: [i32; MAX_ATOMS], // 27,200,000
    // SPAWN_REQUESTS struct length is 8 + 1024*24 = 24584, fits into 800,000 buffer
    pub spawn_requests: [u8; 1_200_000], // 27,600,000

    pub meiosis: [i32; 300_000],             // 28,800,000
    pub bond_requests: [i32; MAX_ATOMS * 3], // 30,000,000

    // SPATIAL INDEXING
    pub spatial_grid: [i32; GRID_CELLS * 32], // 31,200,000
    pub _pad_roles: [u8; 8_566_400],          // to 41,200,000

    // ROLES
    pub roles: [u8; MAX_ATOMS],             // 41,200,000
    pub _pad_structure_grid: [u8; 900_000], // to 42,200,000

    // GRIDS
    pub structure_grid: [i32; GRID_CELLS], // 42,200,000
    pub _pad_signal_grid: [u8; 955_200],   // to 43,200,000

    pub signal_grid: [i32; GRID_CELLS],  // 43,200,000
    pub _pad_memory_grid: [u8; 955_200], // to 44,200,000

    pub memory_grid: [[u8; 8]; GRID_CELLS], // 44,200,000
    pub _pad_ascension: [u8; 910_400],      // to 45,200,000

    // TRAITS & STATS
    pub ascension_stats: [i32; 250_000],     // 45,200,000
    pub bond_distances: [u8; MAX_ATOMS * 4], // 46,200,000
    pub _pad_damping: [u8; 600_000],         // to 47,200,000

    pub damping: [u8; MAX_ATOMS],   // 47,200,000
    pub causality: [u8; MAX_ATOMS], // 47,300,000

    // _PAD TO HIVE MEMORY
    pub _pad_hive: [u8; 800_000], // 47,400,000

    pub hive_memory: [u8; 1024], // 48,200,000
    pub hive_balance: i32,       // 48,201,024

    // _PAD TO QUORUM
    pub _pad_quorum: [u8; 98_972], // 48,201,028

    pub quorum: [i32; 100_025], // 48,300,000

    pub coherence: i32,        // 48,700,100
    pub neural_coherence: i32, // 48,700,104

    pub _pad_physics: [u8; 99_892], // 48,700,108

    pub physics_read_xs: [i16; MAX_ATOMS],        // 48,800,000
    pub physics_read_ys: [i16; MAX_ATOMS],        // 49,000,000
    pub physics_read_energy: [i32; MAX_ATOMS],    // 49,200,000
    pub physics_read_resonance: [i32; MAX_ATOMS], // 49,600,000

    pub energy_delta: [i32; MAX_ATOMS],    // 50,000,000
    pub resonance_delta: [i32; MAX_ATOMS], // 50,400,000

    pub structure_build_owner: [i32; GRID_CELLS], // 50,800,000
    pub structure_build_value: [i32; GRID_CELLS], // 50,844,800
    pub structure_charge_intent: [i32; GRID_CELLS], // 50,889,600
    pub attention_field: [f32; GRID_CELLS],       // 50,934,400
    pub hive_energy_pool: [i32; 256],             // 50,979,200

    pub _pad_glyph: [u8; 0], // Actually 50,980,224 aligns exactly

    pub glyph_header: [i32; GRID_CELLS],      // 50,980,224
    pub glyph_payload: [[u8; 8]; GRID_CELLS], // 51,025,024

    pub _pad_glyph_scratch: [u8; 0], // 51,114,624 exactly

    pub glyph_scratch_header: [i32; GRID_CELLS], // 51,114,624
    pub glyph_scratch_payload: [[u8; 8]; GRID_CELLS], // 51,159,424

    pub _pad_hormones: [u8; 0], // 51,249,024 exactly

    pub hormones: [u16; 8], // 51,249,024

    pub secretion_stats: [i32; 12], // 51,249,040

    pub _pad_lineage: [u8; 150_912], // 51,249,088

    pub lineage: [u64; MAX_ATOMS], // 51,400,000

    pub mailbox: [[i32; 2]; MAX_ATOMS], // 52,200,000

    pub ledger_head: i32,               // 53,000,000
    pub ledger_data: [[i32; 4]; 65536], // 53,000,004
}

pub struct SigmaState {
    pub matrix: Box<SigmaMatrix>,
}

impl SigmaState {
    pub fn new() -> Self {
        Self {
            // Unsafe required because initializing an 54MB struct on the stack would overflow.
            // Using zeroed allocation directly onto the heap.
            matrix: unsafe {
                let layout = std::alloc::Layout::new::<SigmaMatrix>();
                let ptr = std::alloc::alloc_zeroed(layout) as *mut SigmaMatrix;
                Box::from_raw(ptr)
            },
        }
    }

    pub fn allocate(&mut self) -> Option<usize> {
        for i in 0..MAX_ATOMS {
            if self.matrix.ids[i] == 0 {
                return Some(i);
            }
        }
        None
    }

    pub fn set_energy(&mut self, index: usize, energy: i32) {
        if index < MAX_ATOMS {
            self.matrix.energy[index] = energy;
        }
    }

    pub fn read_genome(&self, index: usize) -> Option<&[u8; 8]> {
        if index < MAX_ATOMS {
            Some(&self.matrix.logic[index])
        } else {
            None
        }
    }
}

// -----------------------------------------------------------------------------
// Type Checks & Padding Validations
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::offset_of;

    #[test]
    fn verify_memory_offsets() {
        assert_eq!(offset_of!(SigmaMatrix, logic), 10_400_000, "logic");
        assert_eq!(offset_of!(SigmaMatrix, bonds), 11_200_000, "bonds");
        assert_eq!(offset_of!(SigmaMatrix, stiffness), 12_800_000, "stiffness");
        assert_eq!(
            offset_of!(SigmaMatrix, instructions),
            14_400_000,
            "instructions"
        );
        assert_eq!(offset_of!(SigmaMatrix, context), 20_800_000, "context");
        assert_eq!(
            offset_of!(SigmaMatrix, evolution_reserved),
            27_200_000,
            "evolution"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spawn_requests),
            27_600_000,
            "spawn_requests"
        );
        assert_eq!(offset_of!(SigmaMatrix, meiosis), 28_800_000, "meiosis");
        assert_eq!(
            offset_of!(SigmaMatrix, bond_requests),
            30_000_000,
            "bond_requests"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spatial_grid),
            31_200_000,
            "spatial_grid"
        );

        assert_eq!(offset_of!(SigmaMatrix, roles), 41_200_000, "roles");
        assert_eq!(
            offset_of!(SigmaMatrix, structure_grid),
            42_200_000,
            "structure_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, signal_grid),
            43_200_000,
            "signal_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, memory_grid),
            44_200_000,
            "memory_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ascension_stats),
            45_200_000,
            "ascension_stats"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, bond_distances),
            46_200_000,
            "bond_distances"
        );
        assert_eq!(offset_of!(SigmaMatrix, damping), 47_200_000, "damping");
        assert_eq!(offset_of!(SigmaMatrix, causality), 47_300_000, "causality");
        assert_eq!(
            offset_of!(SigmaMatrix, hive_memory),
            48_200_000,
            "hive_memory"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_balance),
            48_201_024,
            "hive_balance"
        );
        assert_eq!(offset_of!(SigmaMatrix, quorum), 48_300_000, "quorum");
        assert_eq!(offset_of!(SigmaMatrix, coherence), 48_700_100, "coherence");
        assert_eq!(
            offset_of!(SigmaMatrix, neural_coherence),
            48_700_104,
            "neural_coherence"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_xs),
            48_800_000,
            "physics_read_xs"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_ys),
            49_000_000,
            "physics_read_ys"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_energy),
            49_200_000,
            "physics_read_energy"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_resonance),
            49_600_000,
            "physics_read_resonance"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, energy_delta),
            50_000_000,
            "energy_delta"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, resonance_delta),
            50_400_000,
            "resonance_delta"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_owner),
            50_800_000,
            "structure_build_owner"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_value),
            50_844_800,
            "structure_build_value"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_charge_intent),
            50_889_600,
            "structure_charge_intent"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, attention_field),
            50_934_400,
            "attention_field"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_energy_pool),
            50_979_200,
            "hive_energy_pool"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, glyph_header),
            50_980_224,
            "glyph_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_payload),
            51_025_024,
            "glyph_payload"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_header),
            51_114_624,
            "glyph_scratch_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_payload),
            51_159_424,
            "glyph_scratch_payload"
        );
        assert_eq!(offset_of!(SigmaMatrix, hormones), 51_249_024, "hormones");
        assert_eq!(
            offset_of!(SigmaMatrix, secretion_stats),
            51_249_040,
            "secretion_stats"
        );
        assert_eq!(offset_of!(SigmaMatrix, lineage), 51_400_000, "lineage");
        assert_eq!(offset_of!(SigmaMatrix, mailbox), 52_200_000, "mailbox");
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_head),
            53_000_000,
            "ledger_head"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_data),
            53_000_004,
            "ledger_data"
        );
    }
}
