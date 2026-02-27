from __future__ import annotations
import os
import json
from pathlib import Path

def get_repo_root() -> Path:
    """
    Ironclad repository root discovery:
    1. Check env overrides SIGMA_ROOT or SIGMA_GARDEN.
    2. Traverse up from this file searching for BOTH .git AND sigma/m32/protocol.json.
    3. Fail with RuntimeError if discovery failed.
    """
    override = os.environ.get("SIGMA_ROOT") or os.environ.get("SIGMA_GARDEN")
    if override:
        path = Path(override).resolve()
        if path.exists(): return path

    cur = Path(__file__).resolve()
    for parent in [cur] + list(cur.parents):
        if (parent / ".git").exists() and (parent / "sigma" / "m32" / "protocol.json").exists():
            return parent
            
    raise RuntimeError("Σ-GLYPH FATAL: Repository root discovery failed. Set SIGMA_ROOT.")

ROOT = get_repo_root()
PROTOCOL_PATH = ROOT / "sigma" / "m32" / "protocol.json"

# Strict load: Fail hard if protocol.json is missing or corrupted.
_data = json.loads(PROTOCOL_PATH.read_text())

VERSION = _data["VERSION"]

OP_LITERAL = _data["OPCODES"]["LITERAL"]
OP_REF = _data["OPCODES"]["REF"]
OP_APPLY = _data["OPCODES"]["APPLY"]
OP_LAMBDA = _data["OPCODES"]["LAMBDA"]
OP_DISSONANCE = _data["OPCODES"]["DISSONANCE"]

F_ATOM = _data["FLAGS"]["F_ATOM"]
F_LEFT = _data["FLAGS"]["F_LEFT"]
F_RIGHT = _data["FLAGS"]["F_RIGHT"]
