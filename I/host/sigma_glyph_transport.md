---
id: sigma_glyph_transport
type: substrate_module
target: rust
level: 2
deps:
  - SYSTEM_CONSTANTS
  - SYSTEM_CONSTANTS
  - sigma_memory
description: Handles wave interference physics and optical secretion
---

# `Glyph Transport`

```rust
use crate::{MAX_GLYPH_AMP, MIN_GLYPH_AMP};
use crate::SigmaState;

pub fn unpack_glyph_kind(header: i32) -> u8 {
    (header & 0xFF) as u8
}

pub fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8 // signed arithmetic shift
}

pub fn pack_glyph_header(kind: u8, amplitude: i32) -> i32 {
    let mut amp = amplitude;
    if amp > MAX_GLYPH_AMP {
        amp = MAX_GLYPH_AMP;
    }
    if amp < MIN_GLYPH_AMP {
        amp = MIN_GLYPH_AMP;
    }
    (amp << 8) | (kind as i32 & 0xFF)
}

impl SigmaState {
    /// Models optical wave interference on a flat 2D grid cell.
    pub fn atomic_deposit_glyph_header(&self, cell: usize, kind: u8, amplitude: i32) {
        if amplitude == 0 || cell >= crate::GRID_CELLS {
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
            if next_amplitude > MAX_GLYPH_AMP {
                next_amplitude = MAX_GLYPH_AMP;
            }
            if next_amplitude < MIN_GLYPH_AMP {
                next_amplitude = MIN_GLYPH_AMP;
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
```
