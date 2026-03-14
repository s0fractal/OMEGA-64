// Substrate Node: sigma_memory
// Level: 1
// The central Data-Oriented memory matrix that perfectly aligns with Deno's SharedArrayBuffer

#![allow(unused_imports)]
use super::super::L00::*;

// Sigma-Core Memory Layout
// Byte-for-byte compatible with OMEGA-64 OFFSETS.ts

/// The central Data-Oriented memory matrix that perfectly aligns with Deno's `SharedArrayBuffer`
#[repr(C)]
pub struct SigmaMatrix {
    pub ids: [u64; MAX_ATOMS],
    pub xs: [i16; MAX_ATOMS],
    pub ys: [i16; MAX_ATOMS],
    pub energy: [i32; MAX_ATOMS],
    pub resonance: [i32; MAX_ATOMS],
    pub phase: [i32; MAX_ATOMS],
    pub logic: [[u8; ATOM_GENOME_SIZE]; MAX_ATOMS],
    pub bonds: [i32; MAX_ATOMS * 4],
    pub stiffness: [f32; MAX_ATOMS * 4],
    pub instructions: [[u8; ATOM_INSTRUCTION_SIZE]; MAX_ATOMS],
    pub context: [[i32; ATOM_CONTEXT_SIZE]; MAX_ATOMS],
    pub evolution_reserved: [i32; MAX_ATOMS],
    pub spawn_requests: [u8; 8 + (MAX_SPAWN_REQUESTS * 24)],
    pub meiosis_reserved: [i32; MAX_MEIOSIS_EVENTS], // Size 300,000 bytes
    pub _pad_to_bond_requests: [u8; 112024584 - (106024584 + (MAX_MEIOSIS_EVENTS * 4))], // 112024584 - 106324584 = 5700000 bytes
    pub bond_requests: [i32; MAX_ATOMS * 3],
    pub spatial_grid: [i32; GRID_CELLS * 32],
    pub roles: [u8; MAX_ATOMS],
    pub structure_grid: [i32; GRID_CELLS],
    pub signal_grid: [i32; GRID_CELLS],
    pub memory_grid: [[u8; 8]; GRID_CELLS],
    pub ascension_stats_reserved: [i32; MAX_ASCENSION_STATS_RESERVED],
    pub bond_distances: [u8; MAX_ATOMS * 4],
    pub synaptic_weights: [u8; MAX_ATOMS * 4],
    pub damping: [u8; MAX_ATOMS],
    pub causality: [u8; MAX_ATOMS],
    pub hive_memory: [u8; HIVE_MEMORY_SIZE],
    pub hive_balance: i32,
    pub quorum: [i32; GRID_CELLS * 8],
    pub coherence: i32,
    pub neural_coherence: i32,
    pub physics_read_xs: [i16; MAX_ATOMS],
    pub physics_read_ys: [i16; MAX_ATOMS],
    pub physics_read_energy: [i32; MAX_ATOMS],
    pub physics_read_resonance: [i32; MAX_ATOMS],
    pub energy_delta: [i32; MAX_ATOMS],
    pub resonance_delta: [i32; MAX_ATOMS],
    pub structure_build_owner: [i32; GRID_CELLS],
    pub structure_build_value: [i32; GRID_CELLS],
    pub structure_charge_intent: [i32; GRID_CELLS],
    pub attention_field: [f32; GRID_CELLS],
    pub hive_energy_pool: [i32; HIVE_ENERGY_POOL_SIZE],
    pub glyph_header: [i32; GRID_CELLS],
    pub glyph_payload: [[u8; 8]; GRID_CELLS],
    pub glyph_scratch_header: [i32; GRID_CELLS],
    pub glyph_scratch_payload: [[u8; 8]; GRID_CELLS],
    pub hormones: [u16; MAX_HORMONES],
    pub secretion_stats: [i32; SECRETION_STATS_SIZE],
    pub _pad_to_lineage: [u8; 4],
    pub lineage: [u64; MAX_ATOMS],
    pub mailbox: [[i32; 2]; MAX_ATOMS],
    pub ledger_head: i32,
    pub ledger_data: [[i32; 4]; MAX_LEDGER_EVENTS],
    pub egress_head: i32,
    pub egress_data: [[u8; 256]; MAX_EGRESS_EVENTS],
}

