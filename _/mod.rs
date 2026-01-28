// 🛡️ L62 RS mod
pub mod core;
pub mod _;
pub use self::core::*;
pub use self::_::*;
pub struct Identity { pub depth: u32, pub level: u32, pub witness: &'static str }
pub const IDENTITY: Identity = Identity { depth: _::IDENTITY.depth + 1, level: 63 - (_::IDENTITY.depth + 1), witness: "00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048" };
