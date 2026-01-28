-- 🛡️ Level 35 Logic (Formal: Flow Control)

structure Isomorphism (α β : Type) where
  to : α -> β
  from : β -> α
  to_from_id : ∀ b, to (from b) = b
  from_to_id : ∀ a, from (to a) = a

def REFL {α : Type} : Isomorphism α α :=
  { to := id, from := id, to_from_id := λ _ => rfl, from_to_id := λ _ => rfl }

-- Atoms for this level are transfused. (lvl: 35)
