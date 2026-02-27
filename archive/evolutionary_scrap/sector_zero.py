from kml_generator import KMLGenerator
from gaia_grid import GaiaGrid, CellState
from doctor import Doctor

def manifest_sector_zero():
    print("🏗️ Manifesting Sector Zero: Kherson Port (Mirror Earth Visualization)...")
    
    kml = KMLGenerator("Σ-Mirror Earth: Sector Zero")
    grid = GaiaGrid()

    # 1. Define Urban Architecture (Antennas)
    # Port Silos/Buildings near 46.62, 32.61
    silo_coords = [(46.621, 32.611), (46.621, 32.612), (46.622, 32.612), (46.622, 32.611)]
    kml.add_extruded_polygon(silo_coords, height=80, name="SILO_ANTENNA_01")
    
    admin_coords = [(46.623, 32.614), (46.623, 32.615), (46.624, 32.615), (46.624, 32.614)]
    kml.add_extruded_polygon(admin_coords, height=120, name="ADMIN_ANTENNA_01")

    # 2. Define Data Buses (Streets/River)
    river_path = [(46.620, 32.610), (46.625, 32.615), (46.630, 32.620)]
    kml.add_path(river_path, name="DNIEPER_DATA_BUS", style="#resonance_style", height=20)

    # 3. Simulate System Status (Low conductance + High intent = Pain)
    grid.add_cell("PORT_A1", 0, 0, conductance=0.1)
    grid.cells["PORT_A1"].intent_level = 0.95 
    
    # 4. Invoke Doctor
    doc = Doctor(grid, kml)
    print("🩺 Running Sector Zero Immunity Scan...")
    for _ in range(10): # More pulses for pain accumulation
        doc.perform_scan()

    # 5. Build Final KML
    kml.build_membrane("sector_zero.kml")
    print("🚀 Sector Zero Materialized: sector_zero.kml")

if __name__ == "__main__":
    manifest_sector_zero()
