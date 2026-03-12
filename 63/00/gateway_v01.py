from kml_generator import KMLGenerator
from gaia_grid import GaiaGrid, CellState
from chronos_api import Chronos

class Doctor:
    """System Immunity module: Translates discrepancies into KML Pain Markers."""
    def __init__(self, grid: GaiaGrid, kml_gen: KMLGenerator):
        self.grid = grid
        self.kml_gen = kml_gen

    def perform_scan(self):
        """Scans the grid for pain/conflicts and adds them as KML markers."""
        discrepancies = self.grid.check_coherence()
        for d in discrepancies:
            cell = self.grid.cells[d['cell']]
            # Convert grid local pos to mock lat/lon for demo
            lat = 46.0 + (cell.pos[1] * 0.1)
            lon = 32.0 + (cell.pos[0] * 0.1)
            
            self.kml_gen.add_placemark(
                name=f"PAIN:{d['type']}",
                lat=lat,
                lon=lon,
                height=500,
                style="#pain_style",
                description=f"Status: {cell.state.value}\nPain: {cell.pain:.2f}\n{d['msg']}"
            )
        print(f"🩺 Doctor Scan complete: {len(discrepancies)} pain markers identified.")

def run_gateway_demo():
    print("🌐 Σ-GATEWAY v0.1: Initializing Metabolism Visualization...")
    
    # 1. Setup Time
    pulse = Chronos.anchor_event("GATEWAY_BOOT")
    print(f"🕒 Time Anchor: Block {pulse['block_height']} secured.")

    # 2. Setup Grid & Metabolism
    grid = GaiaGrid()
    grid.add_cell("V_X1", 0, 0, conductance=0.1) # Conflict node
    grid.cells["V_X1"].intent_level = 0.9 # High intent, zero trace
    
    # 3. Setup Visualization
    kml_gen = KMLGenerator("Σ-World: Gateway v0.1")
    
    # 4. Invoke Doctor (Loop to accumulate pain)
    doc = Doctor(grid, kml_gen)
    for _ in range(5):
        doc.perform_scan()
    
    # 5. Finalize Membrane
    filename = "intent_world_v01.kml"
    kml_gen.build_membrane(filename)
    print(f"🚀 Gateway Manifested at {filename}")

if __name__ == "__main__":
    run_gateway_demo()
