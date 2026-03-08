# 📑 Roadmap 2.0: OMEGA-64 / Σ-CORE

This document fixes an adjacent future-vector for OMEGA-64. It is not the active
migration contract and does not supersede
[REDUCTION_METABOLISM_ROADMAP.md](/Users/s0fractal/OMEGA/REDUCTION_METABOLISM_ROADMAP.md)
or
[OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md).

It exists so the export surface preserves a second-order architectural line: the
transition from code that imitates life toward substrate where life, memory,
consensus, and autonomy can emerge as protocol.

## 1. Траєкторія: "Sovereignty Protocol" (Governance)

**Суть:** Створення "Цифрового Левіафана". Система як інструмент соціального та
економічного консенсусу.

- **Ядро:** Криптографічний шлюз `GATE.ts`, транзакційна цілісність.
- **Механіка:**
  - `SHARE / BET` — передача прав власності та прогнозування ризиків.
  - `QUORUM` — механізм прийняття рішень через агрегацію станів атомів.
- **Мета:** Симуляція макроекономіки та ігрової теорії без "галюцинацій"
  людського фактора.

## 2. Траєкторія: "Living Memory" (Semantic Engine)

**Суть:** Дані як живий організм. Динамічний RAG, де інформація
самоорганізується.

- **Ядро:** Binary Quantization (64-bit logic) + Просторові хеші.
- **Механіка:**
  - `HEBB / FIRE` — вузли, що часто запитуються, зміцнюють зв'язки (синапси).
  - `DECAY` — втрата енергії (забування) неактуальних даних.
- **Мета:** Створення "Сяйва" (Prime Radiant) — бази знань, що еволюціонує разом
  із запитами ШІ.

## 3. Траєкторія: "Responsible Autonomy" (AI Sandbox)

**Суть:** Безпечне середовище для LLM-агентів. "Пісочниця" з фізичними
обмеженнями ресурсу.

- **Ядро:** WASM-ізоляція, повний контроль пам'яті (`SharedArrayBuffer` із
  суворим детермінізмом).
- **Механіка:**
  - `SYS_CALL` — єдиний шлях взаємодії агента із зовнішнім світом.
  - `ENERGY_CAP` — обмеження обчислювальної складності (Gas).
- **Мета:** Протокол, де агенти можуть торгувати та діяти, не порушуючи законів
  "фізики" системи.

## 4. Траєкторія: "Alife Engine" (Emergent Complexity)

**Суть:** Справжня еволюція. Тут захардкоджена біологія прибирається, а її місце
займає нижчий математичний субстрат.

### 🦀 Пропозиція базових Rust-функцій (Low-level Substrate)

Щоб реалізувати ідею "холодного субстрату", базові доменні дії на кшталт `EAT`
та `MOVE` замінюються низькорівневими примітивами в `LAMBDA_VM_v2.rs`:

```rust
pub enum SigmaOp {
    // ENERGETICS: the substrate knows bytes and transfer, not "food".
    Transfer { from: Address, to: Address, amount: u64 },
    Pulse,

    // TOPOLOGY: graph mutation.
    Bind { target: Address, weight: f32 },
    Sever { target: Address },

    // GENOME: bytecode replication and mutation.
    Replicate { template: Vec<u8>, target_slot: MemorySlot },
    Mutate { offset: usize, bit_flip: bool },

    // LOGIC: bounded functional substrate.
    Fold { data: Vec<u8>, function_ptr: Address },
    Compare { a: Address, b: Address },

    // SPACE: movement in semantic / Hamming space.
    Attract { vector: Vector64 },
}
```

### Чому це спрацює

1. **Біологія через реплікацію:** Замість `self.reproduce()` атом виконує
   `Replicate`, копіюючи свій масив інструкцій у сусідній слот. Якщо під час
   копіювання спрацював `Mutate`, виникає еволюційне відхилення.
2. **Податки через Transfer:** У гілці "Sovereignty" скрипт просто викликає
   `Transfer` до адреси Скарбниці.
3. **Сенс через Attract:** Атоми не просто плавають на екрані, а притягуються до
   вузлів зі схожим вектором знань.

## Roadmap 2.0 "Деструкції"

1. **Phase 1:** Спрощення `LAMBDA_VM` до приблизно цих базових інструкцій.
2. **Phase 2:** Перенесення логіки "Епохи 69" (феромони, ролі) у
   завантажувальний байт-код (`Genesis scripts`).
3. **Phase 3:** Розгортання 4 гілок (`branches`) для тестування кожної
   траєкторії окремо.

## Position relative to the active roadmap

- This file captures a future-facing singularity map.
- The currently active migration contract remains:
  - [REDUCTION_METABOLISM_ROADMAP.md](/Users/s0fractal/OMEGA/REDUCTION_METABOLISM_ROADMAP.md)
  - [OMEGA_TRANSITION_PLAN.md](/Users/s0fractal/OMEGA/docs/migration/OMEGA_TRANSITION_PLAN.md)
- If work is scheduled from this document, it should first be translated into:
  - explicit phases
  - concrete artifacts
  - invariants
  - rollback paths
  - export-visible progress markers
