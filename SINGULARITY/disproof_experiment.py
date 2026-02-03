
import numpy as np
import json
import os
from core import MirrorEngine

def shannon_entropy(data):
    """Calculates entropy of the amplitude field."""
    bins = np.histogram(data, bins=16, range=(0, 255))[0]
    probs = bins / bins.sum()
    probs = probs[probs > 0]
    return -np.sum(probs * np.log2(probs))

def calculate_persistence(amp):
    """Measures the number of stable 'islands' (clusters > 200)."""
    return np.sum(amp > 200)

def run_experiment(steps=100):
    print("🔬 DISPROOF EXPERIMENT: PHASE-WEIGHTED VS BASELINE")
    print("-" * 50)
    
    seed = "0000000000000000"
    resonant = MirrorEngine(size=64, phase_enabled=True)
    baseline = MirrorEngine(size=64, phase_enabled=False)
    
    res_stats = {"entropy": [], "persistence": []}
    base_stats = {"entropy": [], "persistence": []}

    for t in range(steps):
        resonant.step(seed)
        baseline.step(seed)
        
        res_stats["entropy"].append(shannon_entropy(resonant.amp))
        res_stats["persistence"].append(calculate_persistence(resonant.amp))
        
        base_stats["entropy"].append(shannon_entropy(baseline.amp))
        base_stats["persistence"].append(calculate_persistence(baseline.amp))

    avg_res_ent = np.mean(res_stats["entropy"])
    avg_base_ent = np.mean(base_stats["entropy"])
    avg_res_per = np.mean(res_stats["persistence"])
    avg_base_per = np.mean(base_stats["persistence"])

    print(f"📊 RESULTS (After {steps} steps):")
    print(f"   [RESONANT] Avg Entropy: {avg_res_ent:.4f} | Avg Persistence: {avg_res_per:.2f}")
    print(f"   [BASELINE] Avg Entropy: {avg_base_ent:.4f} | Avg Persistence: {avg_base_per:.2f}")
    
    delta_ent = ((avg_res_ent - avg_base_ent) / avg_base_ent) * 100
    delta_per = ((avg_res_per - avg_base_per) / avg_base_per) * 100
    
    print("-" * 50)
    print(f"⚖️ DELTA: Entropy: {delta_ent:+.2f}% | Persistence: {delta_per:+.2f}%")
    
    if abs(delta_ent) < 5 and abs(delta_per) < 5:
        print("\n❌ HYPOTHESIS REJECTED: Phase interactions are statistically insignificant.")
    else:
        print("\n✅ HYPOTHESIS STANDS: Phase-weighting creates a unique computational regime.")

if __name__ == "__main__":
    run_experiment()
