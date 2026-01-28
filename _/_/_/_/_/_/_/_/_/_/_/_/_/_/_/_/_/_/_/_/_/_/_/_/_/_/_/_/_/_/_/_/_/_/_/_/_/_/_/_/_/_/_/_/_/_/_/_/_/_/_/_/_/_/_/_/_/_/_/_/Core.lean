-- 🛡️ Level 59 Logic (Formal: Atomic Operator)

def T {α : Type} (t f : α) : α := t
def F {α : Type} (t f : α) : α := f

def NOT {α : Type} (b : (α -> α -> α)) (t f : α) : α :=
  b f t

theorem not_t {α : Type} (t f : α) : NOT T t f = f := rfl
theorem not_f {α : Type} (t f : α) : NOT F t f = t := rfl

-- Atoms for this level are transfused. (lvl: 59)
