import json
import hashlib
from typing import Dict, List, Optional
from enum import Enum

class CellState(Enum):
    QWAVE = "QWAVE"        # Superposition (Mist)
    SIGMA = "SIGMA"        # Crystallized (Glass)
    CONFLICT = "CONFLICT"  # High Impedance (Grit)

class GaiaCell:
    """A single cell in the Gaia Grid."""
    def __init__(self, cell_id: str, x: int, y: int):
        self.id = cell_id
        self.pos = (x, y)
        self.trace_density = 0.0      # Mineral anchors (0.0 to 1.0)
        self.conductance = 0.1        # Flow ease (0.1 to 1.0, 1.0 = water)
        self.pain = 0.0               # Tension index
        self.state = CellState.QWAVE
        self.intent_level = 0.0       # Current "volume" of intent flow
        self.neighbors: List[str] = []

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "pos": self.pos,
            "trace": self.trace_density,
            "conductance": self.conductance,
            "pain": self.pain,
            "state": self.state.value,
            "intent": self.intent_level
        }

class GaiaGrid:
    """The metabolic grid for intent flow and crystallization."""
    def __init__(self):
        self.cells: Dict[str, GaiaCell] = {}

    def add_cell(self, cell_id: str, x: int, y: int, conductance: float = 0.1):
        self.cells[cell_id] = GaiaCell(cell_id, x, y)
        self.cells[cell_id].conductance = conductance

    def link(self, id1: str, id2: str):
        if id1 in self.cells and id2 in self.cells:
            if id2 not in self.cells[id1].neighbors:
                self.cells[id1].neighbors.append(id2)
            if id1 not in self.cells[id2].neighbors:
                self.cells[id2].neighbors.append(id1)

    def pulse_metabolism(self):
        """Standard flow step: Move intent along conductance channels."""
        updates = {}
        for cell_id, cell in self.cells.items():
            if cell.intent_level > 0.05:
                # Distribute intent to neighbors based on conductance
                total_cond = sum(self.cells[nb].conductance for nb in cell.neighbors)
                if total_cond > 0:
                    flow_amount = cell.intent_level * 0.5
                    for nb_id in cell.neighbors:
                        nb = self.cells[nb_id]
                        share = (nb.conductance / total_cond) * flow_amount
                        updates[nb_id] = updates.get(nb_id, 0.0) + share
                    updates[cell_id] = updates.get(cell_id, 0.0) - flow_amount
        
        for cell_id, delta in updates.items():
            self.cells[cell_id].intent_level += delta

    def check_coherence(self) -> List[dict]:
        """Identify discrepancies (Pain) between intent and trace."""
        discrepancies = []
        for cell in self.cells.values():
            # Rule: If intent is high but trace is 0 and conductance is low, pain rises
            if cell.intent_level > 0.5 and cell.trace_density < 0.1 and cell.conductance < 0.5:
                cell.pain += 0.2
                if cell.pain > 0.5:
                    cell.state = CellState.CONFLICT
                    discrepancies.append({
                        "cell": cell.id,
                        "type": "TRACE_MISMATCH",
                        "pain": cell.pain,
                        "msg": f"High intent at {cell.id} but no mineral anchor or channel."
                    })
            
            # Rule: If trace is high and intent is stable, crystallize
            if cell.trace_density > 0.8 and cell.intent_level > 0.05 and cell.pain < 0.2:
                cell.state = CellState.SIGMA
        return discrepancies
