class ObserverLens:
    """V77+V82: SGLOVA Fiber Lens - Manages costed projection and feedback."""
    
    def __init__(self, fiber_id: str, focus: float = 0.5, amplitude: float = 1.0):
        self.fiber_id = fiber_id
        self.focus = focus # 0.0 - 1.0
        self.amplitude = amplitude
        self.observation_history = []

    def project_view(self, target_coord: tuple, garden: 'LatticeGarden') -> str:
        """V82: Projecting a lens consumes sap flow. Observation is not free."""
        # Layer 5: Costed Observation
        observe_cost = 0.02 * self.focus
        garden.adjust_integrity(-observe_cost)
        
        projection = f"PROJECTION({target_coord}) | F:{self.focus} A:{self.amplitude}"
        self.observation_history.append(projection)
        
        print(f"🧿 Lens: Projecting view onto {target_coord}. Sap drain: {observe_cost}")
        return projection

    def analyze_spectral_depth(self, spectral_data: dict, garden: 'LatticeGarden'):
        """V82: Deep analysis consumes even more sap."""
        depth_cost = 0.1 * self.focus
        garden.adjust_integrity(-depth_cost)
        print(f"🧿 Lens: Deep spectral analysis performed. Sap drain: {depth_cost}")

    def attempt_base_write(self, target_base, data):
        """Fiber Rule: Fibers cannot write to Base. Annihilation trigger."""
        print("⚠️ CAUTION: ObserverLens attempt to write to Base detected.")
        self.annihilate()

    def annihilate(self):
        """Emergency self-termination of the Lens to protect Base invariants."""
        print("💥 ANNIHILATION: ObserverLens self-destructed to preserve Base.")
        self.focus = 0
        raise PermissionError("Σ-Lens: Fiber cannot write to Base (Constitution Axiom III).")

if __name__ == "__main__":
    from garden import LatticeGarden
    garden = LatticeGarden()
    lens = ObserverLens(fiber_id="observer_01", focus=0.8)
    lens.project_view((46.6, 32.6), garden)
    lens.analyze_spectral_depth({}, garden)
