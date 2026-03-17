// SSoT: file:///Users/s0fractal/OMEGA/I/autopoiesis/unpack_glyph_kind.md

@inline
export function unpack_glyph_kind(header: i32): i32 {
return header & 0xFF;
}
