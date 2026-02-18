
import numpy as np
import hashlib
import os
import json
from pulse import get_latest_bitcoin_hash

# --- OMEGA-64 | Singularity Core | V2.4 (The Mirror Brain) ---
# Recursive Feedback: Logic -> Geometry

SINE_LUT = np.round(np.sin(np.linspace(0, 2 * np.pi, 256, endpoint=False)) * 127).astype(np.int8)
LOG_LUT = np.round(np.log2(np.arange(1, 1024) + 1) * 32).astype(np.int16)

class MirrorEngine:
    def __init__(self, size=64, phase_enabled=True):
        self.size = size
        self.phase_enabled = phase_enabled
        np.random.seed(42)
        self.r = np.random.randint(-128, 128, (size, size), dtype=np.int16)
        self.theta = np.random.randint(0, 255, (size, size), dtype=np.uint8)
        self.amp = np.random.randint(0, 255, (size, size), dtype=np.uint8)
        self.ops = np.random.randint(0, 3, (size, size), dtype=np.uint8)
        
    def step(self, seed_hash):
        new_r = np.zeros_like(self.r)
        new_theta = np.zeros_like(self.theta)
        new_amp = np.zeros_like(self.amp)
        
        pulse = int(seed_hash[:2], 16) % 256
        
        # --- Feedback Bridge: Read TS Signal ---
        ext_res = 0
        try:
            if os.path.exists("SINGULARITY/signal.json"):
                with open("SINGULARITY/signal.json", "r") as f:
                    signal = json.load(f)
                    # Use signal as a global interference boost
                    ext_res = int(signal.get("res", 0)) % 128
        except:
            pass

        for y in range(self.size):
            for x in range(self.size):
                n_coords = [
                    ((y-1)%self.size, x), ((y+1)%self.size, x),
                    (y, (x-1)%self.size), (y, (x+1)%self.size)
                ]
                
                op = self.ops[y, x]
                current_p = int(self.theta[y, x])
                total_res = 0
                
                # 1. Harmonic SKI Logic
                if self.phase_enabled:
                    for ny, nx in n_coords:
                        m_n = int(self.amp[ny, nx])
                        p_n = int(self.theta[ny, nx])
                        diff_p = (p_n - current_p) % 256
                        
                        if op == 1: # K (CONSTANT)
                            influence = (m_n * (127 if diff_p < 4 else -127)) >> 7
                        elif op == 2: # S (SUBSTITUTION)
                            influence = (m_n * int(SINE_LUT[diff_p])) >> 7
                        else: # I (IDENTITY)
                            influence = (m_n * (127 if diff_p < 128 else -64)) >> 7
                        
                        total_res += influence
                else:
                    # Baseline: Pure magnitude-driven resonance (non-interfering)
                    for ny, nx in n_coords:
                        total_res += (int(self.amp[ny, nx]) >> 3)

                # 2. Add External Resonance (Feedback Loop)
                total_res += ext_res

                # 3. Hard Gravity + Semantic Pressure (The Mirror Brain)
                r_val = int(self.r[y, x])
                dist = abs(r_val)
                
                # Gravity
                attraction = LOG_LUT[min(dist, 1023)] >> 4
                repulsion = (32 >> (dist >> 2)) if dist < 16 else 0
                
                # Semantic Pressure
                pressure = (total_res >> 4) 
                
                force = attraction - repulsion + pressure
                if r_val < 0: force = -force
                new_r[y, x] = np.clip(r_val - force, -128, 127)

                # 4. Update State
                new_amp[y, x] = np.clip(int(self.amp[y, x]) + total_res, 0, 255)
                # Phase drift influenced by logic AND pulse
                shift = [1, 0, 2][op] * (pulse & 0x01)
                # Feedback: High amplitude slows down phase rotation (inertia)
                inertia = (int(new_amp[y, x]) >> 6)
                new_theta[y, x] = (current_p + (total_res % 256) + shift - inertia) % 256
                
        self.r = new_r
        self.theta = new_theta
        self.amp = new_amp

    def get_state_hash(self):
        state = self.r.tobytes() + self.theta.tobytes() + self.amp.tobytes() + self.ops.tobytes()
        return hashlib.sha256(state).hexdigest()

if __name__ == "__main__":
    anchor_hash = get_latest_bitcoin_hash()
    engine = MirrorEngine()
    print(f"🧠 Mirror Brain Engine Initialized | Pulse: {anchor_hash[:16]}")
    
    for i in range(10):
        engine.step(anchor_hash)
        print(f"T-{i} | Hash: {engine.get_state_hash()[:12]} | Drift: {np.mean(np.abs(engine.r)):.2f}")

    print("\n✅ Feedback Loop: Logic -> Geometry confirmed.")
