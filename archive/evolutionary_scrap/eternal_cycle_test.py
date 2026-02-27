from pulse_daemon import PulseDaemon
from spectral_observer import SpectralObserver
from entropy_controller import EntropyController
from glider_spawner import GliderSpawner
from garden import LatticeGarden
import time

def run_eternal_cycle_verification():
    print("🔥 COMMENCING ETERNAL CYCLE VERIFICATION [V83]...")
    
    # Init stack
    obs = SpectralObserver()
    ent = EntropyController(obs.memory)
    spa = GliderSpawner(obs)
    gar = LatticeGarden()
    
    # Seed a resonant form to see the pulse boost
    obs.memory.crystallize_form("NCP_STABILITY", {"count": 10})
    obs.spectral_lines["NCP_STABILITY"] = {"count": 10}
    
    daemon = PulseDaemon(obs, ent, spa, gar)
    
    try:
        # Start the pulse in fast simulation mode
        daemon.start(simulation_mode=True)
        
        # Monitor for 4 pulses
        for _ in range(4):
            time.sleep(2.1)
            print(f"📊 Verification: Current integrity: {gar.integrity_score:.2f}")
            
    finally:
        daemon.stop()
        
    print("\n✅ Eternal Cycle Verification Complete.")

if __name__ == "__main__":
    run_eternal_cycle_verification()
