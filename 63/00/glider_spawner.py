import random
from threshold_engine import ThresholdEngine

class GliderSpawner:
    """Layer 1: Aggressive agent influx."""
    
    def __init__(self, observer):
        self.observer = observer
        self.active_gliders = []

    def spawn_burst(self, count: int = 10):
        print(f"🚀 Spawner: Releasing burst of {count} Gliders into the Garden...")
        for i in range(count):
            fiber_id = f"glider_{random.randint(1000, 9999)}"
            engine = ThresholdEngine(fiber_id=fiber_id)
            # Random initial bias - NOT auto-aligned
            bias = random.choice(["POLAR_STABILITY", "DIVERGENT_VOID", "TEMPORAL_DRIFT"])
            engine.add_to_trace(f"Initial intent: {bias}. ")
            
            self.observer.register_fiber(engine)
            self.active_gliders.append(engine)
        return self.active_gliders

if __name__ == "__main__":
    from spectral_observer import SpectralObserver
    obs = SpectralObserver()
    spawner = GliderSpawner(obs)
    spawner.spawn_burst(5)
    obs.scan_spectrum()
