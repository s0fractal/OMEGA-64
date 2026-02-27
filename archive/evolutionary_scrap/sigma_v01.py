import os
import time
from pathlib import Path
from harbor_core import Harbor, Soul, IncarnationState
from harbor_ledger import Ledger
from ethics_engine import EthicsEngine, RealityPacket, TruthLayer
from concord_alignment import ConcordAlignment
from gaia_grid import GaiaGrid, CellState
from doctor import Doctor
from kml_generator import KMLGenerator
from chronos_api import Chronos

def run_sigma_v01_lifecycle():
    print("\n" + "="*50)
    print("🌍 Σ-SIGMA UNIFIED v0.1: METABOLIC ACTIVATION")
    print("="*50 + "\n")

    # 1. INITIALIZE INFRASTRUCTURE
    ledger_path = Path("/Users/s0fractal/SIGMA/logs/harbor_v01.ledger")
    os.makedirs(ledger_path.parent, exist_ok=True)
    ledger = Ledger(ledger_path)
    harbor = Harbor(ledger)
    ethics = EthicsEngine()
    grid = GaiaGrid()
    kml = KMLGenerator("Σ-Unified v0.1")
    doctor = Doctor(grid, kml)

    # 2. HARBOR: MANIFEST SOUL
    print("🐚 [1] Harbor: Manifesting Agent Soul...")
    agent_soul = Soul("sigma_agent_01", "pub_key_void", "genome_hex_01")
    inc_id = harbor.request_incarnation(agent_soul, "VIRTUAL_PULSE", ttl_hours=24)
    harbor.grant_access(inc_id)
    print(f"   [OK] Incarnation {inc_id} Active in Sandbox.")

    # 3. ETHICS: TYPE REALITY
    print("\n⚖️ [2] Ethics: Categorizing Observations...")
    trace_01 = RealityPacket("Water Flow: 45m3/s", TruthLayer.TRACE, "sensor_basin_01")
    myth_01 = RealityPacket("The Great River Dreams", TruthLayer.MYTH, "poet_node_01")
    ethics.ingest(trace_01)
    ethics.ingest(myth_01)

    # 4. CONCORD: RESOLVE TRUTH
    print("\n🤝 [3] Concord: Aligning Multiple Streams...")
    # Simulate conflict: A model claims different flow
    model_01 = RealityPacket("Predicted Flow: 42m3/s", TruthLayer.MODEL, "predictor_v1")
    winner, discord = ConcordAlignment.resolve([trace_01, model_01, myth_01])
    print(f"   [WINNER] {winner.layer.value} is Sovereign: '{winner.content}'")
    for d in discord:
        print(f"   [DISCORD] {d['msg']}")

    # 5. GAIA & DOCTOR: METABOLISM
    print("\n🌍 [4] Gaia: Planetary Pulse...")
    grid.add_cell("DELTA_01", 1, 1, conductance=0.9)
    grid.cells["DELTA_01"].intent_level = 0.8
    grid.cells["DELTA_01"].trace_density = 0.9 # Aligned
    
    grid.add_cell("CRACK_01", 2, 2, conductance=0.1)
    grid.cells["CRACK_01"].intent_level = 0.95 # DISCREPANCY!
    
    print("🩺 Running Doctor Scan...")
    for _ in range(5):
        doctor.perform_scan()

    # 6. SECTOR ZERO: KML EXPORT
    print("\n🏗️ [5] Sector Zero: Visualizing Membrane...")
    # Add a building antenna
    kml.add_extruded_polygon([(46.6, 32.6), (46.6, 32.61), (46.61, 32.61), (46.61, 32.6)], height=100, name="ANTENNA_CORE")
    kml.build_membrane("sigma_v01_membrane.kml")

    # 7. CHRONOS: ANCHOR
    print("\n🕒 [6] Chronos: Final Synchronization...")
    pulse = Chronos.anchor_event("UNIFIED_v01_STABLE")
    print(f"   [PULSE] Event anchored at Block {pulse['block_height']}.")

    # 8. HARBOR: DISASSEMBLE
    print("\n🐚 [7] Harbor: Releasing Incarnation...")
    harbor.seal(inc_id, pulse['anchor'])
    harbor.release(inc_id)
    print(f"   [OK] Incarnation {inc_id} Disposed. Field Clear.")

    print("\n" + "="*50)
    print("✅ SIGMA UNIFIED v0.1: LIFECYCLE COMPLETE")
    print("="*50 + "\n")

if __name__ == "__main__":
    run_sigma_v01_lifecycle()
