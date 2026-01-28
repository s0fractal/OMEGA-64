-- 🛡️ Level 50 Logic (Formal: Atomic Operator)

-- MAP: Apply a function to each element of a list
def MAP {α β : Type} (f : α -> β) : List α -> List β
  | [] => []
  | x :: xs => f x :: MAP f xs

-- FILTER: Filter elements of a list
def FILTER {α : Type} (p : α -> Bool) : List α -> List α
  | [] => []
  | x :: xs => if p x then x :: FILTER p xs else FILTER p xs

theorem map_id {α : Type} (l : List α) : MAP (λ x => x) l = l := by
  induction l with
  | nil => rfl
  | cons x xs ih => simpl [MAP]; rw [ih]; rfl

-- Atoms for this level are transfused. (lvl: 50)
