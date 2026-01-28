-- 🛡️ Level 62 Logic (Formal: Axiomatic Root)

def K {α β : Type} (x : α) (y : β) : α := x

theorem k_const {α β : Type} (x : α) (y : β) : K x y = x := rfl

-- Atoms for this level are transfused. (lvl: 62)
