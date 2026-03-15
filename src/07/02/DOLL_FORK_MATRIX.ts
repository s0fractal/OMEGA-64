// OMEGA-64 | DOLL_FORK_MATRIX.ts | Stage 21: The Doll Fork
import { BONDS_OFFSET, BOND_DISTANCES_OFFSET, CAUSALITY_OFFSET, COHERENCE_OFFSET, DAMPING_OFFSET, ENERGY_OFFSET, GLYPH_HEADER_OFFSET, GLYPH_PAYLOAD_OFFSET, GRID_CELLS, HORMONE_OFFSET, IDS_OFFSET, LOGIC_OFFSET, MAX_ATOMS, MEMORY_GRID_OFFSET, PHASE_OFFSET, PHYSICS_READ_ENERGY_OFFSET, PHYSICS_READ_RESONANCE_OFFSET, PHYSICS_READ_XS_OFFSET, PHYSICS_READ_YS_OFFSET, RESONANCE_OFFSET, ROLES_OFFSET, SIGNAL_GRID_OFFSET, STIFFNESS_OFFSET, STRUCTURE_GRID_OFFSET, WASM_MEMORY_PAGES, XS_OFFSET, YS_OFFSET } from "@generated";
import { sharedBuffer as mainlineBuffer } from "@generated";

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
    coherence: Int32Array;
    // Physics Read Support (Double Buffering)
    readXs: Int16Array;
    readYs: Int16Array;
    readEnergies: Int32Array;
    readResonances: Int32Array;
  };

  constructor(customMemory?: WebAssembly.Memory) {
    this.wasmMemory = customMemory ?? new WebAssembly.Memory({
      initial: WASM_MEMORY_PAGES,
      maximum: WASM_MEMORY_PAGES,
      shared: true,
    });
    this.shardBuffer = this.wasmMemory.buffer as SharedArrayBuffer;

    // Initialize primary views (Host side)
    const b = this.shardBuffer;
    this.views = {
      ids: new BigUint64Array(b, IDS_OFFSET, MAX_ATOMS),
      xs: new Int16Array(b, XS_OFFSET, MAX_ATOMS),
      ys: new Int16Array(b, YS_OFFSET, MAX_ATOMS),
      energies: new Int32Array(b, ENERGY_OFFSET, MAX_ATOMS),
      resonances: new Int32Array(
        b,
        RESONANCE_OFFSET,
        MAX_ATOMS,
      ),
      phases: new Int32Array(b, PHASE_OFFSET, MAX_ATOMS),
      roles: new Uint8Array(b, ROLES_OFFSET, MAX_ATOMS),
      logic: new Uint8Array(b, LOGIC_OFFSET, MAX_ATOMS * 8),
      bonds: new Uint32Array(b, BONDS_OFFSET, MAX_ATOMS * 4),
      stiffness: new Float32Array(
        b,
        STIFFNESS_OFFSET,
        MAX_ATOMS * 4,
      ),
      bondDistances: new Uint8Array(
        b,
        BOND_DISTANCES_OFFSET,
        MAX_ATOMS * 4,
      ),
      damping: new Uint8Array(b, DAMPING_OFFSET, MAX_ATOMS),
      causality: new Uint8Array(b, CAUSALITY_OFFSET, MAX_ATOMS),
      hormones: new Uint16Array(b, HORMONE_OFFSET, 6),
      signalGrid: new Int32Array(
        b,
        SIGNAL_GRID_OFFSET,
        GRID_CELLS,
      ),
      memoryGrid: new Uint8Array(
        b,
        MEMORY_GRID_OFFSET,
        GRID_CELLS * 8,
      ),
      structureGrid: new Int32Array(
        b,
        STRUCTURE_GRID_OFFSET,
        GRID_CELLS,
      ),
      glyphHeader: new Int32Array(
        b,
        GLYPH_HEADER_OFFSET,
        GRID_CELLS,
      ),
      glyphPayload: new Uint8Array(
        b,
        GLYPH_PAYLOAD_OFFSET,
        GRID_CELLS * 8,
      ),
      coherence: new Int32Array(b, COHERENCE_OFFSET, 1),
      readXs: new Int16Array(
        b,
        PHYSICS_READ_XS_OFFSET,
        MAX_ATOMS,
      ),
      readYs: new Int16Array(
        b,
        PHYSICS_READ_YS_OFFSET,
        MAX_ATOMS,
      ),
      readEnergies: new Int32Array(
        b,
        PHYSICS_READ_ENERGY_OFFSET,
        MAX_ATOMS,
      ),
      readResonances: new Int32Array(
        b,
        PHYSICS_READ_RESONANCE_OFFSET,
        MAX_ATOMS,
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
    for (let i = 0; i < MAX_ATOMS; i++) {
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
