// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/pack_glyph_header.md

@inline
export function pack_glyph_header(kind: i32, amplitude: i32): i32 {
if (amplitude < -12000) amplitude = -12000;
if (amplitude > 12000) amplitude = 12000;
return (amplitude << 8) | (kind & 0xFF);
}
