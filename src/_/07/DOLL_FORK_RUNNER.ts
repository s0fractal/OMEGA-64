// SSoT: file:///Users/s0fractal/OMEGA/I/core/doll_fork_runner.md
import { DollFork, LOGGER, Le, MAX_ATOMS } from "@g06";

// OMEGA-64 | DOLL_FORK_RUNNER.ts | Stage 21: The Doll Fork

export class DollForkRunner {
  private wasmInstance: WebAssembly.Instance | null = null;
  private fork: DollFork;

  constructor(fork: DollFork) {
    this.fork = fork;
  }

  /**
   * Initializes a private WebAssembly instance for the shadow matrix.
   */
  public async init(): Promise<void> {
    const wasmRes = await fetch(
      AS_WASM_PATH,
    );
    const wasmBytes = await wasmRes.arrayBuffer();

    const traceAtom = (
      idx: number,
      op: number,
      gx: number,
      gy: number,
      target: number,
    ) => {
      // Shadow traces are suppressed
    };

    const instantiated = await WebAssembly.instantiate(wasmBytes, {
      index: { trace_atom: traceAtom },
      env: {
        memory: this.fork.wasmMemory,
        abort: (msg: any) => Le("[SHADOW WASM ABORT]:", msg),
        trace_atom: traceAtom,
      },
    });

    this.wasmInstance = instantiated.instance;
  }

  /**
   * Executes a single discrete shadow tick on the forked matrix.
   */
  public runShadowTick(tickCount: number): void {
    if (!this.wasmInstance) throw new Error("DollForkRunner not initialized");

    // 0. Sync Read Views (Double Buffering)
    this.fork.syncReadViews();

    const exports = this.wasmInstance.exports as any;

    try {
      // 1. Build Spatial Hash
      exports.build_spatial_hash();

      // 2. Execute Atoms (Physics + VM)
      for (let i = 0; i < MAX_ATOMS; i++) {
        if (this.fork.views.ids[i] !== 0n) {
          exports.execute_atom(i);
        }
      }

      // 3. Resolve Bonds & Spawns
      exports.resolve_bond_requests(0, MAX_ATOMS);
      exports.drain_spawn_requests(tickCount);

      // 4. Tick Environment (Glyph Transport, Decay)
      exports.tickGlyphTransport(tickCount);
      exports.tick_environment(tickCount);

      // 5. Apply Metabolism
      exports.apply_metabolism_kernel(
        0,
        MAX_ATOMS,
        0,
        0, // Novelty/Symbiosis
        10, // Base Tax
        1000, // Target Energy
        10,
        10,
        10, // Band, MaxDelta, Overflow
        0, // Spatial Overflow
        1, // Starvation Floor
        0, // Subsidy
      );
    } catch (err) {
      Le("[SHADOW TICK ERROR]", err);
      throw err;
    }
  }
}
