# OMEGA-64 — аналіз поточного стану і перебудований роадмап

> Status: planning artifact only. No implementation has started from this document yet.

## 1. Де проект стоїть зараз

OMEGA-64 уже не виглядає як проста імперативна симуляція. У нього є:

- **runtime roots**: `PULSE.ts`, `PULSE_WORKER.ts`, `assembly/index.ts`, `OMEGA_DAEMON.ts`, `AKASHA_SERVER.ts`, `SYSTEM_START.ts`
- **shared substrate** через `STATE_MATRIX.ts` + `OFFSETS.ts` на `SharedArrayBuffer`
- **execution plane** через worker + WASM
- **governance plane** через `GATE.ts` + `SHIMS.ts`
- **continuity/memory plane** через `AKASHA_CODEX.ts`, snapshots, chronicles, relics, invariants
- **operator / observer membrane** через Akasha REST/WebSocket/WebRTC ingress

Тобто це вже не “двіжок з циклом”, а протосистема з такими властивостями:

1. **є субстрат**
2. **є окремий execution plane**
3. **є керування згори**
4. **є телеметрія й зворотний зв’язок**
5. **є зовнішній мембранний інтерфейс**
6. **є історична пам’ять та інваріанти**

Але при цьому вона ще **не перейшла в метаболічну архітектуру**. Причина: головна причинність досі розподілена між:

- host orchestration
- daemon feedback
- gate policy
- imperative opcode execution
- REST/control ingress

Тобто зараз це **гібридна система**: фізичний субстрат уже є, а от **універсальна семантика перетворень** ще не стала єдиною “фізикою всесвіту”.

## 2. Що в поточному стані вже сильне

### 2.1. Є жива пам’ять, а не просто лог

`AKASHA_CODEX.ts` уже робить надзвичайно важливу річ: він не просто пише логи, а синтезує:

- species
- chronicles
- relics
- invariants
- narrative snapshot

Це означає, що у системи вже є **семантична макропам’ять**. Це не дрібниця. Це майже готовий верхній шар для метаболічної архітектури.

### 2.2. Даймон уже поводиться як ендокринний контур

З фрагментів видно, що `OMEGA_DAEMON` уже:

- читає телеметрію
- читає codex narrative
- формує invariant frame
- пробує керувати homeostasis
- підкручує base tax / target energy через feedback

Тобто твій Етап 3 не вигаданий — він частково вже існує.

### 2.3. Є початок транспортної біології

`AKASHA_SERVER.ts` уже підтримує:

- `DROP_PHEROMONE`
- `INJECT_PLASMID`
- mesh ingress через WebRTC
- проксі до `/api/inject`, `/api/homeostasis`, `/api/pressure-ring`

Це дуже важливо: у тебе вже є зародок **glyph transport membrane**. Значить Етап 2 також не нульовий.

### 2.4. Є експериментальний редукційний напрямок

У non-runtime/experimental вже лежать:

- `LAMBDA_VM.ts`
- `RIBOSOME_TICK.ts`
- `ECOLOGY_ENGINE.ts`
- `REFLECTION_ENGINE.ts`

Особливо показовий `RIBOSOME_TICK.reduce(...)`: це прямий сигнал, що ідея переходу до редукційної семантики вже народжена, але ще не стала ядром runtime.

## 3. Головні проблеми поточного роадмапу

### 3.1. Він стрибає одразу в онтологію, не закривши проміжний міст

Ти пишеш “прибрати прямі виклики функцій, замінивши їх доставкою гліфів”, але між поточним opcode-runtime і повноцінним glyph-reduction світом бракує перехідного шару.

Потрібен **transitional IR**:

- або `GlyphIR64`
- або `CombinatorTape`
- або `ReductionCell`

Без цього проект ризикує зависнути між старим ISA та новим метаболізмом.

### 3.2. SKIY як базис правильний, але не вистачає двох рівнів мапінгу

Потрібно розвести:

1. **онтологічний базис** — `S K I Y`
2. **операційний алфавіт** — 64 glyphs
3. **фізичний carrier** — байт / 6-бітний код / tape slot / node field

Зараз у роадмапі це змішано.

### 3.3. 60 триграм одразу як “цифрові білки” — красиво, але ризиково

Проблема не в ідеї, а в часові. Якщо дати 60 триграмам функціональні ролі до того, як зафіксовано:

- правила редукції
- інваріанти детермінізму
- правила композиції
- правила енергетичної ціни

