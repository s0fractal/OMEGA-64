-- 🛡️ Level 57 Logic (Formal: Atomic Operator)

def MUX {α : Type} (b : α -> α -> α) (x y : α) : α :=
  b x y

def AND {α : Type} (x y : α -> α -> α) (t f : α) : α :=
  x (y t f) f

theorem mux_t {α : Type} (x y : α) : MUX T x y = x := rfl
theorem mux_f {α : Type} (x y : α) : MUX F x y = y := rfl

-- Atoms for this level are transfused. (lvl: 57)
