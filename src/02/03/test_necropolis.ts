import { GRID_W } from "../../_/mod.ts";
// OMEGA-64 | tests/test_necropolis.ts
import { assertEquals } from "https://deno.land/std@0.208.0/assert/assert_equals.ts";
import { PULSE } from "@02";
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { IMMUNE } from "@02"; // Just to verify it doesn't break GC

Deno.test({
  name: "Phase 43: The Necropolis (Fossilization & Ruins)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    await PULSE.initWorkers(1);
    
    STATE_MATRIX.clear();
    Atomics.store(STATE_MATRIX.tickCounter, 0, 0);

    const ATOM_GUARDIAN = 1;
    const ATOM_PRODUCER = 2;
    
    // Clear out lattice
    for(let i=0; i<3; i++) {
        STATE_MATRIX.recycleAtom(i);
    }
    STATE_MATRIX.structureGrid.fill(0);
    STATE_MATRIX.memoryGrid.fill(0);

    // Cell configuration
    const gCell = 10;
    const pCell = 20;

    // --- Setup Atom Guardian ---
    STATE_MATRIX.setId(ATOM_GUARDIAN, 100n);
    STATE_MATRIX.setX(ATOM_GUARDIAN, (gCell % GRID_W) * 10); // gCell X
    STATE_MATRIX.setY(ATOM_GUARDIAN, Math.floor(gCell / GRID_W) * 10); // gCell Y
    STATE_MATRIX.setRole(ATOM_GUARDIAN, STATE_MATRIX.ROLE_GUARDIAN);
    STATE_MATRIX.setResonance(ATOM_GUARDIAN, 150); // High resonance triggers fossilization
    STATE_MATRIX.setEnergy(ATOM_GUARDIAN, 0); // Born dead to trigger Fossilization on first pulse
    
    // Epigenetic trace (CRISPR Hash = 0xDEADBEEF)
    const expectedHash = 0xDEADBEEF | 0;
    STATE_MATRIX.setReg(ATOM_GUARDIAN, 13, expectedHash);

    // --- Setup Atom Producer ---
    // STATE_MATRIX.setId(ATOM_PRODUCER, 200n);
    // STATE_MATRIX.setX(ATOM_PRODUCER, (pCell % GRID_W) * 10); 
    // STATE_MATRIX.setY(ATOM_PRODUCER, Math.floor(pCell / GRID_W) * 10); 
    // STATE_MATRIX.setRole(ATOM_PRODUCER, STATE_MATRIX.ROLE_PRODUCER);
    // STATE_MATRIX.setResonance(ATOM_PRODUCER, 0); // Low resonance, no fossilization
    // STATE_MATRIX.setEnergy(ATOM_PRODUCER, 0); // Born dead to properly recycle

    // --- Simulate Metabolism Phase ---
    // Tick 1
    await PULSE.tick();

    // Verify death
    assertEquals(STATE_MATRIX.getEnergy(ATOM_GUARDIAN), 0, "Guardian failed to die");
    
    // Check Fossilization
    const gStructure = Atomics.load(STATE_MATRIX.structureGrid, gCell);
    
    // Check Epigenetic Memory Spillage
    const memOffset = gCell * 8;
    const gMem4 = STATE_MATRIX.memoryGrid[memOffset + 4];
    const gMem5 = STATE_MATRIX.memoryGrid[memOffset + 5];
    const gMem6 = STATE_MATRIX.memoryGrid[memOffset + 6];
    const gMem7 = STATE_MATRIX.memoryGrid[memOffset + 7];
    
    let extractedHash = 0;
    extractedHash |= (gMem4 << 24);
    extractedHash |= (gMem5 << 16);
    extractedHash |= (gMem6 << 8);
    extractedHash |= gMem7;

    const gType = gStructure & 0xFF;
    const gCharge = (gStructure >> 16) & 0xFF;

    // Guardian should be STR_WIRE (1) with 150 charge
    assertEquals(gType, 1, "Guardian failed to crystallize into STR_WIRE");
    assertEquals(gCharge, 150, "Guardian crystal missing charge");
    
    const pStructure = Atomics.load(STATE_MATRIX.structureGrid, pCell);
    // Producer should be STR_VOID (0)
    assertEquals(pStructure, 0, "Producer erroneously left a trace");

    assertEquals(extractedHash, expectedHash, "Guardian failed to spill accurate Epigenetic Trace");

    // Also check if generic charge was applied to bootstrap plasmid decay next tick
    const gMem0 = STATE_MATRIX.memoryGrid[memOffset + 0];
    const gMem1 = STATE_MATRIX.memoryGrid[memOffset + 1];
    const gMem2 = STATE_MATRIX.memoryGrid[memOffset + 2];
    const chargeLo = gMem0 | (gMem1 << 8) | (gMem2 << 16);
    assertEquals(chargeLo, 100, "Missing bootstrapping memory charge for Plasmid decay");

    PULSE.stopWorkers();
  },
});
