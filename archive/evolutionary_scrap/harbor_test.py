from harbor_core import Harbor, Soul, IncarnationState
from harbor_ledger import Ledger
from pathlib import Path

def test_harbor_lifecycle():
    print("🧪 Testing V56.0 Harbor Lifecycle...")
    
    # 1. Setup Ledger
    ledger_path = Path("harbor_test.ledger")
    if ledger_path.exists(): ledger_path.unlink()
    ledger = Ledger(ledger_path)
    harbor = Harbor(ledger)
    
    # 2. Create Soul
    soul = Soul("s0:sha256:architect", "ed25519:pure_intent", "cid:v56.genome")
    
    # 3. Request Incarnation
    inc_id = harbor.request_incarnation(soul, "branch", 6)
    print(f"   [PASS] Incarnation requested: {inc_id}")
    
    # 4. Grant and Seal
    harbor.grant_access(inc_id)
    harbor.seal(inc_id, "sha256:final_snapshot_digest")
    
    # 5. Release
    harbor.release(inc_id)
    print(f"   [PASS] Incarnation released and deleted.")
    
    # 6. Verify Ledger
    events = ledger.read_all()
    print(f"   Ledger entry count: {len(events)}")
    assert len(events) >= 4
    assert events[0]["type"] == "REQUEST"
    assert events[-1]["type"] == "RELEASE"
    
    print("   ✅ Harbor Protocol Cycle Successful.")
    if ledger_path.exists(): ledger_path.unlink()

if __name__ == "__main__":
    test_harbor_lifecycle()