то отримаєш не метаболізм, а плаваючий символічний зоопарк.

### 3.4. “Еволюція реагентів” занадто рання

Перепризначення триграм — це майже self-modifying semantics. Це треба робити **лише після** стабілізації:

- trace reproducibility
- invariant drift budget
- mutation sandbox
- rollback ledger

Інакше система почне ламати власну фізику, а не еволюціонувати.

### 3.5. KPI надто поетичні й недостатньо інструментальні

Наприклад, “if/else зменшено на 70%” — слабкий критерій. Імперативність не зникає від зменшення `if`, вона зникає, коли причинність зводиться до:

- редукції
- таблиць переходів
- декларативних constraints
- data-driven policies

## 4. Мій діагноз у двох фразах

**OMEGA-64 вже має метаболічну периферію, але ще не має метаболічного ядра.**

Найближча істина така: проект зараз перебуває не між “кодом і фізикою”, а між **opcode-governance runtime** та **reduction-native substrate**.

## 5. Перебудований роадмап

# Роадмап трансформації OMEGA-64: Від Governance Runtime до Reduction Metabolism

## Фаза 0. Інструментальний аудит причинності

### Мета

Не переписувати всесвіт наосліп. Спершу з’ясувати, де саме зараз живе причинність.

### Завдання

- Побудувати карту причинності runtime:
  - що вирішує host
  - що вирішує worker/WASM
  - що вирішує daemon
  - що вирішує gate
  - що приходить через ingress
- Відмітити всі “магічні” переходи:
  - прямі мутації shared state
  - imperative branching у критичному шляху
  - побічні ефекти без ledger/trace
- Ввести три категорії операцій:
  - **Physics-critical**
  - **Governance-critical**
  - **Narrative/observer-only**

### Артефакт виходу

`CAUSAL_ATLAS.md` + таблиця `operation -> owner -> mutability -> determinism risk`

### Gate

- Немає жодної критичної мутації без owner-класифікації.
- Виділено top-20 місць, де імператив зараз реально формує фізику.

## Фаза 1. Кристалізація редукційного ядра

### Мета

Не просто впровадити SKIY, а зробити з нього **єдиний канонічний редукційний шар**.

### Завдання

- Формалізувати `SKIY` як **Core Reduction Basis**.
- Створити `ReductionCell`:
  - `opcode/glyph`
  - `arity`
  - `energy_cost`
  - `reduction_rule`
  - `stability_class`
- Створити `GlyphIR64` як проміжну мову між поточним opcode ISA і майбутнім glyph metabolism.
- Реалізувати **двостороннє відображення**:
  - current ISA -> GlyphIR64
  - GlyphIR64 -> reduced execution form
- Винести `RIBOSOME_TICK`/`LAMBDA_VM` з експериментального статусу в ізольований verification harness.

### Важливий принцип

На цьому етапі **старий ISA не видаляється**. Він стає сумісним legacy-діалектом, який транслюється в `GlyphIR64`.

### Gate

- Принаймні 20–30% активних runtime-операцій мають еквівалент у `GlyphIR64`.
- Для вибраного піднабору операцій редукція дає той самий deterministic результат, що і старий шлях.
- Є golden traces для перевірки бітової стабільності.

## Фаза 2. 64-символьний алфавіт як фізичний carrier

### Мета

Зробити 64 символи не “поетичною таблицею”, а фізичною основою переносу і редукції.

### Завдання

- Зафіксувати таблицю:
  - `0..3 = SKIY core`
  - `4..63 = derived glyph classes`
- Не призначати одразу 60 гліфам “білкові ролі”. Спершу розділити їх на класи:
  - structural
  - transport
  - catalytic
  - regulatory
  - memory
  - noise/mutation reserve
- Ввести `GlyphClassLedger`:
  - id
  - semantic family
  - allowed compositions
  - energy signature
  - mutation tolerance

### Чому так

Не всі 60 гліфів повинні бути “функціями”. Частина має бути:

- маркерами контексту
- транспортними контейнерами
- стабілізаторами
- регуляторами

### Gate

- Кожен з 64 символів має machine-readable spec.
- Немає “вільних” glyph semantics без ledger-запису.

## Фаза 3. Перехід від execution до reduction step

### Мета

Змінити саме поняття “тік системи”.

### Завдання

- У `assembly/index.ts` ввести новий режим:
  - не “execute instruction stream”
  - а “perform bounded reduction on local expression state”
