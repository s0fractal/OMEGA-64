import { AVATAR_ENGINE } from "@generated";
import { STATE_MATRIX } from "@generated";
import { GRID_W, SCALE } from "@generated";

const getGridIdx = (x: number, y: number) => {
  const gx = Math.floor(x / SCALE);
  const gy = Math.floor(y / SCALE);
  if (gx < 0 || gx >= GRID_W || gy < 0) return 0;
  return gx + gy * GRID_W;
};

const assert = (cond: boolean, reason: string): void => {
  if (!cond) {
    throw new Error(`[attention-field] ${reason}`);
  }
};

const main = () => {
  STATE_MATRIX.clear();

  const center = getGridIdx(700, 400);
  const east = getGridIdx(720, 400);

  const beforeCenter = STATE_MATRIX.attentionField[center];
  const beforeEast = STATE_MATRIX.attentionField[east];

  AVATAR_ENGINE.dropPheromone(700, 400);

  const afterCenter = STATE_MATRIX.attentionField[center];
  const afterEast = STATE_MATRIX.attentionField[east];
  assert(afterCenter > beforeCenter, "center attention should increase");
  assert(afterEast > beforeEast, "neighbor attention should receive gradient");

  console.log(
    `[attention-field] runtime guard passed. center=${
      afterCenter.toFixed(2)
    }`,
  );
};

main();
