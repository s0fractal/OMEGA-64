// SSoT: src/ontology/core/get_glyph_kind.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_kind(id: u8) -> u8 {
    if id <= 3 {
      return KIND_CORE;
    }
    if id <= 15 {
      return KIND_CONTROL;
    }
    return id >> 3;
}
