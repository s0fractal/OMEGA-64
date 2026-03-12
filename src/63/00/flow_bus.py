import time
from normalizer_daemon import NormalizerDaemon
from ethics_daemon import EthicsDaemon
from lens_daemon import LensDaemon

class FlowBus:
    """The metabolic coordinator for the V73.0 FlowBus."""
    def __init__(self):
        self.normalizer = NormalizerDaemon("Normalizer")
        self.ethics = EthicsDaemon("Ethics")
        self.lens = LensDaemon("Lens")

    def pulse(self):
        """A single metabolic pulse across all daemons."""
        print("\n🌊 --- FLOW PULSE START ---")
        self.normalizer.run_once()
        self.ethics.run_once()
        self.lens.run_once()
        print("🌊 --- FLOW PULSE COMPLETE ---")

if __name__ == "__main__":
    bus = FlowBus()
    while True:
        bus.pulse()
        time.sleep(5) # Metabolic rhythm
