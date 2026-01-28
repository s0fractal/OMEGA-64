// 🛡️ L63 RS mod
pub mod core;
pub mod _;
pub use self::core::*;
pub use self::_::*;
pub struct Identity { pub depth: u32, pub level: u32, pub witness: &'static str }
pub const IDENTITY: Identity = Identity { depth: _::IDENTITY.depth + 1, level: 63 - (_::IDENTITY.depth + 1), witness: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f" };
