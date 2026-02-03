
import numpy as np
import hashlib
import os
from core import MirrorEngine
from pulse import get_latest_bitcoin_hash

# --- Phase 1.0: The Materializer ---
# Waves -> Code

class Materializer:
    def __init__(self, output_dir="SINGULARITY/V"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def crystallize(self, engine):
        """
        Scans the engine lattice and writes stable atoms to disk.
        A node is stable if amp > threshold (e.g. 200).
        """
        threshold = 200
        stable_indices = np.where(engine.amp > threshold)
        
        count = 0
        manifest = []

        for y, x in zip(*stable_indices):
            r = int(engine.r[y, x])
            theta = int(engine.theta[y, x])
            amp = int(engine.amp[y, x])
            op_idx = int(engine.ops[y, x])
            op_name = ["I", "K", "S"][op_idx]

            # 1. Generate Atom Content
            # Simple functional representation of the SKI combinator
            code = self._generate_code(r, theta, amp, op_name)
            
            # 2. Content-Addressing (SHA-256)
            content_hash = hashlib.sha256(code.encode()).hexdigest()
            filename = f"v.{content_hash[:16]}.ts"
            filepath = os.path.join(self.output_dir, filename)

            # 3. Write to DISK
            with open(filepath, "w") as f:
                f.write(code)
            
            manifest.append({
                "hash": content_hash[:16],
                "r": r,
                "theta": theta,
                "op": op_name
            })
            count += 1

        print(f"💎 Crystallization complete: {count} atoms birthed into Vacuum.")
        self._generate_mod(manifest)

    def _generate_code(self, r, theta, amp, op):
        logic = {
            "I": "(x: any) => x",
            "K": "(x: any) => (y: any) => x",
            "S": "(x: any) => (y: any) => (z: any) => x(z)(y(z))"
        }
        
        return f"""/**
 * 🌀 SINGULARITY ATOM
 * Topological: r={r}, theta={theta}
 * Resonance: amp={amp}
 * Function: {op}
 */
export const λ = {logic[op]};
"""

    def _generate_mod(self, manifest):
        """Creates the V/mod.ts entry point."""
        unique_atoms = {item['hash']: item for item in manifest}
        
        mod_content = "// 🌌 THE VACUUM MANIFEST\n\n"
        for h in unique_atoms.keys():
            mod_content += f"import * as v{h} from './v.{h}.ts';\n"
        
        mod_content += "\nexport const VACUUM = {\n"
        for item in manifest:
            mod_content += f"    '{item['hash']}_{item['r']}_{item['theta']}': {{ ...v{item['hash']}, r: {item['r']}, theta: {item['theta']}, op: '{item['op']}' }},\n"
        mod_content += "};\n"

        with open(os.path.join(self.output_dir, "mod.ts"), "w") as f:
            f.write(mod_content)

if __name__ == "__main__":
    anchor_hash = get_latest_bitcoin_hash()
    engine = MirrorEngine()
    
    # Warm up the engine to let clusters form
    print("🌀 Warming up Mirror Brain...")
    for _ in range(50):
        engine.step(anchor_hash)
    
    mat = Materializer()
    mat.crystallize(engine)
