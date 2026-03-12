import subprocess
import os
import json
import time
import sys

def run_cmd(cmd, cwd="/Users/s0fractal/SIGMA"):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)

def generate_git_delta(behavior_msg, output_dir="/Users/s0fractal/SIGMA/txt"):
    """Deltas from Git: Commit first, then diff from history."""
    root = "/Users/s0fractal/SIGMA"
    version_tag = f"V{time.strftime('%Y%m%d.%H%M')}"
    delta_filename = f"delta_{version_tag}.txt"
    output_path = os.path.join(output_dir, delta_filename)

    print(f"🧬 Commit \u0026 Delta Sequence Start...")

    # 1. Commit changes
    commit_msg = f"[Σ-Lattice] {behavior_msg}"
    run_cmd(f"git add .")
    commit_res = run_cmd(f"git commit -m '{commit_msg}'")
    
    if "nothing to commit" in commit_res.stdout:
        print("⚠️ Nothing to commit. Using last commit for delta.")
        ref = "HEAD"
    else:
        print(f"✅ Committed: {commit_msg}")
        ref = "HEAD"

    # 2. Get Changed Files
    files_res = run_cmd(f"git show --name-status --oneline {ref}")
    
    # 3. Get Unified Diff
    diff_res = run_cmd(f"git show --unified=3 {ref}")

    # 4. Materialize Text Manifest (V74/V75: Topological Persistence)
    # We now REQUIRE a Loss Ledger and PRICE vector.
    loss_ledger = os.getenv("SIGMA_LOSS", "REMOVED: []\n  PRESERVED: []\n  REASON: []\n  COUNTEREXAMPLE: []")
    prohibition = os.getenv("SIGMA_PROHIBIT", "[]")
    
    # PRICE Vector <L, C, G, P>
    p_loss = os.getenv("SIGMA_PRICE_L", "8")
    p_comp = os.getenv("SIGMA_PRICE_C", "poly")
    p_glob = os.getenv("SIGMA_PRICE_G", "false")
    p_phas = os.getenv("SIGMA_PRICE_P", "false")
    p_witness = os.getenv("SIGMA_PRICE_W", "")

    with open(output_path, "w") as f:
        f.write(f"# Σ-DELTA: {version_tag}\n")
        f.write(f"BEHAVIOR: {behavior_msg}\n")
        f.write(f"COMMIT: {run_cmd('git rev-parse HEAD').stdout.strip()}\n\n")
        
        f.write("## 🧵 LOSS_LEDGER\n")
        f.write(f"{loss_ledger}\n\n")
        
        f.write("## 💰 PRICE\n")
        f.write(f"  loss_bits_lower_bound: {p_loss}\n")
        f.write(f"  invert_complexity: {p_comp}\n")
        f.write(f"  requires_global_sync: {p_glob}\n")
        f.write(f"  noncommutative_phase: {p_phas}\n")
        f.write(f"  phase_witness: \"{p_witness}\"\n\n")

        f.write("## 🚫 PROHIBITION\n")
        f.write(f"{prohibition}\n\n")
        
        f.write("## CHANGELOG\n")
        f.write(files_res.stdout)
        f.write("\n## UNIFIED DIFF\n")
        f.write(diff_res.stdout)

    print(f"💎 Flow Crystallized -> {output_path}")
    return output_path

def generate_full_export(output_dir="/Users/s0fractal/SIGMA/txt"):
    """V75: Generates a full codebase dump with timestamp."""
    version_tag = f"V{time.strftime('%Y%m%d.%H%M')}"
    export_filename = f"sigma_full_Lattice_{version_tag}.txt"
    output_path = os.path.join(output_dir, export_filename)
    
    print(f"🏺 Archiving Full Lattice...")
    
    files_res = run_cmd("git ls-files")
    files = files_res.stdout.splitlines()
    
    with open(output_path, "w") as f:
        f.write(f"# Σ-FULL-LATTICE-EXPORT: {version_tag}\n")
        f.write(f"TIMESTAMP: {time.ctime()}\n")
        f.write(f"BASE: /Users/s0fractal/SIGMA\n\n")
        
        for fpath in files:
            abs_path = os.path.join("/Users/s0fractal/SIGMA", fpath)
            if os.path.isfile(abs_path):
                f.write(f"\n--- FILE: {fpath} ---\n")
                try:
                    with open(abs_path, "r", errors='ignore') as src:
                        f.write(src.read())
                except Exception as e:
                    f.write(f"ERROR READING FILE: {e}\n")
                f.write("\n")
                
    print(f"🏺 Full Lattice Exported -> {output_path}")
    return output_path

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "Evolution Pulse"
    generate_git_delta(msg)
    generate_full_export()
