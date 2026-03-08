// OMEGA-64 | DOLL_FORK_MATRIX.ts | Stage 21: The Doll Fork
import * as OFFSETS from "../../OFFSETS.ts";
import { sharedBuffer as mainlineBuffer } from "../../STATE_MATRIX.ts";

/**
 * DollFork provides an isolated memory space (Shadow Matrix) that mirrors the mainline STATE_MATRIX.
 * It allows for risk-free simulation, mutation, and relic cultivation without affecting global causality.
 */
export class DollFork {
  public wasmMemory: WebAssembly.Memory;
  public shardBuffer: SharedArrayBuffer;
  public views: {
    ids: BigUint64Array;
    xs: Int16Array;
    ys: Int16Array;
    energies: Int32Array;
    resonances: Int32Array;
    phases: Int32Array;
    roles: Uint8Array;
    logic: Uint8Array;
    bonds: Uint32Array;
    stiffness: Float32Array;
    bondDistances: Uint8Array;
    damping: Uint8Array;
    causality: Uint8Array;
    hormones: Uint16Array;
    signalGrid: Int32Array;
    memoryGrid: Uint8Array;
    structureGrid: Int32Array;
    glyphHeader: Int32Array;
    glyphPayload: Uint8Array;
    // Physics Read Support (Double Buffering)
    readXs: Int16Array;
    readYs: Int16Array;
    readEnergies: Int32Array;
    readResonances: Int32Array;
  };

  constructor(customMemory?: WebAssembly.Memory) {
    this.wasmMemory = customMemory ?? new WebAssembly.Memory({
      initial: OFFSETS.WASM_MEMORY_PAGES,
      maximum: OFFSETS.WASM_MEMORY_PAGES,
      shared: true,
    });
    this.shardBuffer = this.wasmMemory.buffer as SharedArrayBuffer;

    // Initialize primary views (Host side)
    const b = this.shardBuffer;
    this.views = {
      ids: new BigUint64Array(b, OFFSETS.IDS_OFFSET, OFFSETS.MAX_ATOMS),
      xs: new Int16Array(b, OFFSETS.XS_OFFSET, OFFSETS.MAX_ATOMS),
      ys: new Int16Array(b, OFFSETS.YS_OFFSET, OFFSETS.MAX_ATOMS),
      energies: new Int32Array(b, OFFSETS.ENERGY_OFFSET, OFFSETS.MAX_ATOMS),
      resonances: new Int32Array(
        b,
        OFFSETS.RESONANCE_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      phases: new Int32Array(b, OFFSETS.PHASE_OFFSET, OFFSETS.MAX_ATOMS),
      roles: new Uint8Array(b, OFFSETS.ROLES_OFFSET, OFFSETS.MAX_ATOMS),
      logic: new Uint8Array(b, OFFSETS.LOGIC_OFFSET, OFFSETS.MAX_ATOMS * 8),
      bonds: new Uint32Array(b, OFFSETS.BONDS_OFFSET, OFFSETS.MAX_ATOMS * 4),
      stiffness: new Float32Array(
        b,
        OFFSETS.STIFFNESS_OFFSET,
        OFFSETS.MAX_ATOMS * 4,
      ),
      bondDistances: new Uint8Array(
        b,
        OFFSETS.BOND_DISTANCES_OFFSET,
        OFFSETS.MAX_ATOMS * 4,
      ),
      damping: new Uint8Array(b, OFFSETS.DAMPING_OFFSET, OFFSETS.MAX_ATOMS),
      causality: new Uint8Array(b, OFFSETS.CAUSALITY_OFFSET, OFFSETS.MAX_ATOMS),
      hormones: new Uint16Array(b, OFFSETS.HORMONE_OFFSET, 6),
      signalGrid: new Int32Array(
        b,
        OFFSETS.SIGNAL_GRID_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      memoryGrid: new Uint8Array(
        b,
        OFFSETS.MEMORY_GRID_OFFSET,
        OFFSETS.GRID_CELLS * 8,
      ),
      structureGrid: new Int32Array(
        b,
        OFFSETS.STRUCTURE_GRID_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      glyphHeader: new Int32Array(
        b,
        OFFSETS.GLYPH_HEADER_OFFSET,
        OFFSETS.GRID_CELLS,
      ),
      glyphPayload: new Uint8Array(
        b,
        OFFSETS.GLYPH_PAYLOAD_OFFSET,
        OFFSETS.GRID_CELLS * 8,
      ),
      readXs: new Int16Array(
        b,
        OFFSETS.PHYSICS_READ_XS_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readYs: new Int16Array(
        b,
        OFFSETS.PHYSICS_READ_YS_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readEnergies: new Int32Array(
        b,
        OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
      readResonances: new Int32Array(
        b,
        OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
        OFFSETS.MAX_ATOMS,
      ),
    };
  }

  /**
   * Performs a bit-perfect deep copy from the mainline sharedBuffer into the DollFork shard.
   */
  public forkFromMainline(): void {
    const mainlineView = new Uint8Array(mainlineBuffer);
    const shardView = new Uint8Array(this.shardBuffer);
    shardView.set(mainlineView);
  }

  /**
   * Synchronizes 'Physics Read' buffers from primary buffers.
   * Essential before calling WASM execution kernels in the shadow world.
   */
  public syncReadViews(): void {
    this.views.readXs.set(this.views.xs);
    this.views.readYs.set(this.views.ys);
    this.views.readEnergies.set(this.views.energies);
    this.views.readResonances.set(this.views.resonances);
  }

  public getMetrics() {
    let totalEnergy = 0;
    let activePopulation = 0;
    for (let i = 0; i < OFFSETS.MAX_ATOMS; i++) {
      if (this.views.energies[i] > 0) {
        totalEnergy += Number(this.views.energies[i]);
        activePopulation++;
      }
    }
    return {
      activePopulation,
      totalEnergy,
      avgEnergy: activePopulation > 0 ? totalEnergy / activePopulation : 0,
    };
  }
}
