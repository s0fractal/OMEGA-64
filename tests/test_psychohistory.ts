import { assert, assertEquals } from "https://deno.land/std@0.210.0/assert/mod.ts";
import { LINEAGE_TRACKER } from "../06_akasha/mod.ts";
import { STATE_MATRIX } from "../00_substrate/mod.ts";

Deno.test("Psychohistorian's Archive - Epoch Resolution", () => {
    // Clean state
    LINEAGE_TRACKER.registry.clear();
    LINEAGE_TRACKER.lastScanTick = 0;

    // Simulate tick 100
    // "Cooperative" meme: e.g. 0xA6... (COLLECTIVE)
    const coopMeme = new Uint8Array(64);
    coopMeme[0] = 0xA6; coopMeme[1] = 0x05;
    const coopHex = LINEAGE_TRACKER.toHex(coopMeme.subarray(0, 8));

    // "Aggressive" meme: e.g. 0x80... (REPLICATE)
    const aggroMeme = new Uint8Array(64);
    aggroMeme[0] = 0x80; aggroMeme[1] = 0x00;
    const aggroHex = LINEAGE_TRACKER.toHex(aggroMeme.subarray(0, 8));

    // Clear matrix explicitly in case dirty state exists
    for(let i=0; i<10; i++) STATE_MATRIX.setId(i, 0n);

    // 2 Cooperative atoms, high energy (simulating a structurally sound membrane)
    STATE_MATRIX.setId(0, 100n); STATE_MATRIX.setInstructions(0, coopMeme); STATE_MATRIX.setEnergy(0, 5000);
    STATE_MATRIX.setId(1, 101n); STATE_MATRIX.setInstructions(1, coopMeme); STATE_MATRIX.setEnergy(1, 5500);

    // 6 Aggressive atoms, low energy (simulating rapid but unsustainable replication)
    for(let i=2; i<8; i++) {
        STATE_MATRIX.setId(i, BigInt(100+i)); 
        STATE_MATRIX.setInstructions(i, aggroMeme); 
        STATE_MATRIX.setEnergy(i, 100);
    }

    LINEAGE_TRACKER.updateMetrics(100);

    // Fast-forward to tick 200, one aggro died
    STATE_MATRIX.setId(7, 0n);
    LINEAGE_TRACKER.updateMetrics(200);

    const coopStats = LINEAGE_TRACKER.registry.get(coopHex);
    const aggroStats = LINEAGE_TRACKER.registry.get(aggroHex);

    assert(coopStats);
    assert(aggroStats);

    assertEquals(coopStats.peakAdoption, 2);
    assertEquals(aggroStats.peakAdoption, 6);

    // cumulativeLifespan: 
    // At tick 100: coop gets 2 * 100 = 200 lifespan. aggro gets 6 * 100 = 600.
    // At tick 200: coop gets 2 * 100 = 200 lifespan. aggro gets 5 * 100 = 500.
    // Total coop span: 400. Total aggro span: 1100.
    assertEquals(coopStats.cumulativeLifespan, 400);
    assertEquals(aggroStats.cumulativeLifespan, 1100);

    // Close Epoch
    const { dominantMeme, destructiveMeme } = LINEAGE_TRACKER.closeEpoch(200);

    assertEquals(dominantMeme, aggroHex, "Top adoption meme must be the dominant meme");
    assertEquals(destructiveMeme, aggroHex, "Aggressive meme must have lowest energyROI");

    // Make sure registry clears
    assertEquals(LINEAGE_TRACKER.registry.size, 0);
});
