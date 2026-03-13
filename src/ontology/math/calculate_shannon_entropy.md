---
id: calculate_shannon_entropy
type: pure_fn
description: "Швидкий розрахунок ентропії за допомогою LUT"
deps: 
  - C_LOG2_C_LUT
args:
  data: usize
rsArgs:
  data: "&[u8; 64]"
returns: i32
tests:
---

### Rust
> [!NOTE]
> The `data` param must map cleanly from WASM. Here we hardcode `&[u8; 64]` as a custom type for now.

```rust
    let mut counts = [0i32; 256];
    for &b in data.iter() {
        counts[b as usize] += 1;
    }

    let mut sum_c_log_c = 0;
    for &c in counts.iter() {
        if c > 0 {
            sum_c_log_c += C_LOG2_C_LUT[c as usize];
        }
    }

    let mut entropy = 6000 - (sum_c_log_c >> 6);
    
    if entropy < 0 {
        entropy = 0;
    } else if entropy > 6000 {
        entropy = 6000;
    }
    
    entropy
```

### TypeScript
```typescript
  // Stub for WASM
  return 0;
```
