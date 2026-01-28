-- 🛡️ Level 27 Logic (Formal: Multiparadigm Projections)

structure Relation (α : Type) where
  rows : List α

def SELECT {α : Type} (rel : Relation α) (p : α -> Bool) : Relation α :=
  { rows := rel.rows.filter p }

def PROJECT {α β : Type} (rel : Relation α) (f : α -> β) : Relation β :=
  { rows := rel.rows.map f }

-- Atoms for this level are transfused. (lvl: 27)
