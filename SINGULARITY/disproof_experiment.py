import numpy as np
import hashlib
import time

# --- LUT Generation (Deterministic Sine) ---
# We use 256 steps for a full circle to stay within u8/u16 bounds
SINE_LUT = np.round(np.sin(np.linspace(0, 2*np.pi, 256, endpoint=False)) * 127).astype(np.int8)

class Engine:
    def __init__(self, size=64, use_phase=False):
        self.size = size
        self.use_phase = use_phase
        # Magnitude (u8), Phase (u8: 0-255)
        # Seed the random with a fixed value for cross-run reproducibility if needed,
        # but here we follow the user's snippet.
        self.mag = np.random.randint(0, 255, (size, size), dtype=np.uint8)
        self.phase = np.random.randint(0, 255, (size, size), dtype=np.uint8)
        
    def step(self):
        new_mag = np.zeros_like(self.mag)
        new_phase = np.zeros_like(self.phase)
        
        # Using vectorized numpy operations for speed and to avoid manual overflow
        for y in range(self.size):
            for x in range(self.size):
                # Neighbors (Toroidal)
                neighbors_coords = [
                    ((y-1)%self.size, x), ((y+1)%self.size, x),
                    (y, (x-1)%self.size), (y, (x+1)%self.size)
                ]
                
                total_influence = 0
                current_phase = int(self.phase[y, x])
                
                for ny, nx in neighbors_coords:
                    m = int(self.mag[ny, nx])
                    p = int(self.phase[ny, nx])
                    
                    if self.use_phase:
                        # Interference-like weighting: mag * cos(delta_phase)
                        # Cast to int to prevent uint8 overflow/underflow warnings
                        diff = (p - current_phase) % 256
                        influence = (m * int(SINE_LUT[diff])) >> 7
                    else:
                        # Baseline: pure magnitude average
                        influence = m >> 2
                    
                    total_influence += influence
                
                # Update rules (Fixed-point)
                new_mag[y, x] = np.clip(total_influence, 0, 255)
                if self.use_phase:
                    # Phase evolution tied to local energy
                    new_phase[y, x] = (current_phase + (total_influence % 256)) % 256
                    
        self.mag = new_mag
        self.phase = new_phase

    def get_entropy(self):
        # Shannon Entropy of the magnitude field
        counts = np.bincount(self.mag.flatten(), minlength=256)
        probs = counts / (self.size * self.size)
        probs = probs[probs > 0]
        return -np.sum(probs * np.log2(probs))

    def get_hash(self):
        return hashlib.sha256(self.mag.tobytes()).hexdigest()

# --- The Experiment ---
def run_disproof(steps=100):
    print(f"🧪 Running Minimal Disproof Experiment ({steps} steps)...")
    
    # Use a fixed seed for reproducibility across the two engines
    np.random.seed(42)
    
    baseline = Engine(use_phase=False)
    omega = Engine(use_phase=True)
    
    # Sync initial magnitude for fair comparison
    initial_mag = np.random.randint(0, 255, (64, 64), dtype=np.uint8)
    initial_phase = np.random.randint(0, 255, (64, 64), dtype=np.uint8)
    
    baseline.mag = initial_mag.copy()
    baseline.phase = initial_phase.copy()
    
    omega.mag = initial_mag.copy()
    omega.phase = initial_phase.copy()
    
    results = []
    
    for i in range(steps):
        baseline.step()
        omega.step()
        
        b_ent = baseline.get_entropy()
        o_ent = omega.get_entropy()
        
        results.append((b_ent, o_ent))
        
        if i % 20 == 0:
            print(f"Step {i:03d} | Baseline Entropy: {b_ent:.4f} | Omega Entropy: {o_ent:.4f}")
            
    return results

if __name__ == "__main__":
    run_disproof(200)
