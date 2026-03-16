// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/set_neural_coherence.md
import { NEURAL_COHERENCE_OFF } from "../01/mod";

@inline
export function set_neural_coherence(value: i32): void {
atomic.store<i32>(NEURAL_COHERENCE_OFF as usize, value);
}
