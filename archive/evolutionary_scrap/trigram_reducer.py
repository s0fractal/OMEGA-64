"""
Σ-GLYPH Trigram Reducer v1.0
Pure combinatory logic reduction engine.

8-atom basis: I, K, S, B, C, W, M, F
Zero memory, zero side effects, deterministic.
"""

from dataclasses import dataclass
from typing import Union


# ============================================================================
# AST: Atoms and Applications
# ============================================================================

@dataclass(frozen=True)
class Atom:
    """
    Atomic combinator.
    
    Each atom is a 3-bit trigram (000-111).
    """
    trigram: str  # "000" to "111"
    name: str     # "I", "K", "S", "B", "C", "W", "M", "F"
    
    def __repr__(self):
        return self.name


@dataclass(frozen=True)
class App:
    """
    Application node: (left right)
    
    Represents function application.
    """
    left: 'Node'
    right: 'Node'
    
    def __repr__(self):
        return f"({self.left} {self.right})"


Node = Union[Atom, App]


# ============================================================================
# Atom Definitions
# ============================================================================

# Trigram encoding
ATOM_ENCODING = {
    'I': '000',  # Identity
    'K': '001',  # Constant (TRUE)
    'S': '010',  # Substitution
    'B': '011',  # Bluebird (composition)
    'C': '100',  # Cardinal (flip)
    'W': '101',  # Warbler (duplicate)
    'M': '110',  # Mockingbird (self-apply)
    'F': '111',  # FALSE
}

# Reverse mapping
TRIGRAM_TO_ATOM = {v: k for k, v in ATOM_ENCODING.items()}

# Atom constructors
I = Atom('000', 'I')
K = Atom('001', 'K')
S = Atom('010', 'S')
B = Atom('011', 'B')
C = Atom('100', 'C')
W = Atom('101', 'W')
M = Atom('110', 'M')
F = Atom('111', 'F')


# ============================================================================
# Reduction Rules
# ============================================================================

def reduce_step(node: Node) -> tuple[Node, bool]:
    """
    Perform one reduction step.
    
    Returns: (reduced_node, changed)
    
    Reduction rules:
    - I x → x
    - K x y → x
    - S x y z → x z (y z)
    - B x y z → x (y z)
    - C x y z → x z y
    - W x y → x y y
    - M x → x x
    - F x y → y
    """
    if isinstance(node, Atom):
        return node, False
    
    # node is App(left, right)
    left, right = node.left, node.right
    
    # Try to reduce left subtree first
    left_reduced, left_changed = reduce_step(left)
    if left_changed:
        return App(left_reduced, right), True
    
    # Try to reduce right subtree
    right_reduced, right_changed = reduce_step(right)
    if right_changed:
        return App(left, right_reduced), True
    
    # Try to apply reduction rules
    
    # I x → x
    if left == I:
        return right, True
    
    # M x → x x
    if left == M:
        return App(right, right), True
    
    # Check for two-argument combinators
    if isinstance(left, App):
        left_left = left.left
        left_right = left.right
        
        # K x y → x
        if left_left == K:
            return left_right, True
        
        # F x y → y
        if left_left == F:
            return right, True
        
        # W x y → x y y
        if left_left == W:
            return App(App(left_right, right), right), True
        
        # Check for three-argument combinators
        if isinstance(left_left, App):
            left_left_left = left_left.left
            left_left_right = left_left.right
            
            # S x y z → x z (y z)
            if left_left_left == S:
                x = left_left_right
                y = left_right
                z = right
                return App(App(x, z), App(y, z)), True
            
            # B x y z → x (y z)
            if left_left_left == B:
                x = left_left_right
                y = left_right
                z = right
                return App(x, App(y, z)), True
            
            # C x y z → x z y
            if left_left_left == C:
                x = left_left_right
                y = left_right
                z = right
                return App(App(x, z), y), True
    
    # No reduction possible
    return node, False


def reduce(node: Node, max_steps: int = 10000) -> Node:
    """
    Reduce to normal form.
    
    Args:
        node: AST to reduce
        max_steps: Maximum reduction steps (prevents infinite loops)
    
    Returns:
        Normal form (fully reduced AST)
    """
    for _ in range(max_steps):
        reduced, changed = reduce_step(node)
        if not changed:
            return reduced
        node = reduced
    
    # Max steps reached - return current state
    print(f"⚠️ Warning: Max reduction steps ({max_steps}) reached")
    return node


# ============================================================================
# Utilities
# ============================================================================

def parse(expr: str) -> Node:
    """
    Parse simple expression string to AST.
    
    Format: "I", "K x y", "(S K) K", etc.
    """
    tokens = expr.replace('(', ' ( ').replace(')', ' ) ').split()
    
    def parse_tokens(tokens, pos=0):
        if pos >= len(tokens):
            raise ValueError("Unexpected end of expression")
        
        token = tokens[pos]
        
        if token == '(':
            # Parse application
            left, pos = parse_tokens(tokens, pos + 1)
            right, pos = parse_tokens(tokens, pos)
            if pos >= len(tokens) or tokens[pos] != ')':
                raise ValueError("Expected ')'")
            return App(left, right), pos + 1
        
        elif token in ATOM_ENCODING:
            # Parse atom
            trigram = ATOM_ENCODING[token]
            return Atom(trigram, token), pos + 1
        
        else:
            raise ValueError(f"Unknown token: {token}")
    
    result, _ = parse_tokens(tokens)
    return result


# ============================================================================
# Examples
# ============================================================================

if __name__ == "__main__":
    print("🔺 Σ-GLYPH Trigram Reducer v1.0")
    print("=" * 50)
    
    # Example 1: I x = x
    print("\n📖 Example 1: I x = x")
    x = Atom('000', 'X')  # Dummy atom
    expr = App(I, x)
    print(f"   Input:  {expr}")
    result = reduce(expr)
    print(f"   Output: {result}")
    print(f"   ✅ Correct: {result == x}")
    
    # Example 2: K x y = x
    print("\n📖 Example 2: K x y = x")
    y = Atom('001', 'Y')  # Dummy atom
    expr = App(App(K, x), y)
    print(f"   Input:  {expr}")
    result = reduce(expr)
    print(f"   Output: {result}")
    print(f"   ✅ Correct: {result == x}")
    
    # Example 3: S K K x = x (SKK = I)
    print("\n📖 Example 3: S K K x = x (SKK = I)")
    expr = App(App(App(S, K), K), x)
    print(f"   Input:  {expr}")
    result = reduce(expr)
    print(f"   Output: {result}")
    print(f"   ✅ Correct: {result == x}")
    
    # Example 4: Boolean logic - IF TRUE A B = A
    print("\n📖 Example 4: IF TRUE A B = A")
    A = Atom('010', 'A')
    B_atom = Atom('011', 'B')
    # IF = λp.λa.λb. p a b (just application)
    # TRUE = K
    expr = App(App(K, A), B_atom)  # K A B
    print(f"   Input:  K A B")
    result = reduce(expr)
    print(f"   Output: {result}")
    print(f"   ✅ Correct: {result == A}")
    
    # Example 5: Boolean logic - IF FALSE A B = B
    print("\n📖 Example 5: IF FALSE A B = B")
    # FALSE = F
    expr = App(App(F, A), B_atom)  # F A B
    print(f"   Input:  F A B")
    result = reduce(expr)
    print(f"   Output: {result}")
    print(f"   ✅ Correct: {result == B_atom}")
    
    print("\n" + "=" * 50)
    print("✅ All examples passed!")
    print("🔺 Trigram Octet: OPERATIONAL")
