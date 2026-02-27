import time
import threading

class PulseDaemon:
    """V83: SGLOVA Pulse Daemon - Coordinates structural rhythm (Metatron's Cycle)."""
    
    PHASES = {
        0: "DEEP_CLEAN",
        1: "SPECTRAL_SCAN",
        2: "SAP_FLOW",
        3: "FORK_CONTROL",
        4: "EMERGENCE",
        5: "QUIET"
    }

    def __init__(self, observer, entropy, spawner, garden):
        self.observer = observer
        self.entropy = entropy
        self.spawner = spawner
        self.garden = garden
        self.is_running = False
        self.block_height = 0
        self.pulse_thread = None

    def _pulse_cycle(self, simulation_mode=True):
        """The heartbeat of the Lattice."""
        while self.is_running:
            self.block_height += 1
            phase_idx = self.block_height % 6
            phase_name = self.PHASES[phase_idx]
            print(f"\n🥁 PULSE: Block {self.block_height} emerged. [Season: {phase_name}]")
            
            # --- Specialized Phase Logic ---
            
            if phase_name == "DEEP_CLEAN":
                # Priority: Aggressive Entropy Decay
                self.entropy.apply_decay()
                # Imprint Scars (failed/dormant forms)
                dormant_forms = [f for f in self.observer.memory.get_orientation_field() if f["Status"] == "Dormant"]
                self.observer.memory.imprint_by_phase(phase_idx, dormant_forms)
            
            elif phase_name == "SPECTRAL_SCAN":
                # Priority: Precise Invariant Detection
                self.observer.scan_spectrum()
                # Imprint Patterns (Resonant spectral lines)
                resonant_forms = [f for f in self.observer.memory.get_orientation_field() if f["Status"] == "Resonant"]
                self.observer.memory.imprint_by_phase(phase_idx, resonant_forms)
                
            elif phase_name == "SAP_FLOW":
                # Priority: Global Integrity Refresh
                field_size = len(self.observer.memory.get_orientation_field())
                self.garden.refresh_sap(field_size)
                # Imprint Channels (Very high resonance forms)
                stable_forms = [f for f in self.observer.memory.get_orientation_field() if f["ResonanceProfile"].get("count", 0) > 10]
                self.observer.memory.imprint_by_phase(phase_idx, stable_forms)
                
            elif phase_name == "FORK_CONTROL":
                # Priority: Healing and selective merging
                print("🩹 Season: Cooling down Forks and calculating hybrid potential...")
                # Imprint Fault Lines (Contrarian tension indicators)
                # Mocked for now based on tension detection
                self.observer.memory.imprint_by_phase(phase_idx, [])
            
            elif phase_name == "EMERGENCE":
                # Priority: Bursting new life
                self.spawner.spawn_burst(3)
                # Imprint Seeds (Emerging forms)
                emerging_forms = [f for f in self.observer.memory.get_orientation_field() if f["Status"] == "Emerging"]
                self.observer.memory.imprint_by_phase(phase_idx, emerging_forms)
                
            elif phase_name == "QUIET":
                # Priority: System rest. Minimal metabolic load.
                print("🧘 Season: The Lattice is quiet. Observing resonance.")
                self.observer.memory.imprint_by_phase(phase_idx, [])

            if simulation_mode:
                time.sleep(2) # Speed up for testing
            else:
                time.sleep(600) # Real BTC block time approx 10 mins

    def start(self, simulation_mode=True):
        print("🥁 Pulse Daemon: Initializing autonomous rhythm...")
        self.is_running = True
        self.pulse_thread = threading.Thread(target=self._pulse_cycle, args=(simulation_mode,))
        self.pulse_thread.start()

    def stop(self):
        print("🛑 Pulse Daemon: Suspending system rhythm.")
        self.is_running = False
        if self.pulse_thread:
            self.pulse_thread.join()

if __name__ == "__main__":
    from spectral_observer import SpectralObserver
    from entropy_controller import EntropyController
    from glider_spawner import GliderSpawner
    from garden import LatticeGarden
    
    obs = SpectralObserver()
    ent = EntropyController(obs.memory)
    spa = GliderSpawner(obs)
    gar = LatticeGarden()
    
    daemon = PulseDaemon(obs, ent, spa, gar)
    try:
        daemon.start(simulation_mode=True)
        time.sleep(7) # Run for a few blocks
    finally:
        daemon.stop()
