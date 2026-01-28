-- 🛡️ Level 18 Logic (Formal: Multiparadigm Projections)

structure Temp where
  val : Float

def HEAT (t : Temp) (amount : Float) : Temp :=
  { val := t.val + amount }

def COOL (t : Temp) (amount : Float) : Temp :=
  { val := t.val - amount }

-- Atoms for this level are transfused. (lvl: 18)
