// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/PRNG.md
import { prng_seed_from, prng_next, TYPES } from "@g05";

export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  public static seedFrom(tick: number, atomId: string): number {
    return prng_seed_from(tick, atomId);
  }

  public next(): { value: number; nextState: number } {
    const result = prng_next(this.state);
    this.state = result.nextState;
    return result;
  }
}
