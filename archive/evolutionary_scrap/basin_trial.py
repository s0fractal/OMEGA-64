from gaia_grid import GaiaGrid, CellState
import json

def run_basin_trial():
    print("🌊 Starting V60.0 Basin Trial: Dnieper Delta Metabolism...")
    grid = GaiaGrid()

    # 1. Define nodes (River Basin Mockup)
    # R1 -> R2 (Main river)
    # R2 -> D1, D2, D3 (Delta channels)
    # P1 (Port - connected to D3)
    grid.add_cell("R1", 0, 5, conductance=1.0) # Source
    grid.add_cell("R2", 1, 5, conductance=1.0) # Flow
    grid.add_cell("D1", 2, 6, conductance=0.8) # Channel 1
    grid.add_cell("D2", 2, 4, conductance=0.8) # Channel 2
    grid.add_cell("D3", 2, 5, conductance=0.9) # Channel 3 (Main)
    grid.add_cell("P1", 3, 5, conductance=0.5) # Port node
    grid.add_cell("X1", 3, 7, conductance=0.1) # Dry land (Conflict potential)

    grid.link("R1", "R2")
    grid.link("R2", "D1")
    grid.link("R2", "D2")
    grid.link("R2", "D3")
    grid.link("D3", "P1")
    grid.link("D1", "X1")

    # 2. Inject Intent and Traces
    grid.cells["R1"].intent_level = 1.0  # Intent starts at source
    grid.cells["P1"].trace_density = 0.9 # Hard data anchor at port
    grid.cells["D3"].trace_density = 0.7 # Some sediment in main channel

    print("   [STEP 1] Initializing Flow...")
    for _ in range(10):
        grid.pulse_metabolism()

    # 3. Simulate Discrepancy (Fake flow into X1)
    print("   [STEP 2] Simulating Discrepancy at Dry Node X1...")
    grid.cells["X1"].intent_level = 0.8 # Myth claims flow here
    
    # 4. Metabolic Reality Check (Loop to allow pain to accumulate)
    print("   [STEP 3] Running Coherence Monitoring...")
    discrepancies = []
    for _ in range(5):
        discrepancies = grid.check_coherence()
    
    # 5. Output Report
    print(f"\n🌍 Gaia Coherence Report:")
    for d in discrepancies:
        print(f"   [PAIN] {d['cell']}: {d['msg']} (Pain Index: {d['pain']:.2f})")

    # Verify crystallization
    grid.check_coherence() # Repeat to settle states
    if grid.cells["P1"].state == CellState.SIGMA:
        print(f"   [SIGMA] Node P1 (Port) successfully crystallized via Mineral Anchor.")

    # Verification checks
    assert len(discrepancies) > 0, "Should have detected conflict at X1"
    assert grid.cells["P1"].state == CellState.SIGMA, "P1 should be crystallized"
    print("\n✅ Basin Trial Simulation Successful.")

if __name__ == "__main__":
    run_basin_trial()
