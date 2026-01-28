-- 🛡️ Level 37 Logic (Formal: Flow Control)

class MetricSpace (α : Type) where
  dist : α -> α -> Float

def IS_NEIGHBOR {α : Type} [MetricSpace α] (a b : α) (radius : Float) : Prop :=
  MetricSpace.dist a b <= radius

-- Atoms for this level are transfused. (lvl: 37)
