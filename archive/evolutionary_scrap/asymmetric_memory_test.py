from pulse_daemon import PulseDaemon
from spectral_observer import SpectralObserver
from entropy_controller import EntropyController
from glider_spawner import GliderSpawner
from garden import LatticeGarden
import time

def run_asymmetric_memory_verification():
    print("🔥 COMMENCING ASYMMETRIC MEMORY VERIFICATION [V85]...")
    
    # Init stack
    obs = SpectralObserver()
    ent = EntropyController(obs.memory)
    spa = GliderSpawner(obs)
    gar = LatticeGarden()
    
    # Pre-seed forms in different states
    obs.memory.crystallize_form("POLAR_NCP_STABILITY", {"count": 15}) # Stable Channel
    obs.memory.crystallize_form("EMERGING_INTENT", {"count": 1})     # Seed
    # Create a dormant form manually
    dormant_form = obs.memory.crystallize_form("FAILED_LAW", {"count": 2, "persistence": 0})
    dormant_form["Status"] = "Dormant"
    
    daemon = PulseDaemon(obs, ent, spa, gar)
    
    try:
        # Start the pulse in fast simulation mode
        daemon.start(simulation_mode=True)
        
        # Monitor for 6 blocks (1 full cycle)
        for i in range(6):
            time.sleep(2.1)
            
        # Verify imprints
        mem = obs.memory
        print("\n📊 Verification Outcome:")
        print(f"  💀 Scars imprinted: {len(mem.imprints['Scar'])}")
        print(f"  🌱 Seeds imprinted: {len(mem.imprints['Seed'])}")
        print(f"  🌊 Channels imprinted: {len(mem.imprints['Channel'])}")
        print(f"  ✨ Patterns imprinted: {len(mem.imprints['Pattern'])}")
        
        assert len(mem.imprints['Scar']) > 0, "Scar imprint failed"
        assert len(mem.imprints['Seed']) > 0, "Seed imprint failed"
        assert len(mem.imprints['Channel']) > 0, "Channel imprint failed"
        
    finally:
        daemon.stop()
        
    print("\n✅ Asymmetric Memory Verification Complete.")

if __name__ == "__main__":
    run_asymmetric_memory_verification()
