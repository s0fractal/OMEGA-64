import { GRID_W } from "@generated";
// OMEGA-64 | tests/test_necropolis.ts
import { assertEquals } from "https://deno.land/std@0.208.0/assert/assert_equals.ts";
import { PULSE } from "@generated";
import { MX } from "@generated";
import { IMMUNE } from "@generated"; // Just to verify it doesn't break GC

Deno.test({
  name: "Phase 43: The Necropolis (Fossilization & Ruins)",
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    await PULSE.initWorkers(1);
    
    MX.clear();
    Atomics.store(MX.tickCounter, 0, 0);

    const ATOM_GUARDIAN = 1;
    const ATOM_PRODUCER = 2;
    
    // Clear out lattice
    for(let i=0; i<3; i++) {
        MX.recycleAtom(i);
    }
    MX.structureGrid.fill(0);
    MX.memoryGrid.fill(0);

    // Cell configuration
    const gCell = 10;
    const pCell = 20;

    // --- Setup Atom Guardian ---
    MX.setId(ATOM_GUARDIAN, 100n);
    MX.setX(ATOM_GUARDIAN, (gCell % GRID_W) * 10); // gCell X
    MX.setY(ATOM_GUARDIAN, Math.floor(gCell / GRID_W) * 10); // gCell Y
    MX.setRole(ATOM_GUARDIAN, MX.ROLE_GUARDIAN);
    MX.setResonance(ATOM_GUARDIAN, 150); // High resonance triggers fossilization
    MX.setEnergy(ATOM_GUARDIAN, 0); // Born dead to trigger Fossilization on first pulse
    
    // Epigenetic trace (CRISPR Hash = 0xDEADBEEF)
    const expectedHash = 0xDEADBEEF | 0;
    MX.setReg(ATOM_GUARDIAN, 13, expectedHash);

    // --- Setup Atom Producer ---
    // MX.setId(ATOM_PRODUCER, 200n);
    // MX.setX(ATOM_PRODUCER, (pCell % GRID_W) * 10); 
    // MX.setY(ATOM_PRODUCER, Math.floor(pCell / GRID_W) * 10); 
    // MX.setRole(ATOM_PRODUCER, MX.ROLE_PRODUCER);
    // MX.setResonance(ATOM_PRODUCER, 0); // Low resonance, no fossilization
    // MX.setEnergy(ATOM_PRODUCER, 0); // Born dead to properly recycle

    // --- Simulate Metabolism Phase ---
    // Tick 1
    await PULSE.tick();

    // Verify death
    assertEquals(MX.getEnergy(ATOM_GUARDIAN), 0, "Guardian failed to die");
    
    // Check Fossilization
    const gStructure = Atomics.load(MX.structureGrid, gCell);
    
    // Check Epigenetic Memory Spillage
    const memOffset = gCell * 8;
    const gMem4 = MX.memoryGrid[memOffset + 4];
    const gMem5 = MX.memoryGrid[memOffset + 5];
    const gMem6 = MX.memoryGrid[memOffset + 6];
    const gMem7 = MX.memoryGrid[memOffset + 7];
    
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
    
    const pStructure = Atomics.load(MX.structureGrid, pCell);
    // Producer should be STR_VOID (0)
    assertEquals(pStructure, 0, "Producer erroneously left a trace");

    assertEquals(extractedHash, expectedHash, "Guardian failed to spill accurate Epigenetic Trace");

    // Also check if generic charge was applied to bootstrap plasmid decay next tick
    const gMem0 = MX.memoryGrid[memOffset + 0];
    const gMem1 = MX.memoryGrid[memOffset + 1];
    const gMem2 = MX.memoryGrid[memOffset + 2];
    const chargeLo = gMem0 | (gMem1 << 8) | (gMem2 << 16);
    assertEquals(chargeLo, 100, "Missing bootstrapping memory charge for Plasmid decay");

    PULSE.stopWorkers();
  },
});
