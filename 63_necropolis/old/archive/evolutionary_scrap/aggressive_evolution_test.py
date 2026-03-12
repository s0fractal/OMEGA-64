import time
from glider_spawner import GliderSpawner
from entropy_controller import EntropyController
from spectral_observer import SpectralObserver
from garden import LatticeGarden
from pressure_engine import PressureEngine

def run_aggressive_evolution_test():
    print("🔥 COMMENCING AGGRESSIVE EVOLUTION TEST [V82]...")
    
    # 1. Setup Base
    observer = SpectralObserver()
    entropy = EntropyController(observer.memory)
    spawner = GliderSpawner(observer)
    garden = LatticeGarden()
    
    # Pre-seed a Spectral Line for gravity
    observer.memory.crystallize_form("POLAR_NCP_STABILITY", {"count": 7, "persistence": 1.0})
    observer.spectral_lines["POLAR_NCP_STABILITY"] = {"count": 7}
    pressure = PressureEngine(observer.spectral_lines)
    
    # 2. Release Burst (Layer 1)
    gliders = spawner.spawn_burst(20)
    
    # 3. Simulate Iterations
    for step in range(5):
        print(f"\n🌀 Iteration {step+1}:")
        
        # Agents acting
        for engine in gliders:
            # Random action: align or diverge
            action = random.choice(["POLAR_NCP_STABILITY", "DIVERGENT_VOID", "TEMPORAL_DRIFT"])
            resonance = (action == "POLAR_NCP_STABILITY")
            
            grad = pressure.calculate_gradient(action, resonance)
            garden.calculate_sap_flow(2024, grad)
            
            # Record action
            engine.add_to_trace(f"Action: {action}. ")
            
        # Global Dynamics (Layer 2)
        entropy.apply_decay()
        
        # Scan Spectrum (Layer 3/4 detection)
        observer.scan_spectrum()
    
    print("\n✅ Aggressive Evolution Cycle Complete.")

if __name__ == "__main__":
    import random
    run_aggressive_evolution_test()
