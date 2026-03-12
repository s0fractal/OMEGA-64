import scr1
import json
from pathlib import Path

def debug():
    vec_path = Path("PY/z00/vectors.json")
    vector = json.loads(vec_path.read_text())["vectors"][0]
    body = vector["body"]
    
    canon_bytes = scr1.canonicalize_sigma(body)
    print("--- CANONICAL BODY (START) ---")
    print(canon_bytes.decode("utf-8"), end="")
    print("--- CANONICAL BODY (END) ---")
    
    import hashlib
    h = hashlib.sha256(canon_bytes).hexdigest()
    print(f"ACTUAL HASH:   {h}")
    print(f"EXPECTED HASH: {vector['expected_hash']}")

if __name__ == "__main__":
    debug()
