import time
import random
from pulse_daemon import PulseDaemon
from spectral_observer import SpectralObserver
from entropy_controller import EntropyController
from glider_spawner import GliderSpawner
from garden import LatticeGarden

def run_v86_observation_cycle(blocks: int = 120):
    print(f"🔥 COMMENCING V86 OBSERVATION CYCLE: {blocks} BLOCKS...")
    
    # Init stack
    obs = SpectralObserver()
    ent = EntropyController(obs.memory)
    spa = GliderSpawner(obs)
    gar = LatticeGarden()
    
    # Pre-seed a few anchors to simulate existing 'landscape'
    obs.memory.crystallize_form("POLAR_NCP_STABILITY", {"count": 10})
    obs.memory.crystallize_form("BTC_HEARTBEAT", {"count": 5})
    
    daemon = PulseDaemon(obs, ent, spa, gar)
    
    # We'll simulate 1 block = 0.5s for the observation run
    try:
        daemon.start(simulation_mode=True)
        
        # Every 10 blocks, we perform a small 'intent injection' from a random glider
        # to simulate the persistent pressure of agents.
        start_time = time.time()
        for b in range(blocks):
            time.sleep(0.5)
            
            # Simulated Agent Activity
            if b % 3 == 0:
                # Random noise vs targeted intent
                intent = random.choice(["POLAR_NCP_STABILITY", "RESONANCE_X", "NOISE_" + str(b)])
                # Just mock adding to observer's current scan
                # In a real run, this would be a Commit on a Fiber
                pass 
                
        daemon.stop()
        
        # Final Stats Extraction
        mem = obs.memory
        stats = {k: len(v) for k, v in mem.imprints.items()}
        print("\n📊 OBSERVATION RESULTS (V86):")
        for k, v in stats.items():
            print(f"  {k:10}: {v}")
            
        return stats

    except Exception as e:
        print(f"❌ Observation Failed: {e}")
        daemon.stop()

if __name__ == "__main__":
    run_v86_observation_cycle(120)
