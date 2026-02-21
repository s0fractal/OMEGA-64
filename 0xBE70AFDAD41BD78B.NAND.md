---
eigenvalue: "0xBE70AFDAD41BD78B"
vector: 00.06.01
symbol: "NAND"
desc: "Universal Logic Guard (NAND). The root of all Boolean logic."
---

## GREEN (G)

Universal Logic Guard (NAND). Implemented via Church Encoding. As a universal
gate, any other logical operation can be derived from it. Essential for
low-level circuit emulation and Boolean resolution.

## BLUE (B)

```typescript
export const ATOM = () => (a: any) => (b: any) =>
  a(b((_t: any) => (f: any) => f)((t: any) => (_f: any) => t))(
    (_t: any) => (f: any) => f
  );
```
