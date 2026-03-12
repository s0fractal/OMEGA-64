from ethics_engine import RealityPacket, TruthLayer
from doctor import Doctor
from kml_generator import KMLGenerator
from gaia_grid import GaiaGrid

# 1. Setup
kml = KMLGenerator()
grid = GaiaGrid()
doc = Doctor(grid, kml)

# 2. Test Cases
print("--- 🧪 Test 1: Symbolic Claim (Should be ignored) ---")
p_sym = RealityPacket(
    content="Kyiv as spirit",
    layer=TruthLayer.MYTH,
    sigma_id=(30, "cloud", "self:u123", "global"),
    links={"geo": [("49.83, 24.02", 1.0)], "geo_model": "45.42, 30.52"},
    claim_type="symbolic"
)
if p_sym.discrepancy:
    doc.diagnose_mismatch(p_sym.discrepancy)
else:
    print("✅ Logic: Symbolic mismatch stayed below threshold (as expected).")

print("\n--- 🧪 Test 2: Literal Cluster (Should trigger MIN-TEST) ---")
p_lit = RealityPacket(
    content="Meeting in Lviv",
    layer=TruthLayer.TRACE,
    sigma_id=(35, "soil", "self:u123", "global"),
    links={"geo": [("49.83, 24.02", 1.0), ("49.84, 24.03", 0.8)], "geo_model": "45.42, 30.52"},
    claim_type="literal"
)
if p_lit.discrepancy:
    doc.diagnose_mismatch(p_lit.discrepancy)

print("\n--- 🧪 Test 3: Strong Pair (Simulation of Resolved by pair) ---")
# If confidence > 0.9, Doctor should mention it.
p_lit.discrepancy["status"] = "RESOLVED_BY_STRONG_PAIR"
doc.diagnose_mismatch(p_lit.discrepancy)
