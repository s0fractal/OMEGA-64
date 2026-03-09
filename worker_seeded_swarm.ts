export const SPAWN_RING_CAPACITY = 1024;
const WORLD_MAX_X = 1399;
const WORLD_MAX_Y = 799;

type StateMatrixLike = {
  RISC: {
    OP_REPLICATE: number;
    OP_SIGNAL: number;
    OP_JMP: number;
    OP_ROLE: number;
    OP_BUILD: number;
    OP_SET: number;
    OP_SYSCALL: number;
  };
  ROLE_ARCHITECT: number;
  ROLE_PRODUCER: number;
  SYNC: {
    IDLE: number;
  };
  syncState: Int32Array;
  tickCounter: Int32Array;
  clear: () => void;
  seedAtom: (
    idx: number,
    id: bigint,
    x: number,
    y: number,
    energy: number,
    mass: number,
    genome: Uint8Array,
    script: Uint8Array,
  ) => void;
  setRole: (idx: number, role: number) => void;
  getActiveIndices: () => number[];
  getId: (idx: number) => bigint;
  getX: (idx: number) => number;
  getY: (idx: number) => number;
};

type SeededSwarmConfig = {
  seed: number;
  replicators: number;
  architects: number;
};

const makeReplicatorScript = (stateMatrix: StateMatrixLike): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  // R0 = 4 (SYS_SPAWN)
  script[pc++] = stateMatrix.RISC.OP_SET;
  script[pc++] = 0; // R0
  script[pc++] = 4; // SYS_SPAWN
  // SYS_SPAWN child_x=R1, child_y=R2. Let's just use 0 (relative) or whatever
  script[pc++] = stateMatrix.RISC.OP_SYSCALL;
  
  script[pc++] = stateMatrix.RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

const makeArchitectScript = (stateMatrix: StateMatrixLike): Uint8Array => {
  const script = new Uint8Array(64);
  let pc = 0;
  script[pc++] = stateMatrix.RISC.OP_ROLE;
  script[pc++] = 0;
  script[pc++] = stateMatrix.ROLE_ARCHITECT;
  script[pc++] = stateMatrix.RISC.OP_BUILD;
  script[pc++] = 1;
  script[pc++] = 1;
  script[pc++] = stateMatrix.RISC.OP_SIGNAL;
  script[pc++] = stateMatrix.RISC.OP_JMP;
  script[pc++] = 0;
  return script;
};

export const seedSeededSwarmScenario = (
  stateMatrix: StateMatrixLike,
  config: SeededSwarmConfig,
): number => {
  const { seed, replicators, architects } = config;

  stateMatrix.clear();
  Atomics.store(stateMatrix.syncState, 0, stateMatrix.SYNC.IDLE);
  Atomics.store(stateMatrix.tickCounter, 0, 1);

  const repScript = makeReplicatorScript(stateMatrix);
  const archScript = makeArchitectScript(stateMatrix);

  for (let i = 0; i < replicators; i++) {
    const idx = 1000 + i * 197;
    const x = 180 + (i % 5) * 220;
    const y = 120 + Math.floor(i / 5) * 220;
    const id = (BigInt(seed >>> 0) << 32n) ^ BigInt(idx + 1);
    const genome = new Uint8Array(8);
    genome[0] = (seed + i * 17) & 0xff;
    genome[1] = (seed >>> 8) & 0xff;
    genome[2] = 0xaa;
    genome[3] = i & 0xff;
    stateMatrix.seedAtom(
      idx,
      id,
      x,
      y,
      3200,
      260 + (i % 7),
      genome,
      repScript,
    );
    stateMatrix.setRole(idx, stateMatrix.ROLE_PRODUCER);
  }

  for (let i = 0; i < architects; i++) {
    const idx = 5000 + i * 211;
    const x = 420 + (i % 3) * 150;
    const y = 280 + Math.floor(i / 3) * 150;
    const id = ((BigInt(seed >>> 0) << 32n) ^ 0xABCDEF00n) + BigInt(i + 1);
    const genome = new Uint8Array(8);
    genome[0] = 0xf0;
    genome[1] = (seed + i * 13) & 0xff;
    genome[2] = 0x0d;
    genome[3] = 0x42;
    stateMatrix.seedAtom(
      idx,
      id,
      x,
      y,
      2600,
      180 + (i % 5),
      genome,
      archScript,
    );
    stateMatrix.setRole(idx, stateMatrix.ROLE_ARCHITECT);
  }

  return replicators + architects;
};

export const assertSeededSwarmWorldInvariants = (
  stateMatrix: StateMatrixLike,
  errorPrefix: string,
): number => {
  const active = stateMatrix.getActiveIndices();
  for (const idx of active) {
    const id = stateMatrix.getId(idx);
    if (id === 0n) {
      throw new Error(`${errorPrefix} Active index ${idx} has zero id.`);
    }
    const x = stateMatrix.getX(idx);
    const y = stateMatrix.getY(idx);
    if (x < 0 || x > WORLD_MAX_X || y < 0 || y > WORLD_MAX_Y) {
      throw new Error(`${errorPrefix} Atom ${idx} out of bounds: (${x},${y}).`);
    }
  }
  return active.length;
};
