// SSoT: src/ontology/autopoiesis/reset_neural_coherence.md
import { COHERENCE_OFF } from "../01/mod";

@inline
export function reset_neural_coherence(): void {
atomic.store<i32>(COHERENCE_OFF as usize, 0); // Reset accumulator
}
