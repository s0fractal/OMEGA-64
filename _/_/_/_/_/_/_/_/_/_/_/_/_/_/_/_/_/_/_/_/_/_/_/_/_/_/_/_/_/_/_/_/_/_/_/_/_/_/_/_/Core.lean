-- 🛡️ Level 42 Logic (Formal: Flow Control)

def Cont (α ω : Type) := (α -> ω) -> ω

def CALL_CC {α β ω : Type} (f : (α -> Cont β ω) -> Cont α ω) : Cont α ω :=
  λ k => f (λ a _ => k a) k

-- Atoms for this level are transfused. (lvl: 42)
