//! Sigma-Core Memory Layout
//! Byre-for-byte compatible with OMEGA-64 OFFSETS.ts

pub const MAX_ATOMS: usize = 500_000;
pub const SAFETY_BUFFER: usize = 8_000_000;
pub const GRID_W: usize = 140;
pub const GRID_H: usize = 80;
pub const GRID_CELLS: usize = GRID_W * GRID_H;

/// The central Data-Oriented memory matrix that perfectly aligns with Deno's `SharedArrayBuffer`
#[repr(C)]
pub struct SigmaMatrix {
    pub _pad_front: [u8; 7_999_992],
    pub tick_counter: i32,
    pub sync_state: i32,
    pub ids: [u64; 500000],
    pub xs: [i16; 500000],
    pub ys: [i16; 500000],
    pub energy: [i32; 500000],
    pub resonance: [i32; 500000],
    pub phase: [i32; 500000],
    pub logic: [[u8; 8]; 500000],
    pub bonds: [i32; 2000000],
    pub stiffness: [f32; 2000000],
    pub instructions: [[u8; 64]; 500000],
    pub context: [[i32; 16]; 500000],
    pub evolution_reserved: [i32; 500000],
    pub spawn_requests: [u8; 24584],
    pub meiosis: [i32; 300000],
    pub _pad_to_bond_requests: [u8; 4800000],
    pub bond_requests: [i32; 1500000],
    pub spatial_grid: [i32; 358400],
    pub roles: [u8; 500000],
    pub structure_grid: [i32; 11200],
    pub signal_grid: [i32; 11200],
    pub memory_grid: [[u8; 8]; 11200],
    pub ascension_stats: [i32; 250000],
    pub _pad_to_bond_distances: [u8; 4000000],
    pub bond_distances: [u8; 2000000],
    pub synaptic_weights: [u8; 2000000],
    pub damping: [u8; 500000],
    pub causality: [u8; 500000],
    pub hive_memory: [u8; 1024],
    pub hive_balance: i32,
    pub quorum: [i32; 89600],
    pub coherence: i32,
    pub neural_coherence: i32,
    pub physics_read_xs: [i16; 500000],
    pub physics_read_ys: [i16; 500000],
    pub physics_read_energy: [i32; 500000],
    pub physics_read_resonance: [i32; 500000],
    pub energy_delta: [i32; 500000],
    pub resonance_delta: [i32; 500000],
    pub structure_build_owner: [i32; 11200],
    pub structure_build_value: [i32; 11200],
    pub structure_charge_intent: [i32; 11200],
    pub attention_field: [f32; 11200],
    pub hive_energy_pool: [i32; 256],
    pub glyph_header: [i32; 11200],
    pub glyph_payload: [[u8; 8]; 11200],
    pub glyph_scratch_header: [i32; 11200],
    pub glyph_scratch_payload: [[u8; 8]; 11200],
    pub hormones: [u16; 8],
    pub secretion_stats: [i32; 12],
    pub _pad_to_lineage: [u8; 4],
    pub lineage: [u64; 500000],
    pub mailbox: [[i32; 2]; 500000],
    pub ledger_head: i32,
    pub ledger_data: [[i32; 4]; 65536],
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

