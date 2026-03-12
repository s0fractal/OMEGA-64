from grid_registry import GridRegistry, SigmaID
from spine_sync import SpineSync
from garden import LatticeGarden

class ResonanceScanner:
    """V78: SGLOVA Resonance Scanner - Maps living intent nodes to the BTC Spine."""
    
    def __init__(self):
        self.grid = GridRegistry()
        self.spine = SpineSync()
        self.garden = LatticeGarden()
        self.nodes = {} # Canonical mapping of intent nodes

    def map_anchor(self, label: str, year: int, content: str):
        """Maps a historical/future anchor to a resonance node."""
        # Calculate BTC height equivalent (Simplified for demo)
        # 1986 is pre-genesis, so we use negative or offset markers
        # Genesis block 0 = 2009
        years_from_genesis = year - 2009
        btc_height_approx = years_from_genesis * 52560 # ~52.5k blocks per year
        
        # Snap to 7.83Hz frequency
        snapped_t = int(self.grid.snap_to_frequency(btc_height_approx, 7.83))
        
        # S (Shell): Soil for historical anchors
        sigma_id = SigmaID(T=snapped_t, S="soil", C=f"cell_{label}", F="stellar")
        
        # Add to resonance map
        self.nodes[label] = {
            "id": sigma_id,
            "content": content,
            "sap_flow": self.garden.calculate_sap_flow(year)
        }
        
        print(f"🌳 Scanner: Mapped {label} -> {sigma_id}")
        return self.nodes[label]

    def audit_spine(self):
        """Scans mapped nodes for sap-flow health."""
        print("🌿 Scanner: Commencing Sap Flow Audit...")
        for label, data in self.nodes.items():
            status = self.spine.get_block_status(data["id"].T)
            print(f"  - Node [{label}]: Status={status} Sap={data['sap_flow']:.4f}")

if __name__ == "__main__":
    scanner = ResonanceScanner()
    # 1. Map the Genesis Root
    scanner.map_anchor("ANCHOR_1986_BRAIN_GENESIS", 1986, "Root of the SGLOVA intent.")
    # 2. Map a current node
    scanner.map_anchor("LATTICE_SYNC_2024", 2024, "Structural stabilization.")
    # 3. Audit
    scanner.audit_spine()
