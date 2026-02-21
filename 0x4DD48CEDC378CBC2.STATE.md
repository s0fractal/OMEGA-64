---
eigenvalue: "0x4DD48CEDC378CBC2"
vector: 02.04.00
symbol: "STATE"
desc: "Atomic State representation. Pairs an item with a state tag."
---

## GREEN (G)

Atomic State representation. A fundamental somatic container:
`s a pair = pair a s`. Pairs an action `a` with a state `s`.

## BLUE (B)

```typescript
export const ATOM = () => (a: any) => (s: any) => (pair: any) => pair(a)(s);
```
