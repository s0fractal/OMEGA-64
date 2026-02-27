class PressureEngine:
    """V80: SGLOVA Pressure Engine - Calculates the evolutionary gradient of the Lattice."""
    
    ALPHA = 0.05 # Resonance discount factor
    BETA = 0.15  # Tension penalty factor
    
    def __init__(self, spectral_lines: dict = None):
        self.spectral_lines = spectral_lines or {}

    def calculate_gradient(self, fiber_intent: str, resonance_match: bool = False) -> float:
        """
        Calculates the cost multi-plier based on alignment with Spectral Lines.
        A return value < 1.0 means cheaper (Aligned).
        A return value > 1.0 means more expensive (Contrarian).
        """
        gradient = 1.0
        
        # 1. Aligned Discount
        if resonance_match:
            # Strength is frequency of the line (simplified for demo)
            strength = self.spectral_lines.get(fiber_intent, {}).get("count", 3)
            discount = self.ALPHA * strength
            gradient -= discount
            print(f"🌪️ Pressure: Aligned with [{fiber_intent}]. Discount: -{discount:.2f}")
        
        # 2. Contrarian Penalty
        # If the fiber intent is to contradict a resonant spectral line (not_X)
        for line in self.spectral_lines:
            if f"not_{line}" == fiber_intent:
                penalty = self.BETA * self.spectral_lines[line].get("count", 3)
                gradient += penalty
                print(f"🌪️ Pressure: Contrarian to [{line}]. Penalty: +{penalty:.2f}")

        # Ensure bounds: cost cannot be zero or infinite
        return max(0.2, min(5.0, gradient))

if __name__ == "__main__":
    # Mock spectral data
    lines = {"POLAR_NCP_STABILITY": {"count": 5}}
    engine = PressureEngine(lines)
    
    print(f"🌪️ Resonant Cost factor: {engine.calculate_gradient('POLAR_NCP_STABILITY', True):.2f}")
    print(f"🌪️ Contrarian Cost factor: {engine.calculate_gradient('not_POLAR_NCP_STABILITY'):.2f}")
    print(f"🌪️ Neutral Cost factor: {engine.calculate_gradient('RANDOM_INTENT'):.2f}")
