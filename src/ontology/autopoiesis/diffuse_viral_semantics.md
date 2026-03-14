---
id: diffuse_viral_semantics
type: pure_fn
dataType: null
returns: void
level: 1
args:
  pulseId: i32
vars:
  - GRID_H
  - GRID_W
  - SIGNAL_GRID_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
  - in_grid
  - prng_next
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  let state = pulseId as u32;

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const idx = (y * GRID_W + x) * 9;
      const targetOff = SIGNAL_GRID_OFF + (idx as usize);
      const intensity = atomic.load<u8>(targetOff + 8 as usize);
      if (intensity == 0) continue;

      // 1. DECAY
      const nextIntensity = intensity > 2 ? intensity - 2 : 0;
      atomic.store<u8>(targetOff + 8 as usize, nextIntensity);

      // 2. DIFFUSE (Deterministic chance to spread logic to neighbors)
      state = prng_next(state);
      const v1 = (state as f32) / (0xFFFFFFFF as f32);

      if (intensity > 150 && v1 < 0.1) {
        state = prng_next(state);
        const v2 = (state as f32) / (0xFFFFFFFF as f32);
        state = prng_next(state);
        const v3 = (state as f32) / (0xFFFFFFFF as f32);

        const nx = x + (v2 > 0.5 ? 1 : -1);
        const ny = y + (v3 > 0.5 ? 1 : -1);

        if (in_grid(nx, ny)) {
          const nIdx = (ny * GRID_W + nx) * 9;
          const nTargetOff = SIGNAL_GRID_OFF + (nIdx as usize);
          const nIntensity = atomic.load<u8>(nTargetOff + 8 as usize);

          if (nIntensity < (intensity >> 1)) {
            // Copy logic and part of intensity
            for (let b: usize = 0; b < 8; b++) {
              const logicByte = atomic.load<u8>(targetOff + b as usize);
              atomic.store<u8>(nTargetOff + b as usize, logicByte);
            }
            atomic.store<u8>(nTargetOff + 8 as usize, (intensity >> 1) as u8);
          }
        }
      }
    }
  }
```