    pub fn synaptic_weights_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.synaptic_weights.as_ptr() as *const std::sync::atomic::AtomicU8,
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
            self.matrix.synaptic_weights[b] = 0;
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
        assert_eq!(
            offset_of!(SigmaMatrix, tick_counter),
            7_999_992,
            "tick_counter"
        );
        assert_eq!(offset_of!(SigmaMatrix, sync_state), 7_999_996, "sync_state");
        assert_eq!(offset_of!(SigmaMatrix, ids), 8000000, "ids");
        assert_eq!(offset_of!(SigmaMatrix, xs), 12000000, "xs");
        assert_eq!(offset_of!(SigmaMatrix, ys), 13000000, "ys");
        assert_eq!(offset_of!(SigmaMatrix, energy), 14000000, "energy");
        assert_eq!(offset_of!(SigmaMatrix, resonance), 16000000, "resonance");
        assert_eq!(offset_of!(SigmaMatrix, phase), 18000000, "phase");
        assert_eq!(offset_of!(SigmaMatrix, logic), 20000000, "logic");
        assert_eq!(offset_of!(SigmaMatrix, bonds), 24000000, "bonds");
        assert_eq!(offset_of!(SigmaMatrix, stiffness), 32000000, "stiffness");
        assert_eq!(
            offset_of!(SigmaMatrix, instructions),
            40000000,
            "instructions"
        );
        assert_eq!(offset_of!(SigmaMatrix, context), 72000000, "context");
        assert_eq!(
            offset_of!(SigmaMatrix, evolution_reserved),
            104000000,
            "evolution_reserved"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spawn_requests),
            106000000,
            "spawn_requests"
        );
        assert_eq!(offset_of!(SigmaMatrix, meiosis), 106024584, "meiosis");
        assert_eq!(
            offset_of!(SigmaMatrix, bond_requests),
            112024584,
            "bond_requests"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, spatial_grid),
            118024584,
            "spatial_grid"
        );
        assert_eq!(offset_of!(SigmaMatrix, roles), 119458184, "roles");
        assert_eq!(
            offset_of!(SigmaMatrix, structure_grid),
            119958184,
            "structure_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, signal_grid),
            120002984,
            "signal_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, memory_grid),
            120047784,
            "memory_grid"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ascension_stats),
            120137384,
            "ascension_stats"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, bond_distances),
            125137384,
            "bond_distances"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, synaptic_weights),
            127137384,
            "synaptic_weights"
        );
        assert_eq!(offset_of!(SigmaMatrix, damping), 129137384, "damping");
        assert_eq!(offset_of!(SigmaMatrix, causality), 129637384, "causality");
        assert_eq!(
            offset_of!(SigmaMatrix, hive_memory),
            130137384,
            "hive_memory"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_balance),
            130138408,
            "hive_balance"
        );
        assert_eq!(offset_of!(SigmaMatrix, quorum), 130138412, "quorum");
        assert_eq!(offset_of!(SigmaMatrix, coherence), 130496812, "coherence");
        assert_eq!(
            offset_of!(SigmaMatrix, neural_coherence),
            130496816,
            "neural_coherence"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_xs),
            130496820,
            "physics_read_xs"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_ys),
            131496820,
            "physics_read_ys"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_energy),
            132496820,
            "physics_read_energy"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, physics_read_resonance),
            134496820,
            "physics_read_resonance"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, energy_delta),
            136496820,
            "energy_delta"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, resonance_delta),
            138496820,
            "resonance_delta"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_owner),
            140496820,
            "structure_build_owner"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_build_value),
            140541620,
            "structure_build_value"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, structure_charge_intent),
            140586420,
            "structure_charge_intent"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, attention_field),
            140631220,
            "attention_field"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, hive_energy_pool),
            140676020,
            "hive_energy_pool"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_header),
            140677044,
            "glyph_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_payload),
            140721844,
            "glyph_payload"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_header),
            140811444,
            "glyph_scratch_header"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, glyph_scratch_payload),
            140856244,
            "glyph_scratch_payload"
        );
        assert_eq!(offset_of!(SigmaMatrix, hormones), 140945844, "hormones");
        assert_eq!(
            offset_of!(SigmaMatrix, secretion_stats),
            140945860,
            "secretion_stats"
        );
        assert_eq!(offset_of!(SigmaMatrix, lineage), 140945912, "lineage");
        assert_eq!(offset_of!(SigmaMatrix, mailbox), 144945912, "mailbox");
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_head),
            148945912,
            "ledger_head"
        );
        assert_eq!(
            offset_of!(SigmaMatrix, ledger_data),
            148945916,
            "ledger_data"
        );
    }
}
