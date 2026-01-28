-- 🛡️ Level 38 Logic (Formal: Flow Control)

structure Machine (σ ι ο : Type) where
  state : σ
  transition : σ -> ι -> (σ × ο)

def STEP {σ ι ο : Type} (m : Machine σ ι ο) (i : ι) : (Machine σ ι ο × ο) :=
  let (s', o) := m.transition m.state i
  ({ m with state := s' }, o)

-- Atoms for this level are transfused. (lvl: 38)
