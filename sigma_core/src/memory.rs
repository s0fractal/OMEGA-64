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
}
impl Clone for SigmaState {
    fn clone(&self) -> Self {
        let mut new_state = Self::new();
        unsafe {
            std::ptr::copy_nonoverlapping(
                self.matrix.as_ref() as *const SigmaMatrix,
                new_state.matrix.as_mut() as *mut SigmaMatrix,
                1,
            );
        }
        new_state
    }
}

impl SigmaState {
    /// Returns a slice of AtomicI32 mapping directly to the `spatial_grid` array
    /// Safe because `AtomicI32` has the exact same memory layout as `i32` (`repr(C)` transparent).
    #[inline]
    pub fn phase_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.phase.as_ptr() as *const std::sync::atomic::AtomicI32,
                MAX_ATOMS,
            )
        }
    }

    pub fn ids_atomic(&self) -> &[std::sync::atomic::AtomicU64] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ids.as_ptr() as *const std::sync::atomic::AtomicU64,
                MAX_ATOMS,
            )
        }
    }

    pub fn context_atomic(&self, atom_idx: usize) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.context[atom_idx].as_ptr() as *const std::sync::atomic::AtomicI32,
                16,
            )
        }
    }

    pub fn xs_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.xs.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn ys_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ys.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn hive_memory_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hive_memory.as_ptr() as *const std::sync::atomic::AtomicU8,
                1024,
            )
        }
    }

    pub fn glyph_header_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_header.as_ptr() as *const std::sync::atomic::AtomicU32,
                GRID_CELLS,
            )
        }
    }

    pub fn stiffness_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.stiffness.as_ptr() as *const std::sync::atomic::AtomicU32,
                MAX_ATOMS * 4,
            )
        }
    }

    pub fn spatial_grid_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spatial_grid.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.spatial_grid.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_charge_intent` array
    #[inline]
    pub fn structure_charge_intent_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_charge_intent.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_charge_intent.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_build_owner` array
    #[inline]
    pub fn structure_build_owner_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_owner.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_owner.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `bond_requests` array
    #[inline]
    pub fn bond_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.bond_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.bond_requests.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping to the `spawn_requests` head pointers.
    /// The first 8 bytes of `spawn_requests` are the write and read heads (i32 each).
    #[inline]
    pub fn spawn_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spawn_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                2, // We only need the first two AtomicI32s (write_head and read_head)
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `quorum` array
    #[inline]
    pub fn quorum_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.quorum.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.quorum.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `energy` array
    #[inline]
    pub fn energy_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.energy.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.energy.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `resonance` array
    #[inline]
    pub fn resonance_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.resonance.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.resonance.len(),
            )
        }
    }

    /// Returns a mutable reference to the atomic `hive_balance`
    #[inline]
    pub fn hive_balance_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe {
            &*(&self.matrix.hive_balance as *const i32 as *const std::sync::atomic::AtomicI32)
        }
    }

    pub fn allocate(&mut self) -> Option<usize> {
        for i in 1..MAX_ATOMS {
            if self.matrix.ids[i] == 0 {
                return Some(i);
            }
        }
        None
    }

    pub fn recycle_atom(&mut self, idx: usize) {
        self.matrix.ids[idx] = 0;
        self.matrix.energy[idx] = 0;
        self.matrix.resonance[idx] = 0;
        self.matrix.xs[idx] = 0;
        self.matrix.ys[idx] = 0;
        self.matrix.phase[idx] = 0;
        self.matrix.logic[idx].fill(0);
        self.matrix.instructions[idx].fill(0);
        self.matrix.context[idx].fill(0);
        for i in 0..4 {
            let b = (idx * 4) + i;
            self.matrix.bonds[b] = 0;
            self.matrix.stiffness[b] = 0.0;
            self.matrix.bond_distances[b] = 0;
        }
        self.matrix.roles[idx] = 0;
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
        assert_eq!(offset_of!(SigmaMatrix, logic), 2_400_008, "logic");
        assert_eq!(offset_of!(SigmaMatrix, bonds), 3_200_008, "bonds");
        assert_eq!(offset_of!(SigmaMatrix, stiffness), 4_800_008, "stiffness");
        assert_eq!(
            offset_of!(SigmaMatrix, instructions),
            6_400_008,
            "instructions"
        );
        assert_eq!(offset_of!(SigmaMatrix, context), 12_800_008, "context");
        assert_eq!(
            offset_of!(SigmaMatrix, evolution_reserved),
            19_200_008,
            "evolution"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spawn_requests),
            19_600_008,
            "spawn_requests"
        );
        assert_eq!(offset_of!(SigmaMatrix, meiosis), 20_800_008, "meiosis");
        assert_eq!(
            offset_of!(SigmaMatrix, bond_requests),
            22_000_008,
            "bond_requests"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spatial_grid),
            23_200_008,
            "spatial_grid"
        );

        assert_eq!(offset_of!(SigmaMatrix, roles), 33_200_008, "roles");
        assert_eq!(
            offset_of!(SigmaMatrix, structure_grid),
            34_200_008,
            "structure_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, signal_grid),
            35_200_008,
            "signal_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, memory_grid),
            36_200_008,
            "memory_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ascension_stats),
            37_200_008,
            "ascension_stats"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, bond_distances),
            38_200_008,
            "bond_distances"
        );
        assert_eq!(offset_of!(SigmaMatrix, damping), 39_200_008, "damping");
        assert_eq!(offset_of!(SigmaMatrix, causality), 39_300_008, "causality");
        assert_eq!(
            offset_of!(SigmaMatrix, hive_memory),
            40_200_008,
            "hive_memory"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_balance),
            40_201_032,
            "hive_balance"
        );
        assert_eq!(offset_of!(SigmaMatrix, quorum), 40_300_008, "quorum");
        assert_eq!(offset_of!(SigmaMatrix, coherence), 40_700_108, "coherence");
        assert_eq!(
            offset_of!(SigmaMatrix, neural_coherence),
            40_700_112,
            "neural_coherence"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_xs),
            40_800_008,
            "physics_read_xs"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_ys),
            41_000_008,
            "physics_read_ys"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_energy),
            41_200_008,
            "physics_read_energy"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_resonance),
            41_600_008,
            "physics_read_resonance"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, energy_delta),
            42_000_008,
            "energy_delta"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, resonance_delta),
            42_400_008,
            "resonance_delta"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_owner),
            42_800_008,
            "structure_build_owner"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_value),
            42_844_808,
            "structure_build_value"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_charge_intent),
            42_889_608,
            "structure_charge_intent"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, attention_field),
            42_934_408,
            "attention_field"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_energy_pool),
            42_979_208,
            "hive_energy_pool"
        );

        assert_eq!(
            offset_of!(SigmaMatrix, glyph_header),
            42_980_232,
            "glyph_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_payload),
            43_025_032,
            "glyph_payload"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_header),
            43_114_632,
            "glyph_scratch_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_payload),
            43_159_432,
            "glyph_scratch_payload"
        );
        assert_eq!(offset_of!(SigmaMatrix, hormones), 43_249_032, "hormones");
        assert_eq!(
            offset_of!(SigmaMatrix, secretion_stats),
            43_249_048,
            "secretion_stats"
        );
        assert_eq!(offset_of!(SigmaMatrix, lineage), 43_400_008, "lineage");
        assert_eq!(offset_of!(SigmaMatrix, mailbox), 44_200_008, "mailbox");
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_head),
            45_000_008,
            "ledger_head"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_data),
            45_000_012,
            "ledger_data"
        );
    }
}
