import { AVATAR_ENGINE } from "@g";
import { MX } from "@g";
import { GRID_W, SCALE } from "@g";

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
  MX.clear();

  const center = getGridIdx(700, 400);
  const east = getGridIdx(720, 400);

  const beforeCenter = MX.attentionField[center];
  const beforeEast = MX.attentionField[east];

  AVATAR_ENGINE.dropPheromone(700, 400);

  const afterCenter = MX.attentionField[center];
  const afterEast = MX.attentionField[east];
  assert(afterCenter > beforeCenter, "center attention should increase");
  assert(afterEast > beforeEast, "neighbor attention should receive gradient");

  console.log(
    `[attention-field] runtime guard passed. center=${
      afterCenter.toFixed(2)
    }`,
  );
};

main();
