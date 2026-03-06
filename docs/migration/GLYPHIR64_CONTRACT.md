# GlyphIR64 Contract

> Contract scaffold only. This file defines the bridge vocabulary before any runtime path depends on it.

## Purpose

`GlyphIR64` is the transitional IR between the current legacy opcode ISA and the future bounded reduction metabolism.

It exists to solve one migration problem:

- preserve a readable, machine-checkable bridge while legacy execution and reduction execution coexist.

It does **not** authorize semantic mutation or runtime ownership transfer by itself.

## Hard invariants

1. The glyph id space is fixed at `0..63`.
2. `0..3` are permanently reserved for `S`, `K`, `I`, `Y`.
3. `S/K/I/Y` are not open to semantic mutation.
4. Initial bridge coverage is partial and explicit; unmapped legacy opcodes stay legacy.
5. Any mapped opcode must round-trip through:
   - legacy opcode -> glyph tape
   - glyph tape -> debug explanation

## Required record shape

Every glyph definition must eventually expose at least:

- `id: number`
- `mnemonic: string`
- `kind: "core" | "control" | "transport" | "structural" | "catalytic" | "regulatory" | "memory" | "reserve"`
- `arity: number`
- `energyCost: number`
- `stabilityClass: "hard-invariant" | "legacy-bridge" | "bounded-dynamic" | "reserve"`
- `reductionRuleRef: string`
- `legacyOpcode?: number`
- `notes?: string`

## Initial id bands

| Id range | Class | Intent |
| --- | --- | --- |
| `0..3` | core | `S/K/I/Y` hard invariants |
| `4..15` | control | bridge-safe control/data glyphs |
| `16..23` | transport | replication, signaling, exchange |
| `24..31` | structural | build / plug / tensegrity surfaces |
| `32..39` | catalytic | role / collective transforms |
| `40..47` | regulatory | future bounded policy glyphs |
| `48..55` | memory | persistent or hive-local symbolic state |
| `56..63` | reserve | mutation reserve / sandbox only |

## Initial bridge subset

The first bridge subset is intentionally narrow and tied to the active WASM ISA surface.

| Glyph Id | Mnemonic | Legacy opcode | Current behavior class | Status |
| --- | --- | --- | --- | --- |
| `0` | `S` | none | core combinator | hard invariant |
| `1` | `K` | none | core combinator | hard invariant |
| `2` | `I` | none | core combinator | hard invariant |
| `3` | `Y` | none | bounded recursion anchor | hard invariant |
| `8` | `SET` | `0x01` | register write | bridge candidate |
| `9` | `GET` | `0x02` | property read | bridge candidate |
| `10` | `PUT` | `0x03` | property write | bridge candidate |
| `11` | `ADD` | `0x04` | arithmetic | bridge candidate |
| `12` | `SUB` | `0x05` | arithmetic | bridge candidate |
| `13` | `JNZ` | `0x11` | control flow | bridge candidate |
| `14` | `JMP` | `0x12` | control flow | bridge candidate |
| `15` | `JZ` | `0x10` | control flow | bridge candidate |
| `16` | `REPLICATE` | `0x80` | transport / reproduction | bridge candidate |
| `17` | `SIGNAL` | `0x81` | transport / field write | bridge candidate |
| `18` | `SHARE` | `0x83` | transport / resource exchange | bridge candidate; bounded bonded-transfer parity active |
| `24` | `PLUG` | `0xA4` | structural IO | bridge candidate |
| `25` | `TENSEGRITY` | `0xA5` | structural constraint | bridge candidate |
| `32` | `COLLECTIVE` | `0xA6` | catalytic / group side-effect | bridge candidate; bounded mode `0/1/2/3/4/5/6` parity active |
| `33` | `ROLE` | `0xA7` | catalytic / identity shift | bridge candidate |
| `26` | `BUILD` | `0xA8` | structural intent publish | bridge candidate |
| `27` | `SENSE` | `0xA9` | structural query | bridge candidate; bounded stale-lock fallback parity active |

## Deferred opcodes

The following stay outside the initial bridge subset until parity is clearer:

- `OP_BIND (0x82)` because the active WASM dispatch surface does not currently expose it alongside the other bridge-critical opcodes.
- `OP_SPORE_DRIVE (0xAA)` and `OP_ENTANGLE (0xAB)` until their active runtime path is confirmed end-to-end in the current kernel.
- any future semantic-mutation glyphs in the reserve band.

## Debug and verification requirements

`GlyphIR64` is not complete unless it has both of these views:

1. `opcode/script -> glyph tape`
2. `glyph tape -> readable explanation`

The explanation layer must name:

- glyph mnemonic
- originating legacy opcode if any
- energy cost class
- reduction rule reference

## Migration gate

Stage 3 is considered real only when:

1. at least `10-15` active legacy opcodes are mapped explicitly,
2. the mapping is machine-readable,
3. unmapped opcodes fail closed rather than silently guessing,
4. the first reduction harness cases can consume the mapped subset.

## Non-goals for this phase

- no runtime execution through `GlyphIR64`
- no replacement of the active WASM kernel
- no semantic mutation of non-core glyphs
- no claim that "64 glyphs are now proteins"
