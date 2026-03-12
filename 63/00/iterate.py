"""
V50.0: Autopoiesis Engine - The Panda Edition
Focus: Action through Non-Action (Wu Wei).

This script implements the "Zero Impedance" protocol:
1. SENSE: Detect dissonance in the lattice.
2. ALIGN: Achieve internal peace before action.
3. CRYSTALLIZE: Only move when the path is clear.
"""

import os
import sys
import subprocess
import hashlib
from pathlib import Path
from autopoietic_mill import AutopoieticMill

class AutopoiesisEngine(AutopoieticMill):
    def __init__(self, root_dir: str):
        super().__init__(os.path.join(root_dir, "sigma/p32/SOVEREIGN_VOID.sigma"))
        self.root_dir = Path(root_dir)
        self.conformance_script = self.root_dir / "PY/z00/conformance_test.py"
        
    def scan_for_dissonance(self):
        """Finds files with 'TODO' or 'FIXME' or missing PoI."""
        print("🔍 SCANNING FOR DISSONANCE...")
        dissonant_files = []
        for file in self.root_dir.rglob("*.sigma"):
            if file.is_file():
                content = file.read_text()
                if "TODO" in content or "FIXME" in content:
                    dissonant_files.append(file)
        return dissonant_files

    def verify_via_void_lens(self) -> bool:
        """
        Runs the core conformance tests.
        The 'Void Lens' means the core invariants must remain untouched.
        """
        print("🔭 VERIFYING VIA VOID LENS...")
        try:
            result = subprocess.run(
                [sys.executable, str(self.conformance_script)],
                capture_output=True, text=True, check=True
            )
            print("✅ VOID LENS CLEAR: Conformance tests passed.")
            return True
        except subprocess.CalledProcessError as e:
            print("❌ DISSONANCE DETECTED IN VOID LENS:")
            print(e.stdout)
            print(e.stderr)
            return False

    def iterate_autonomous(self, dry_run=True):
        """Wu Wei Iteration."""
        print(f"\n🐼 AUTOPOIESIS (PANDA MODE) [DRY_RUN={dry_run}]")
        
        dissonant = self.scan_for_dissonance()
        if not dissonant:
            print("🧘 Lattice is in state of Zero Impedance. No movement required.")
            return

        for file in dissonant:
            if dry_run:
                print(f"✨ Sense: Dissonance at {file.name}. Staying still.")
            else:
                print(f"🌀 Aligning: {file.name} -> Crystalline...")
                self.refactor_cycle(str(file), mode="GRAVITY")
        
        if self.verify_via_void_lens():
            print("💎 INTERNAL PEACE SECURED.")
        else:
            print("⚠️ DISSONANCE DETECTED: Retracting to center.")

if __name__ == "__main__":
    # Achieve Zero Impedance
    engine = AutopoiesisEngine(os.getcwd())
    mode = os.getenv("Σ_PANDA_MODE", "DRY_RUN")
    engine.iterate_autonomous(dry_run=(mode == "DRY_RUN"))
