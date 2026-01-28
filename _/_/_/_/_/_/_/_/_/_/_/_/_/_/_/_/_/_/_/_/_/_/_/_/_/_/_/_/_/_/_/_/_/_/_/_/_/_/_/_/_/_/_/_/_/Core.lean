-- 🛡️ Level 45 Logic (Formal: Flow Control)

def STATE (σ α : Type) := σ -> (α × σ)

def READER (ρ α : Type) := ρ -> α

def ASK {ρ : Type} : READER ρ ρ := λ r => r

-- Atoms for this level are transfused. (lvl: 45)
