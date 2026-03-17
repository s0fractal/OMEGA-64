---
id: sigma_math
type: substrate_module
target: rust
level: 2
deps:
description: Mathematical Coprocessor (Deterministic LUT Trigonometry)
---

# `Math Coprocessor`

```rust
// Flatten the levels backwards into the math namespace so external code can just use `crate::math_sin`
pub use crate::ontology_gen::L01::*;
pub use crate::ontology_gen::L00::*;
```