pub struct SigmaState {
    pub matrix: Box<SigmaMatrix>,
    pub free_search_cursor: usize,
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
            free_search_cursor: 1,
        }
    }

    /// SAFETY: ptr must be valid, aligned, and writeable (typically mapped to a JS SharedArrayBuffer)
    pub unsafe fn from_raw(ptr: *mut SigmaMatrix) -> Self {
        Self {
            matrix: unsafe { Box::from_raw(ptr) },
            free_search_cursor: 1,
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

    pub fn hormones_atomic(&self) -> &[std::sync::atomic::AtomicU16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hormones.as_ptr() as *const std::sync::atomic::AtomicU16,
                MAX_HORMONES,
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
                ATOM_CONTEXT_SIZE,
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

    pub fn roles_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.roles.as_ptr() as *const std::sync::atomic::AtomicU8,
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
                HIVE_MEMORY_SIZE,
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

    pub fn glyph_payload_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_payload.as_ptr() as *const std::sync::atomic::AtomicU8,
                GRID_CELLS * 8,
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

    pub fn read_genome(&self, index: usize) -> Option<&[u8]> {
        if index < MAX_ATOMS {
            Some(&self.matrix.logic[index])
        } else {
            None
        }
    }

    pub fn egress_head_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe { &*(&self.matrix.egress_head as *const i32 as *const std::sync::atomic::AtomicI32) }
    }

    pub fn dispatch_egress(&self, atom_idx: usize, nx: i32, ny: i32, current_energy: i32) {
        let max_events = 8192;
        let head = self
            .egress_head_atomic()
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let idx = (head as usize) % max_events;

        let mut payload = [0u8; 256];
        payload[0..ATOM_INSTRUCTION_SIZE].copy_from_slice(&self.matrix.instructions[atom_idx]);
        payload[64..68].copy_from_slice(&current_energy.to_le_bytes());
        payload[68..72].copy_from_slice(&self.matrix.phase[atom_idx].to_le_bytes());
        payload[72..76].copy_from_slice(&self.matrix.resonance[atom_idx].to_le_bytes());
        payload[76..80].copy_from_slice(&nx.to_le_bytes());
        payload[80..84].copy_from_slice(&ny.to_le_bytes());

        for i in 0..ATOM_CONTEXT_SIZE {
            let offset = 84 + (i * 4);
            payload[offset..offset + 4]
                .copy_from_slice(&self.matrix.context[atom_idx][i].to_le_bytes());
        }

        payload[148] = self.matrix.roles[atom_idx];

        unsafe {
            let egress_ptr = self.matrix.egress_data.as_ptr() as *mut u8;
            let slot_ptr = egress_ptr.add(idx * 256);
            std::ptr::copy_nonoverlapping(payload.as_ptr(), slot_ptr, 256);
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
    // The Deno `SharedArrayBuffer` expects these exact byte offsets mapping to `OFFSETS.ts`:
    // export const MAX_ATOMS = 500000;
    // export const SAFETY_BUFFER = 8000000;
    // export const IDS_OFFSET = 8000000;
    // export const XS_OFFSET = 12000000;
    #[test]
    fn verify_memory_offsets() {
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ids),
            SAFETY_BUFFER + (8000000 - 8000000),
            "ids"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, xs),
            SAFETY_BUFFER + (12000000 - 8000000),
            "xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ys),
            SAFETY_BUFFER + (13000000 - 8000000),
            "ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy),
            crate::ENERGY_OFFSET,
            "energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance),
            crate::RESONANCE_OFFSET,
            "resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, phase),
            crate::PHASE_OFFSET,
            "phase"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, logic),
            crate::LOGIC_OFFSET,
            "logic"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bonds),
            crate::BONDS_OFFSET,
            "bonds"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, stiffness),
            crate::STIFFNESS_OFFSET,
            "stiffness"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, instructions),
            crate::INSTRUCTIONS_OFFSET,
            "instructions"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, context),
            crate::CONTEXT_OFFSET,
            "context"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, evolution_reserved),
            crate::EVOLUTION_OFFSET,
            "evolution_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spawn_requests),
            crate::SPAWN_REQUESTS_OFFSET,
            "spawn_requests"
        );
        assert_eq!(
        SAFETY_BUFFER + offset_of!(SigmaMatrix, meiosis_reserved),
        crate::MEIOSIS_RESERVED_OFFSET,
        "meiosis_reserved"
    );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_requests),
            crate::BOND_REQUESTS_OFFSET,
            "bond_requests"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spatial_grid),
            crate::SPATIAL_GRID_OFFSET,
            "spatial_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, roles),
            crate::ROLES_OFFSET,
            "roles"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_grid),
            crate::STRUCTURE_GRID_OFFSET,
            "structure_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, signal_grid),
            crate::SIGNAL_GRID_OFFSET,
            "signal_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, memory_grid),
            crate::MEMORY_GRID_OFFSET,
            "memory_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ascension_stats_reserved),
            crate::ASCENSION_STATS_OFFSET,
            "ascension_stats_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_distances),
            crate::BOND_DISTANCES_OFFSET,
            "bond_distances"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, synaptic_weights),
            crate::SYNAPTIC_WEIGHTS_OFFSET,
            "synaptic_weights"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, damping),
            crate::DAMPING_OFFSET,
            "damping"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, causality),
            crate::CAUSALITY_OFFSET,
            "causality"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_memory),
            crate::HIVE_MEMORY_OFFSET,
            "hive_memory"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_balance),
            crate::HIVE_BALANCE_OFFSET,
            "hive_balance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, quorum),
            crate::QUORUM_OFFSET,
            "quorum"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, coherence),
            crate::COHERENCE_OFFSET,
            "coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, neural_coherence),
            crate::NEURAL_COHERENCE_OFFSET,
            "neural_coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_xs),
            crate::PHYSICS_READ_XS_OFFSET,
            "physics_read_xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_ys),
            crate::PHYSICS_READ_YS_OFFSET,
            "physics_read_ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_energy),
            crate::PHYSICS_READ_ENERGY_OFFSET,
            "physics_read_energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_resonance),
            crate::PHYSICS_READ_RESONANCE_OFFSET,
            "physics_read_resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy_delta),
            crate::ENERGY_DELTA_OFFSET,
            "energy_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance_delta),
            crate::RESONANCE_DELTA_OFFSET,
            "resonance_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_owner),
            crate::STRUCTURE_BUILD_OWNER_OFFSET,
            "structure_build_owner"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_value),
            crate::STRUCTURE_BUILD_VALUE_OFFSET,
            "structure_build_value"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_charge_intent),
            crate::STRUCTURE_CHARGE_INTENT_OFFSET,
            "structure_charge_intent"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, attention_field),
            crate::ATTENTION_FIELD_OFFSET,
            "attention_field"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_energy_pool),
            crate::HIVE_ENERGY_POOL_OFFSET,
            "hive_energy_pool"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_header),
            crate::GLYPH_HEADER_OFFSET,
            "glyph_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_payload),
            crate::GLYPH_PAYLOAD_OFFSET,
            "glyph_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_header),
            crate::GLYPH_SCRATCH_HEADER_OFFSET,
            "glyph_scratch_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_payload),
            crate::GLYPH_SCRATCH_PAYLOAD_OFFSET,
            "glyph_scratch_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hormones),
            crate::HORMONES_OFFSET,
            "hormones"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, secretion_stats),
            crate::SECRETION_STATS_OFFSET,
            "secretion_stats"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, lineage),
            crate::LINEAGE_OFFSET,
            "lineage"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, mailbox),
            crate::MAILBOX_OFFSET,
            "mailbox"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_head),
            crate::LEDGER_HEAD_OFFSET,
            "ledger_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_data),
            crate::LEDGER_DATA_OFFSET,
            "ledger_data"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_head),
            crate::EGRESS_HEAD_OFFSET,
            "egress_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_data),
            crate::EGRESS_DATA_OFFSET,
            "egress_data"
        );
    }
}