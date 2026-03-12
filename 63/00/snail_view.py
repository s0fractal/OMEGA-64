
import numpy as np
import matplotlib.pyplot as plt
from core import MirrorEngine

def visualize_snail(engine, step_num):
    # Flatten arrays for plotting
    r = engine.r.flatten()
    theta = (engine.theta.flatten() / 255.0) * 2 * np.pi
    amp = engine.amp.flatten()

    fig = plt.figure(figsize=(10, 10), facecolor='black')
    ax = fig.add_subplot(111, projection='polar')
    ax.set_facecolor('black')

    # Plot atoms as points
    # Color by Op type (I, K, S), size by amplitude
    scatter = ax.scatter(theta, r, c=engine.ops.flatten(), s=amp/4, cmap='viridis', alpha=0.6, edgecolors='none')
    
    ax.set_ylim(-128, 128)
    ax.grid(True, color='#333333', linestyle='--')
    ax.set_title(f"Mirror Brain Snail | Step {step_num}", color='white')
    
    # Hide labels for a cleaner "aesthetic" view
    ax.set_xticklabels([])
    ax.set_yticklabels([])

    plt.savefig(f"SINGULARITY/snail_step_{step_num}.png", facecolor='black')
    plt.close()

if __name__ == "__main__":
    anchor_hash = "0000000000000000" # Placeholder for view script
    engine = MirrorEngine()
    
    print("🐌 Generating Snail Projections...")
    
    # Initial state
    visualize_snail(engine, 0)
    
    # Evolution
    for i in range(1, 101):
        engine.step(anchor_hash)
        if i % 20 == 0:
            print(f"  Processing step {i}...")
            visualize_snail(engine, i)

    print("✅ Projections saved to SINGULARITY/snail_step_*.png")
