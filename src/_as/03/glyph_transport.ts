// SSoT: file:///Users/s0fractal/OMEGA/I/autopoiesis/glyph_transport.md
import { GRID_CELLS, GLYPH_HEADER_OFF, GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, GLYPH_SCRATCH_HEADER_OFF, GRID_W, SIGNAL_GRID_OFF, SECRETION_STATS_OFF, MEMORY_GRID_OFF, atomic_deposit_glyph_header, diffusion_share_for_kind, decay_for_kind, pack_glyph_header, unpack_glyph_amplitude, unpack_glyph_kind, fast_abs, fast_max, fast_min, in_grid } from "../02/mod";

@inline
export function glyph_transport(tick: i32): void {
// Sampling grid for internal reflection (Stage 5.1/5.2)
  memory.fill(GLYPH_SCRATCH_HEADER_OFF, 0, (GRID_CELLS) << 2);

  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  for (let cell = 0; cell < (GRID_CELLS as i32); cell++) {
    const header = load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
    if (header == 0) continue;

    const kind = unpack_glyph_kind(header);
    const amp = unpack_glyph_amplitude(header);
    if (amp == 0) continue;

    const decay = decay_for_kind(kind, amp);

    // Bidirectional Decay (pull towards zero)
    let retained = 0;
    if (amp > 0) {
      retained = amp - decay;
      retained = fast_max(retained, 0);
    } else {
      retained = amp - decay; // decay is negative when amp is negative
      retained = fast_min(retained, 0);
    }

    if (fast_abs(retained) > 0) {
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, kind, retained, 0);
      if (kind == 2) { // PLASMID payload persistence
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (cell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }

    const share = diffusion_share_for_kind(kind, amp);
    if (fast_abs(share) > 0) {
      const gx = cell % GRID_W;
      const gy = cell / GRID_W;

      for (let i = 0; i < 4; i++) {
        let nx = gx + dx[i];
        let ny = gy + dy[i];
        if (in_grid(nx, ny)) {
          const nextCell = ny * GRID_W + nx;
          atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, nextCell, kind, share, 0);

          if (share >= 128 || share <= -128) {
            const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
            const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (nextCell << 3) as usize;
            memory.copy(dstPtr, srcPtr, 8);
          }
        }
      }
    }
  }

  // 2. Seeding: Internal Reflection (Signal -> Pheromone)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const signal = atomic.load<i32>(SIGNAL_GRID_OFF + (cell << 2) as usize);
    const absSignal = fast_abs(signal);
    if (absSignal >= 1) {
      let amp = absSignal >> 1;
      if (amp < 16) amp = 16;
      if (amp > 512) amp = 512;
      atomic_deposit_glyph_header(GLYPH_SCRATCH_HEADER_OFF, cell, 1, amp, 0);
      // Quantification (Stage 5.1/5.2) - sample-based to avoid overflow
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 40, 1); // Signal leak counter
      }
    }
  }

  // 3. Seeding: Internal Reflection (Memory -> Plasmid)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const memOffset = MEMORY_GRID_OFF + (cell << 3) as usize;
    const memoryLo = atomic.load<u32>(memOffset);
    const charge = memoryLo & 0xFFFFFF; // 24-bit charge

    if (charge >= 1) {
      let amp = charge >> 2;
      if (amp < 24) amp = 24;
      if (amp > 384) amp = 384;
      atomic_deposit_glyph_header(
        GLYPH_SCRATCH_HEADER_OFF,
        cell,
        2,
        amp,
        memOffset,
      );
      // Quantification
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 44, 1); // Memory leak counter
      }
    }
  }

  memory.copy(GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, GRID_CELLS << 3);
  memory.copy(GLYPH_HEADER_OFF, GLYPH_SCRATCH_HEADER_OFF, GRID_CELLS << 2);
}
