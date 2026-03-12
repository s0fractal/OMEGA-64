import time

class EntropyController:
    """Layer 2: Fast decay of sub-resonant forms."""
    
    DECAY_RATE = 0.2 # Penalty per scan for low-resonance forms
    THRESHOLD = 0.5
    
    def __init__(self, memory):
        self.memory = memory

    def apply_decay(self):
        print("🌪️ Entropy: Sweeping the spectrum for dormant forms...")
        field = self.memory.get_orientation_field()
        for form in field:
            resonance = form["ResonanceProfile"].get("count", 0)
            persistence = form["ResonanceProfile"].get("persistence", 1.0)
            
            # Fast decay logic: if resonance is low, persistence drops rapidly
            if resonance < 3:
                new_persistence = persistence - self.DECAY_RATE
                form["ResonanceProfile"]["persistence"] = max(0, new_persistence)
                
                if new_persistence <= 0:
                    form["Status"] = "Dormant"
                    print(f"  💀 Form [{form['InvariantHash'][:8]}] has withered into Dormanc-y.")
                else:
                    print(f"  ⏳ Form [{form['InvariantHash'][:8]}] fading (Persistence: {new_persistence:.2f})")
            else:
                # Resonant forms get a slight boost
                form["ResonanceProfile"]["persistence"] = min(1.0, persistence + 0.05)
