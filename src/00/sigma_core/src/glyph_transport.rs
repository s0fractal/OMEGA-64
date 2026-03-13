//! Glyph Transport Engine
//! Handles wave interference physics and optical secretion

use crate::memory::SigmaState;

pub fn unpack_glyph_kind(header: i32) -> u8 {
    (header & 0xFF) as u8
}

pub fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8 // signed arithmetic shift
}

pub fn pack_glyph_header(kind: u8, amplitude: i32) -> i32 {
    let mut amp = amplitude;
    if amp > 8388607 {
        amp = 8388607;
    }
    if amp < -8388608 {
        amp = -8388608;
    }
    (amp << 8) | (kind as i32 & 0xFF)
}

impl SigmaState {
    /// Models optical wave interference on a flat 2D grid cell.
    pub fn atomic_deposit_glyph_header(&self, cell: usize, kind: u8, amplitude: i32) {
        if amplitude == 0 || cell >= crate::constants::GRID_CELLS {
            return;
        }

        let current = self.matrix.glyph_header[cell];
        let current_kind = unpack_glyph_kind(current);
        let current_amp = unpack_glyph_amplitude(current);

        // Mismatched kind prioritization (overwrite if strictly stronger, else annihilated/blocked)
        if current_kind != 0 && current_kind != kind {
            if amplitude.abs() > current_amp.abs() {
                self.glyph_header_atomic()[cell].store(
                    pack_glyph_header(kind, amplitude) as u32,
                    std::sync::atomic::Ordering::Relaxed,
                );
            }
        } else {
            // Matching kind (or zeroed cell): additive wave interference
            let mut next_amplitude = current_amp + amplitude;
            if next_amplitude > 8388607 {
                next_amplitude = 8388607;
            }
            if next_amplitude < -8388608 {
                next_amplitude = -8388608;
            }

            // Annihilation (perfect destructive interference) clears the cell kind
            let next_kind = if next_amplitude == 0 { 0 } else { kind };

            self.glyph_header_atomic()[cell].store(
                pack_glyph_header(next_kind, next_amplitude) as u32,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
    }
}
