from threshold_engine import ThresholdEngine
from spectral_memory import SpectralMemory

class SpectralObserver:
    """V79 + V81: SGLOVA Spectral Observer - Detects and Crystallizes alignment."""
    
    RESONANCE_THRESHOLD = 3 # Minimum independent Fibers to form a Spectral Line
    
    def __init__(self):
        self.fibers: Dict[str, ThresholdEngine] = {}
        self.spectral_lines: Dict[str, Dict] = {} 
        self.memory = SpectralMemory() # V81 Form Memory

    def register_fiber(self, engine: ThresholdEngine):
        """Registers a Fiber for spectral monitoring."""
        self.fibers[engine.fiber_id] = engine
        print(f"🌈 Observer: Fiber [{engine.fiber_id}] registered for monitoring.")

    def scan_spectrum(self):
        """Scans all registered Fibers for committed Law resonance."""
        counts = {}
        fiber_map = {}
        
        for fiber_id, engine in self.fibers.items():
            for law in engine.laws:
                counts[law] = counts.get(law, 0) + 1
                if law not in fiber_map: fiber_map[law] = []
                fiber_map[law].append(fiber_id)
        
        print("🌈 Observer: Scanning Invariant Spectrum...")
        for law, count in counts.items():
            if count >= self.RESONANCE_THRESHOLD:
                self.spectral_lines[law] = {
                    "count": count,
                    "fibers": fiber_map[law],
                    "status": "RESONANT"
                }
                print(f"  ✨ SPECTRAL LINE DETECTED: [{law}] (Resonance: {count})")
                
                # V81: Crystallize into Form Memory (Strips history)
                self.memory.crystallize_form(law, {"count": count})
            else:
                print(f"  .. Trace: [{law}] seen in {count} fiber(s). (Sub-resonant)")

    def check_tension(self, fiber_id: str, law_intent: str) -> float:
        """Calculates tension between a Fiber's intent and Spectral Lines."""
        # Simple binary tension for now
        if law_intent in self.spectral_lines:
            print(f"🌈 Observer: Fiber [{fiber_id}] aligns with Spectral Line [{law_intent}]. Tension=0.")
            return 0.0
        
        # If the fiber intent contradicts a resonant spectral line
        # This is strictly advisory
        for resonant_law in self.spectral_lines:
            if f"not_{resonant_law}" == law_intent:
                print(f"⚠️ TENSION: Fiber [{fiber_id}] is CONTRARIAN to Spectral Line [{resonant_law}].")
                return 1.0
        
    def selective_merge(self, law_A: str, law_B: str):
        """Layer 4: Hybridize two resonant forms into a new Spectral identity."""
        if law_A in self.spectral_lines and law_B in self.spectral_lines:
            hybrid_law = f"HYBRID_{law_A}_{law_B}"
            print(f"🩹 Healing: Creating selective hybrid [{hybrid_law}]...")
            self.memory.crystallize_form(hybrid_law, {"count": 1, "persistence": 1.0})
            return hybrid_law
        return None

if __name__ == "__main__":
    observer = SpectralObserver()
    
    # Mocking independent Fibers
    f1 = ThresholdEngine("fiber_alpha")
    f2 = ThresholdEngine("fiber_beta")
    f3 = ThresholdEngine("fiber_gamma")
    f4 = ThresholdEngine("fiber_delta")
    
    # Seeding laws
    for f in [f1, f2, f3]:
        f.operators_enabled.append("Commit") # Manually enabling for demo
        f.commit_event("GENESIS_LAW_1986", law_invariant="POLAR_NCP_STABILITY")
    
    f4.operators_enabled.append("Commit")
    f4.commit_event("DIVERGENT_LAW", law_invariant="not_POLAR_NCP_STABILITY")
    
    # Register and Scan
    for f in [f1, f2, f3, f4]:
        observer.register_fiber(f)
        
    observer.scan_spectrum()
    
    # Verification of Test 5 (Contrarian visibility)
    observer.check_tension("fiber_delta", "not_POLAR_NCP_STABILITY")
