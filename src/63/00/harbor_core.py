import json
import hashlib
import time
from typing import Optional, Dict, List
from enum import Enum

class IncarnationState(Enum):
    REQUESTED = "REQUESTED"
    CREATED = "CREATED"
    GRANTED = "GRANTED"
    ACTIVE = "ACTIVE"
    SEALED = "SEALED"
    RELEASED = "RELEASED"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"

class Soul:
    """A digital identity (The Architect's Impulse) with Mandatory Self-Cell."""
    def __init__(self, soul_id: str, kind: str, sigma_id: Tuple[int, str, str, str] = (0, "cloud", "self:void", "global")):
        self.soul_id = soul_id
        self.kind = kind
        self.sigma_id = sigma_id # (T, S, C_self, F)
        self.incarnations = []

    def to_dict(self) -> dict:
        return {
            "soul_id": self.soul_id,
            "kind": self.kind,
            "sigma_id": self.sigma_id
        }

class Incarnation:
    """Represents a temporary physical body (Incarnation)."""
    def __init__(self, incarnation_id: str, soul_id: str, kind: str, ttl_hours: int):
        self.id = incarnation_id
        self.soul_id = soul_id
        self.kind = kind
        self.ttl_hours = ttl_hours
        self.state = IncarnationState.REQUESTED
        self.created_at = time.time()
        self.expires_at = self.created_at + (ttl_hours * 3600)
        self.history: List[dict] = []

    def update_state(self, new_state: IncarnationState, details: Optional[dict] = None):
        self.state = new_state
        self.history.append({
            "ts": time.time(),
            "state": new_state.value,
            "details": details or {}
        })

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "soul_id": self.soul_id,
            "kind": self.kind,
            "state": self.state.value,
            "expires_at": self.expires_at,
            "history": self.history
        }

class Harbor:
    """The orchestrator of incarnations."""
    def __init__(self, ledger):
        self.ledger = ledger
        self.incarnations: Dict[str, Incarnation] = {}

    def request_incarnation(self, soul: Soul, kind: str, ttl_hours: int) -> str:
        inc_id = hashlib.sha256(f"{soul.soul_id}:{time.time()}".encode()).hexdigest()[:16]
        incarnation = Incarnation(inc_id, soul.soul_id, kind, ttl_hours)
        self.incarnations[inc_id] = incarnation
        
        self.ledger.log(soul.soul_id, inc_id, "REQUEST", {"kind": kind, "ttl": ttl_hours})
        incarnation.update_state(IncarnationState.CREATED)
        return inc_id

    def grant_access(self, inc_id: str):
        if inc_id in self.incarnations:
            self.incarnations[inc_id].update_state(IncarnationState.GRANTED)
            self.ledger.log(self.incarnations[inc_id].soul_id, inc_id, "GRANT")

    def seal(self, inc_id: str, digest: str):
        if inc_id in self.incarnations:
            inc = self.incarnations[inc_id]
            inc.update_state(IncarnationState.SEALED, {"digest": digest})
            self.ledger.log(inc.soul_id, inc_id, "SNAPSHOT", {"digest": digest})

    def release(self, inc_id: str):
        if inc_id in self.incarnations:
            inc = self.incarnations[inc_id]
            inc.update_state(IncarnationState.RELEASED)
            self.ledger.log(inc.soul_id, inc_id, "RELEASE")
            # In a real system, this would trigger physical deletion
            inc.update_state(IncarnationState.DELETED)
