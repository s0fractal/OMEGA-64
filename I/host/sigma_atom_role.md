---
id: sigma_atom_role
type: substrate_module
target: rust
level: 2
deps:
description: Defines the role enumerations for OMEGA atoms
---

# `AtomRole`

```rust
pub const U64_BYTES: usize = 8;
pub const I32_BYTES: usize = 4;
pub const I16_BYTES: usize = 2;
pub const F32_BYTES: usize = 4;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomRole {
    None = 0,
    Guardian = 1,
    Architect = 2,
    Artisan = 3,
    Parasite = 4,
    Mitochondria = 5,
    MetazoanFlag = 0x80,
}

impl AtomRole {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Guardian,
            2 => Self::Architect,
            3 => Self::Artisan,
            4 => Self::Parasite,
            5 => Self::Mitochondria,
            0x80 => Self::MetazoanFlag,
            _ => Self::None,
        }
    }
}
```