- Кожен вузол/атом отримує:
  - `expression head`
  - `fuel`
  - `local glyph buffer`
  - `residue / unreduced tail`
- Ввести bounded reduction budget:
  - max reductions per tick
  - max energy spend per reduction window
  - invariant-safe fallback при diverging recursion
- Y-комбінатор дозволяти тільки через fuel budget і recursion guard.

### Важливий принцип

На цьому етапі система ще може залишатися гібридною:

- частина клітин живе на opcode
- частина на reduction-native execution

### Gate

- Один із реальних життєвих циклів можна прогнати повністю через reduction step.
- Divergence і runaway recursion гасяться без host-level emergency patching.

## Фаза 4. Транспортний метаболізм гліфів

### Мета

Зробити glyph delivery частиною фізики, а не просто API-обгорткою.

### Завдання

- Розширити transport model:
  - pheromone = short-lived scalar/vector influence
  - plasmid = durable payload / genomic capsule
  - glyph packet = bounded symbolic cargo
- Ввести `GLYPH_BUFFER` на локальному і міжвузловому рівні.
- Додати властивості гліфа:
  - half-life
  - diffusion radius
  - decay profile
  - membrane permeability
- Інтегрувати transport з `STATE_MATRIX`, а не тримати лише на ingress boundary.

### Ключова зміна

Зараз `DROP_PHEROMONE` / `INJECT_PLASMID` більше схожі на керовані зовнішні ін’єкції. Треба, щоб система сама:

- продукувала гліфи
- переносила їх
- розкладала їх
- реагувала на них редукційно

### Gate

- Не менше 3 внутрішніх механізмів обміну працюють без ручного REST-втручання.
- Дифузія гліфів бере участь у локальній поведінці клітин.

## Фаза 5. Гормональна фізика й ендокринний Даймон

### Мета

Зібрати розрізнені feedback loops у єдину фізіологію.

### Завдання

- Створити формальний `HORMONE_BUFFER` у shared substrate:
  - entropy_pressure
  - time_viscosity
  - aggression
  - repair_drive
  - replication_bias
  - mutation_friction
- Створити `GENETIC_LEDGER` не просто як сховище констант, а як:
  - mutable-within-bounds registry
  - signed updates
  - rollback-capable history
- Перевести homeostasis з ad-hoc rule tuning до:
  - bounded controller rules
  - policy envelopes
  - safe mutation ranges

### Важливе уточнення

Даймон не має “керувати світом”. Він має:

- змінювати гормональний фон
- обмежувати runaway regimes
- підтримувати цільові інтервали
- не втручатися в локальну семантику без ledger-підстав

### Gate

- Усі глобальні константи, які реально впливають на поведінку, або в `GENETIC_LEDGER`, або явно позначені як hard invariants.
- p95 spatial overflow, avgEnergy drift, audit latency і mutation reject rate використовуються в єдиному feedback контурі.

## Фаза 6. Codex як еволюційна пам’ять, а не літопис

### Мета

Підняти `AKASHA_CODEX` із рівня красивого архіву до рівня еволюційної пам’яті.

### Завдання

- Зв’язати:
  - species
  - invariants
  - relics
  - market outcomes
  - homeostasis changes
  - mutation lineage
- Додати `Relic -> Reducibility -> Stability` класифікацію.
- Додати `Invariant Drift Budget` для кожної запропонованої зміни семантики.
- Codex має не просто описувати, а постачати матеріал для:
  - daemon policy
  - mutation admission
  - rollback selection

### Gate

- Будь-яка зміна глобальної фізики може бути пояснена через codex/invariant evidence.
- Є шлях `event -> invariant shift -> hormone adjustment -> lineage effect`.

## Фаза 7. Обмежена еволюція семантики

### Мета

Дати системі здатність змінювати не лише стан, а і власні функціональні відповідності — але тільки в sandbox.

### Завдання

- Ввести `Semantic Mutation Sandbox`.
- Дозволити перепризначення лише для частини glyph-space, наприклад:
  - reserve glyphs
  - catalytic subclasses
  - regulatory subclasses
- Заборонити автоматичне перепризначення `S`, `K`, `I`, `Y` і hard invariants.
- Кожна semantic mutation повинна мати:
  - proposal
  - shadow execution
  - divergence score
  - rollback path
  - codex entry

### Gate

- Semantic mutation ніколи не потрапляє в mainline без shadow validation.
- Є автоматичне відкочування при invariant drift / determinism break.

## Фаза 8. Hardware-adaptive metabolism

