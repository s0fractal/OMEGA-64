import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";

const assert = (cond: boolean, reason: string): void => {
  if (!cond) {
    throw new Error(`[attention-field] ${reason}`);
  }
};

const main = () => {
  STATE_MATRIX.clear();

  const center = PHYSICS_ENGINE.getGridIdx(700, 400);
  const east = PHYSICS_ENGINE.getGridIdx(720, 400);

  assert(
    PHYSICS_ENGINE.ATTENTION_PHEROMONES === STATE_MATRIX.attentionField,
    "PHYSICS attention view must alias STATE_MATRIX attention field",
  );

  const beforeCenter = PHYSICS_ENGINE.ATTENTION_PHEROMONES[center];
  const beforeEast = PHYSICS_ENGINE.ATTENTION_PHEROMONES[east];

  AVATAR_ENGINE.dropPheromone(700, 400);

  const afterCenter = PHYSICS_ENGINE.ATTENTION_PHEROMONES[center];
  const afterEast = PHYSICS_ENGINE.ATTENTION_PHEROMONES[east];
  assert(afterCenter > beforeCenter, "center attention should increase");
  assert(afterEast > beforeEast, "neighbor attention should receive gradient");

  PHYSICS_ENGINE.decayPheromones();

  const decayedCenter = PHYSICS_ENGINE.ATTENTION_PHEROMONES[center];
  assert(
    decayedCenter < afterCenter,
    "attention field should decay after pheromone decay tick",
  );

  console.log(
    `[attention-field] runtime guard passed. center=${
      afterCenter.toFixed(2)
    } -> ${decayedCenter.toFixed(2)}`,
  );
};

main();
