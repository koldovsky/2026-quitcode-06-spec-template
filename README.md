# Шаблон репо вимог PM: продуктовий контекст + OpenSpec

Стартовий репозиторій для **вимог** продукту. З нього PM створює своє публічне репо `<pm>/<team-slug>-spec` і веде
в ньому продуктовий контекст (`product/`) і специфікацію OpenSpec (`openspec/`). Коду, бази й деплою тут немає.

Кожен розробник команди робить **власну** реалізацію того самого продукту у своєму репо `<dev>/<team-slug>` (з
[шаблону проєкту](https://github.com/koldovsky/2026-quitcode-06-project-template)) і забирає вимоги звідси однією
командою агента `/spec-sync`. Питання й пропозиції до вимог розробники ставлять тут, в issues.

```text
 PM:          <pm>/<team-slug>-spec      main = поточні вимоги (product/ + openspec/specs/)
                   ▲                                   │
                   │ issues «Питання до специфікації»  │ /spec-sync у Claude Code чи Cursor
                   │                                   ▼
 Розробники:  <dev>/<team-slug>   у кожного своє репо і своя реалізація
```

Три правила:

1. **Поточні вимоги — те, що злито в `main` цього репо.** Не гілка, не відкритий PR і не повідомлення в чаті.
   Тегів і номерів версій немає: що змінилось і коли — у `product/CHANGELOG.md`.
2. **Розробники забирають вимоги командою `/spec-sync`** і руками їх не правлять.
3. **Питання й пропозиції до вимог — issues у цьому репо** (форма «Питання до специфікації»). Відповіді — там само,
   їх бачить уся команда.

Покрокова інструкція з поясненнями й доказами для оцінювання —
[`docs/walkthrough-pm.md`](https://github.com/koldovsky/2026-quitcode-06-specs-in-practice-hw/blob/main/docs/walkthrough-pm.md)
у репо домашки. Тут — короткий шлях.

| Що | Де в шаблоні |
|---|---|
| Продуктовий контекст | `product/` — `vision.md`, `glossary.md`, `roles.md`, `roadmap.md`, `decisions.md`, `CHANGELOG.md`, `denylist.txt` |
| Специфікація | `openspec/specs/` (поточні вимоги), `openspec/changes/` (зміни в роботі), `openspec/config.yaml` (контекст і правила формату для агента) |
| Перевірки | `npm run spec:validate`, `npm run spec:check` (`scripts/check-spec.mjs`), CI `.github/workflows/ci.yml` з одним job `spec` |
| Агенти | `AGENTS.md` (+ `CLAUDE.md` = `@AGENTS.md`); команди `/opsx:propose`, `/opsx:explore`, `/opsx:update`, `/opsx:archive` (і `/opsx:sync`, яку викликає archive); скіл `spec-review` — однаково в Claude Code і Cursor (у Cursor — `/opsx-propose` тощо) |
| Командна робота | форма issue «Питання до специфікації» (мітка `spec-question`), шаблон PR «Зміна вимог», `.coderabbit.yaml` |

## Перед початком

- Node 24 (`node -v`), Git, GitHub CLI (`gh`) — бажано.
- OpenSpec CLI **глобально** й тієї ж версії, що в `package.json`:
  `npm i -g @fission-ai/openspec@1.14.1` → `openspec --version` має показати `1.14.1`. Команди `/opsx:*` і скіли
  `openspec-*` викликають просто `openspec`; скрипти `npm run spec:*` і CI беруть версію з devDependencies.
  Телеметрію вимикає `openspec config set telemetry.enabled false`.
- Claude Code або Cursor.

## Шлях PM

Дні календарні; день 0 — день заняття, «кінець дня N» — 23:59 за Києвом. Для WS6: день 0 — 13.10, кінець дня 2 —
15.10, дня 4 — 17.10, дня 7 — 20.10.

1. **Репо вимог (день 0).** На цьому шаблоні **Use this template → Create a new repository**: Owner — ваш особистий
   акаунт, назва `<team-slug>-spec`, **Public** (одразу й назавжди: `/spec-sync` забирає `main` без прав доступу, а
   форму питань відкриває будь-хто з акаунтом GitHub). Або `gh repo create <team-slug>-spec --public --template
   koldovsky/2026-quitcode-06-spec-template --clone`. Далі `npm ci`, `npm run spec:validate`, `npm run spec:check`.
   Issues мають бути увімкнені (Settings → General → Features; у нового репо так за замовчуванням).
2. **Мітка, denylist, CodeRabbit, чат (день 0).**
   - Мітка `spec-question`: Issues → Labels → **New label** (точну назву кнопки перевірте в інтерфейсі) або
     `gh label create spec-question --force --repo <pm>/<team-slug>-spec --description "Питання до специфікації"`.
     Форма ставить мітку, лише якщо вона вже є в репо.
   - Справжні назви клієнта — **лише** в локальному `product/denylist.local.txt` (у `.gitignore`; `npm run spec:check`
     читає його, але значень не друкує) і, за бажанням, у секреті репозиторію `SPEC_DENYLIST` (Settings → Secrets and
     variables → Actions, через кому). `/spec-sync` локальний файл не переносить — надішліть список кожному
     розробнику особистим повідомленням.
   - CodeRabbit: встановіть застосунок на це репо. У публічних репо з < 10 зірок рев'ю запускає окремий коментар
     `@coderabbitai review` у PR.
   - У чат команди — посилання на репо й на форму питань `https://github.com/<pm>/<team-slug>-spec/issues/new/choose`.
3. **Продуктовий контекст (дні 0–1).** Гілка `product/context` → заповніть `product/vision.md`, `glossary.md`,
   `roles.md` (ролі й матриця прав), `roadmap.md` і рядок `Продукт:` у `openspec/config.yaml` → `npm run spec:check` →
   PR → `@coderabbitai review` → зелений `spec` → merge.
4. **Зустріч команди (дні 0–1).** Ви організовуєте перший раунд питань до брифу (15–20 хв, можна асинхронно в
   чаті). Відповіді — у вимоги, відкрите — в Open questions першої зміни.
5. **Перший зріз (дні 1–2).** Гілка `spec/add-<зріз>` → у Claude Code `/opsx:propose <опис зрізу>` (у Cursor
   `/opsx-propose`). Додайте до запиту «пиши лише proposal.md і specs/, без design.md і tasks.md»: як реалізувати,
   кожен розробник вирішує у своєму репо. Якщо агент їх усе ж створив — видаліть обидва файли до коміту. Формат
   (EARS з `SHALL`, `#### Scenario: AC-<AREA>-<NN> …`) агент бере з `openspec/config.yaml`; кожен рядок прочитайте
   й виправте самі.
6. **Перевірка.** `npx openspec validate add-<зріз> --strict`, `npm run spec:validate`, `npm run spec:check`, потім
   скіл `spec-review` («Запусти скіл spec-review для зміни add-<зріз>»).
7. **Перші вимоги в `main` — до кінця дня 2.** PR «Зміна вимог» (опис — за шаблоном, з розділом `## spec-review`) →
   `@coderabbitai review` → **у тій самій гілці, до merge:** `npx openspec archive add-<зріз> -y` і запис у
   `product/CHANGELOG.md` з датою (формат — у коментарі у файлі) → `npm run spec:validate`, `npm run spec:check` →
   push → зелений `spec` → merge → у чат команди «вимоги оновлено» з датою й переліком AC.
   Перевірка: на `main` у `openspec/specs/` є тека вашої можливості, а в `openspec/changes/` немає теки зміни.
8. **Питання й уточнення (дні 2–4, merge — до кінця дня 4).** Відповідайте на issues `spec-question` коментарем
   (варіант і чому), кожне рішення — рядок у `product/decisions.md`. Якщо відповідь змінює поведінку — гілка
   `spec/clarify-<зріз>`, зміна з `## MODIFIED Requirements` (повний блок вимоги, AC ID незмінні) і/або
   `## ADDED Requirements` (нові ID), `npx openspec show clarify-<зріз> --diff`, далі як у кроках 6–7; у PR —
   `Closes #N` для питань, на які відповідає зміна. Після merge — «вимоги оновлено» з MODIFIED / ADDED у чат.
9. **Нотатка PM (дні 6–7).** Порівняння реалізацій розробників: щонайменше 3 місця, де вимогу прочитали чи
   реалізували по-різному, з посиланнями на їхні репо, issues і рядки коду. Пишеться у файлі здачі домашки, **не** в
   `product/`: усю теку `product/` розробники копіюють собі.

Усе в `main` — лише через PR, навіть без ruleset-у: строки рахуємо за часом **merge** PR у `main`. Approve не
потрібен — репо ваше; зливайте після зеленого `spec` (**Squash and merge** або merge commit).

## Як розробники отримують вимоги

У своєму репо розробник запускає в Claude Code чи Cursor `/spec-sync` (перший раз — з адресою вашого репо). Команда:

- бере свіжий `main` цього репо звичайним `git fetch` — тому репо має бути публічним, а гілка — саме `main`;
- замінює в репо розробника теки `product/` і `openspec/specs/` на ваші — **лише їх**: незаархівована зміна в
  `openspec/changes/` до розробника не доходить, а `product/denylist.local.txt` (не в git) — теж;
- показує, які AC додано, змінено чи прибрано (порівнює за AC ID), і запам'ятовує коміт ваших вимог;
- відкриває в репо розробника PR «Оновлення вимог» — після його «так».

Що з цього випливає для вас:

- **Archive — до merge.** Без нього в `openspec/specs/` нічого не з'явиться, і розробники не отримають жодного AC.
- **AC ID стабільні.** Змінений AC зберігає ID (MODIFIED), прибраний — у REMOVED з причиною; перейменований чи
  перевикористаний ID для розробників виглядає як «один AC прибрано, інший додано».
- **Історію `main` не переписуємо.** Жодного force-push, amend злитих комітів чи видалення комітів: розробники
  фіксують коміт, з якого синхронізувались. Помилка — новий PR і новий запис у CHANGELOG.
- **Оновили `main` — напишіть у чат «вимоги оновлено».** Інакше ніхто не знає, що пора запускати `/spec-sync`.

## Питання й пропозиції розробників

- Розробники створюють issues **лише через вебформу** `https://github.com/<pm>/<team-slug>-spec/issues/new/choose`:
  без прав на запис мітку `spec-question` ставить саме форма, а `gh issue create --label` її мовчки не поставить.
  Issue без мітки позначте самі (Labels → `spec-question`).
- Пропозиції змінити вимогу приходять тією самою формою. Прийняли — внесіть у зміну уточнень і напишіть в issue,
  яким AC це стало.
- Дублікат закрийте коментарем «Дубль #N — відповідь там»; у `decisions.md` — один рядок з усіма номерами.
- Права запису розробникам не потрібні: репо публічне, коментувати issues і PR може будь-хто з акаунтом GitHub.

## Чого не робити

- Не пишіть тут код, `design.md` чи `tasks.md`: реалізація й план реалізації — у репо кожного розробника.
- Не редагуйте `openspec/specs/` вручну — лише через `npx openspec archive <id> -y`.
- Не зливайте зміну без archive і без запису в `product/CHANGELOG.md`.
- Не перенумеровуйте й не перевикористовуйте AC ID.
- Не переписуйте історію `main` і не пуште в `main` напряму.
- Не пишіть справжні назви клієнта, імена людей і їхні дані ні у файли, ні в issues, PR чи коміти: репо публічне, а
  `product/` розходиться по репо всіх розробників. Справжні назви — лише в `product/denylist.local.txt` і `SPEC_DENYLIST`.
- Не робіть репо приватним і не перейменовуйте гілку `main`: `/spec-sync` розробників перестане працювати.

## Перевірки

| Команда | Що перевіряє |
|---|---|
| `npm run spec:validate` | `openspec validate --all --strict` — структура специфікацій і змін |
| `npm run spec:check` | AC ID на початку кожного `#### Scenario:` (схожий на ID, але з кириличною літерою чи трьома цифрами — з підказкою); рівень заголовка сценарію; унікальність AC ID в `openspec/specs` і після archive кожної активної зміни; у кожній зміні — `proposal.md` з усіма сімома розділами в порядку правил; denylist (за початком слова, тож ловить відмінки; фраза — і через перенесення рядка) у `product/`, `openspec/`, `README.md`, `AGENTS.md`, `CLAUDE.md`; немає «бродячого» `product/denylist.local*` під іншим іменем |
| CI `spec` | обидві команди вище на кожен PR і push у `main`; секрет `SPEC_DENYLIST` — якщо задано |
| CodeRabbit | порадник: межі PR (лише `product/` і `openspec/`, без `design.md` і `tasks.md`), archive і запис у CHANGELOG, якість специфікації, анонімізація |

## Оновлення шаблону

Виправлення шаблону викладач оголошує в чаті курсу з SHA звичайного (не merge) коміту. Не `git merge` шаблону:
«Use this template» починає нову історію, і merge дає конфлікт у кожному файлі, що відрізняється. Натомість
(remote — один раз) `git remote add template https://github.com/koldovsky/2026-quitcode-06-spec-template.git` →
`git fetch template` → `git switch main && git pull` → `git switch -c template/<коротко>` → `git cherry-pick <sha>` →
`npm ci && npm run spec:validate && npm run spec:check` → `git push -u origin template/<коротко>` → PR з позначкою
«Оновлення шаблону» → зелений `spec` → merge. Якщо коміт не чіпає `product/` і `openspec/specs/`, вимоги не
змінились: запис у CHANGELOG і повідомлення «вимоги оновлено» не потрібні.

| Дата | SHA | Що виправлено |
|---|---|---|
| — | — | поки немає |

## Як цей шаблон зібрано

Повторюваний рецепт (Git Bash / macOS / Linux; Node 24, npm 11) — щоб оновити шаблон на нові версії або зібрати його
заново. Файли, написані вручну, беруться з
[шаблону проєкту](https://github.com/koldovsky/2026-quitcode-06-project-template) й адаптуються під репо вимог.

```bash
mkdir 2026-quitcode-06-spec-template && cd 2026-quitcode-06-spec-template
git init -b main      # гілка саме main: її забирає /spec-sync і на неї налаштовано CI

# 1. package.json — вручну: name, "private": true, "license": "MIT", "engines": { "node": "24.x" } і два скрипти:
#    "spec:validate": "openspec validate --all --strict", "spec:check": "node scripts/check-spec.mjs"; потім
npm i -D -E @fission-ai/openspec@1.14.1

# 2. OpenSpec: глобальний CLI тієї ж версії, профіль custom (глобальний конфіг цієї машини) з командами для PM
npm i -g @fission-ai/openspec@1.14.1 && openspec --version   # 1.14.1
export OPENSPEC_TELEMETRY=0
npx openspec config set profile custom
npx openspec config set workflows '["propose","explore","update","sync","archive"]'
npx openspec init --tools claude,cursor --language Ukrainian --profile custom
npx openspec update
# openspec/config.yaml: context + rules (кожен пункт у лапках; design і tasks — «пропусти цей артефакт»);
# порожні openspec/specs, openspec/changes, openspec/changes/archive з .gitkeep

# 3. Перенести з шаблону проєкту й адаптувати під PM:
#   scripts/check-spec.mjs + scripts/lib/spec-lib.mjs (лише те, що імпортує check-spec), product/**,
#   .claude/settings.json (лише deny .env* і product/denylist.local*), .claude/skills/spec-review/** (+ таксономія
#   неоднозначностей у references/), .cursorignore, .github/** (форма питань, шаблон PR, ci.yml з job spec),
#   .coderabbit.yaml, AGENTS.md, CLAUDE.md, .gitignore, .gitattributes, LICENSE

# 4. Перевірити
npm ci && npm run spec:validate && npm run spec:check
```

У Windows PowerShell 5.1 лапки всередині JSON треба екранувати:
`npx openspec config set workflows '[\"propose\",\"explore\",\"update\",\"sync\",\"archive\"]'`
(або інтерактивно: `npx openspec config profile`). Змінна середовища: `$env:OPENSPEC_TELEMETRY = "0"`.
Профіль OpenSpec зберігається на машині, а не в репозиторії, тому згенеровані `.claude/` і `.cursor/` закомічені.
`/opsx:sync` лишаємо, бо `/opsx:archive` викликає його всередині; `/opsx:apply` і `/opsx:verify` — для реалізації,
їх тут немає.

## Ліцензія

MIT — див. [LICENSE](LICENSE): шаблон можна вільно брати для власних і клієнтських проєктів. Таксономію
неоднозначностей у `.claude/skills/spec-review/references/ambiguity-taxonomy.md` адаптовано з
[GitHub Spec Kit](https://github.com/github/spec-kit) (MIT, Copyright GitHub, Inc.).
