-- 🛡️ Level 54 Logic (Formal: Atomic Operator)

def CONS {α β γ : Type} (x : α) (y : β) (f : α -> β -> γ) : γ :=
  f x y

def CAR {α β : Type} (p : (α -> β -> α) -> α) : α :=
  p (λ x _y => x)

def CDR {α β : Type} (p : (α -> β -> β) -> β) : β :=
  p (λ _x y => y)

theorem car_cons {α β : Type} (x : α) (y : β) :
  CAR (CONS x y) = x := rfl

theorem cdr_cons {α β : Type} (x : α) (y : β) :
  CDR (CONS x y) = y := rfl

-- Atoms for this level are transfused. (lvl: 54)