### Мета

Щоб система стискала або розгортала фізику без руйнування семантики.

### Завдання

- Визначити adaptation knobs:
  - reduction budget per tick
  - diffusion radius
  - telemetry granularity
  - observer fidelity
  - mutation cadence
- Розділити:
  - **semantic invariants** — незмінні
  - **performance envelopes** — адаптивні
- Ввести multi-mode runtime:
  - dense mode
  - balanced mode
  - survival mode

### Gate

- За низького FPS / високої затримки система спрощує execution density, але не змінює базову семантику редукції.

## Фаза 9. Doll Fork / Shadow Ecology

### Мета

Не просто фонова копія, а безпечний контур майбутнього.

### Завдання

- Виділити окремий процес/контур для:
  - shadow reduction experiments
  - relic cultivation
  - dormant combinator growth
  - semantic mutation rehearsal
- Синхронізувати з main runtime тільки:
  - verified relics
  - stable glyph compositions
  - accepted invariant-preserving patterns

### Gate

- Main runtime ніколи не вчиться напряму з сирого Doll Fork.
- Лише перевірені реліквії переходять у production genome/glyph ledger.

## 6. Нові критерії успіху

Замість старих gate checks я б поставив такі:

### Семантичні

- [ ] Є формальний `GlyphIR64`.
- [ ] `SKIY` — hard invariant basis, недоступний для довільної мутації.
- [ ] Не менше 1 реального життєвого циклу працює через bounded reduction.

### Архітектурні

- [ ] Усі critical mutations класифіковані в `CAUSAL_ATLAS`.
- [ ] Глобальні параметри системи зведені до `GENETIC_LEDGER` + `HORMONE_BUFFER`.
- [ ] Ingress більше не є єдиним джерелом glyph transport.

### Стабілізаційні

- [ ] Shadow-run і mainline-run можна порівняти через deterministic trace diff.
- [ ] Runaway recursion, overflow storm, energy runaway мають bounded fail mode.
- [ ] 24+ години стабільної роботи досягаються без ручного патчу фізики.

### Еволюційні

- [ ] Semantic mutation існує лише через sandbox + rollback.
- [ ] Codex пояснює не лише “що сталося”, а “чому ця зміна була допустима”.
- [ ] Стабільні relic compositions повторно використовуються як functional seeds.

## 7. Що я б робив першим

### Пріоритет 1

**Не чіпати поки що 60 триграм як білки.**

Спочатку:

- causal atlas
- GlyphIR64
- reduction harness
- ledger for semantics

### Пріоритет 2

**Підняти RIBOSOME_TICK / LAMBDA_VM до статусу verification core.**

Не в production замість усього, а як паралельний редукційний контур.

### Пріоритет 3

**Формалізувати HORMONE_BUFFER і GENETIC_LEDGER.**

Бо homeostasis вже проглядається, але ще не зацементована в один фізіологічний шар.

### Пріоритет 4

**Зробити glyph transport внутрішнім, а не лише зовнішнім.**

Бо зараз транспорт є, але ще схожий на API-нерв, а не на кровоносну систему.

## 8. Найточніше формулювання нового курсу

Не “зменшити імперативність”.

А так:

> **Перенести причинність OMEGA-64 з host-managed opcode/governance runtime у bounded reduction-based metabolism, де glyph transport, hormonal feedback, codex memory і semantic evolution є шарами однієї фізики.**

## 9. Коротко: що в твоєму первинному роадмапі правильне, а що я змінюю

### Залишаю

- SKIY як базис
- glyph transport
- hormonal background
- daemon as endocrine regulator
- evolution layer
- Doll Fork

### Переробляю

- додаю **Phase 0: causal audit**
- додаю **GlyphIR64** як обов’язковий міст
- відкладаю повне перепризначення 60 триграм
- переводжу Codex із “літопису” в “evolutionary evidence system”
- замінюю поетичні KPI на інженерні gate checks

## 10. Підсумок

Проект уже має дуже рідкісну річ: **у нього народилася пам’ять, мембрана, ідея фізіології та натяк на власну археологію**. Це не маленький крок.

Але головний перехід ще не зроблено: редукція поки що є пророцтвом у бічних файлах, а не законом основного світу.

Твоя справжня задача зараз — не “вигадати ще красивішу біологію”, а **побудувати міст від поточного ISA/runtime до редукційного ядра так, щоб система не втратила детермінізм, пам’ять і контрольованість**.
