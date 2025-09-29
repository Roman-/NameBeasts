# SPEC.md

## Project

**Name:** NameBeasts!
**Description:** A children-friendly React web app where players invent and recall names for recurring creature cards. Adults (or the oldest player) act as the facilitator and tap who earned each point.

---

## MVP scope (what ships)

* Landing → Settings → Game → Finish flow using React Router.
* One built‑in art style: **Fruitfolk** (8 images). Assets are in `public/creatures/Fruitfolk/1.jpg..8.jpg`.
* Deck built from `N` distinct creatures (2–8), each duplicated `D` times (default `N=6`, `D=4`).
* On each card: facilitator chooses which player got it (or “No one”). Next card is locked until a choice is made.
* Optional (but in‑MVP) **Name Tracker**: on first sight of a creature, facilitator can record the invented name; on repeats, a “Reveal name” control shows the saved name after scoring.
* Animate transitions with **animate.css**: fade out current card, then sudden appear of next card.
* Settings + players + style persisted to localStorage. Also persist **past unique player names** for quick add.
* Finish screen shows scoreboard.
* Resume an in‑progress game from localStorage if the tab refreshes.

Out of scope for MVP: online play, timers, sound effects, multiple rounds, localization UI (strings are centralized for future i18n but only EN provided), admin panel, server backend.

---

## Tech & structure

* **Stack:** React + TypeScript + Vite, CSS Modules.
* **Routing:** `react-router-dom` (`/`, `/settings`, `/play`, `/finish`).
* **Animations:** `animate.css` (via npm import).
* **State:** Local component state + **GameContext** (Reducer) scoped to gameplay screens.
* **Persistence:** `localStorage`.

### Folder layout (minimal)

```
namebeasts/
├── public/
│   └── creatures/
│       └── Fruitfolk/
│           ├── 1.jpg
│           ├── 2.jpg
│           └── ... 8.jpg
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── CardFrame/
│   │   │   ├── CardFrame.tsx
│   │   │   └── CardFrame.module.css
│   │   ├── PlayerChips/
│   │   │   ├── PlayerChips.tsx
│   │   │   └── PlayerChips.module.css
│   │   ├── NumberField.tsx
│   │   ├── StylePicker/
│   │   │   ├── StylePicker.tsx
│   │   │   └── StylePicker.module.css
│   │   ├── NameTracker/
│   │   │   ├── NameTracker.tsx
│   │   │   └── NameTracker.module.css
│   │   └── Modal/
│   │       ├── Modal.tsx
│   │       └── Modal.module.css
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Settings.tsx
│   │   ├── Play.tsx
│   │   └── Finish.tsx
│   ├── state/
│   │   ├── GameContext.tsx
│   │   └── gameReducer.ts
│   ├── data/
│   │   └── styles.ts           // style manifest
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── shuffle.ts
│   │   └── ids.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── animate.css         // imported from package
│   ├── types.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
└── tsconfig.json
```

---

## Data contracts & types

```ts
// types.ts
export type StyleId = 'Fruitfolk';     // extensible

export type Settings = {
  style: StyleId;                       // default 'Fruitfolk'
  distinctCreatures: number;            // 2..8 (clamped to style's imageCount)
  duplicatesPerCreature: number;        // 1..12 (soft max), default 4
  players: Player[];
};

export type Player = { id: string; name: string };

export type Card = {
  uid: string;                          // unique per deck card
  creatureId: number;                   // 1..N within current style
  style: StyleId;
};

export type Round = {
  index: number;                        // 0..deck.length-1
  cardUid: string;
  creatureId: number;
  winnerPlayerId: string | null;        // null = "No one"
  at: number;                           // timestamp
};

export type CreatureName = {
  style: StyleId;
  creatureId: number;
  text: string;                         // invented name
  firstNamedAt: number;
};

export type Game = {
  id: string;                           // e.g., nanoid
  settings: Settings;
  deck: Card[];                         // shuffled
  currentIndex: number;                 // -1 before first draw
  rounds: Round[];                      // made choices
  names: CreatureName[];                // optional saved names
  status: 'ready' | 'playing' | 'finished';
};
```

---

## LocalStorage keys

* `nb:v1:settings` → `Settings` (last used, for prefill).
* `nb:v1:pastPlayers` → `string[]` unique player names (most recent first, cap 30).
* `nb:v1:resumeGame` → `Game` (if a game is mid-play). Cleared on finish/reset.
* `nb:v1:lastStyle` → `StyleId` (redundant with settings but quick access).

---

## Style manifest (extensible)

```ts
// data/styles.ts
export const STYLES = {
  Fruitfolk: {
    id: 'Fruitfolk' as const,
    label: 'Fruitfolk',
    imageCount: 8,
    publicPath: '/creatures/Fruitfolk',
    preview: '/creatures/Fruitfolk/1.jpg'
  }
};
export type StyleMeta = typeof STYLES[StyleId];
```

---

## Deck construction

1. Clamp `distinctCreatures` to `[2, min(8, style.imageCount)]`.
2. Clamp `duplicatesPerCreature` to `[1, 12]`. If `distinct * duplicates > 200`, reduce `duplicates` until ≤ 200 (UX guard).
3. Build `cards = []`. For `creatureId` in `1..distinct` push `duplicates` copies `{ uid, creatureId, style }`.
4. Shuffle in-place (Fisher–Yates).
5. Preload images for the selected style and creature range (create Image objects).

**Total cards label** on Settings: `distinct * duplicates`.

---

## Game flow (state machine)

* **Init**: From Settings, create `Game` with `currentIndex = -1`, `status = 'ready'`. Save to `nb:v1:resumeGame`.
* **First draw**: On Play screen, if `currentIndex === -1`, “Start Round” button draws card 0 (no choice required beforehand).
* **Per turn**: Show current card. Display hint “Name this creature”.

  * **Selection**: Buttons for each player + “No one”. Selecting one enables **Next**.
  * **Name Tracker** (optional):

    * If first time this `creatureId` is seen and no recorded name, show inline input with “Save name” (or “Skip”).
    * On repeats, show a “Reveal name” pill; tapping reveals the saved name below the card (after scoring is fine; no auto-checking).
* **Next**:

  * Apply `animate__fadeOut` to current card container. After animation end (e.g., 300ms), increment `currentIndex`, append `Round` to `rounds`, then apply appear animation to the next card.
* **Finish**: When `currentIndex` reaches `deck.length - 1` and Next is committed, set `status = 'finished'`, route to `/finish`, clear `nb:v1:resumeGame`.

**Undo last** (quality-of-life): One-button to revert the previous selection while in `/play` (disabled at `currentIndex < 0`). Pops last `Round`, decrements `currentIndex`, brings back previous card with appear animation. (Optional but recommended; small footprint.)

---

## Screens & components

### Landing (`/`)

* Short rules blurb (see “Rules copy” below).
* Primary action: **New game** → `/settings`.
* Secondary (only if a resumable game exists): **Resume game** → `/play`.

### Settings (`/settings`)

Controls:

* **Distinct creatures**: stepper (2–8). Default 6. Live-updates Total label.
* **Duplicates per creature**: stepper (1–12). Default 4. Live-updates Total label.
* **Total cards** (read-only label).
* **Players**:

  * List of text fields; defaults: “Player 1”, “Player 2”.
  * “+ Add player” button (max 8 players).
  * Trash icon per row to remove. Cannot remove last remaining player (must have ≥1 player; solo play allowed).
  * **Past players** chip list (from `nb:v1:pastPlayers`); clicking a chip appends that name if not already present.
* **Styles**:

  * Button: **Choose style** → modal.
  * **StylePicker modal**: shows styles as tabs (only Fruitfolk for MVP). Below, show all images (1..8) as thumbnails for the active style to satisfy “display all images at once”. Include “Use this style” button.
* Footer:

  * Secondary: **Reset to defaults** (restores default settings).
  * Primary: **Start!** → initializes deck + GameContext, routes to `/play`, persists `nb:v1:settings`, updates `nb:v1:pastPlayers` with any new unique names.

Validation:

* Clamp values; show unobtrusive warning if `Total > 200`: “Large decks can be slow; consider fewer duplicates.”

### Play (`/play`)

Layout (mobile-first):

* **Top hint**: If there is a card drawn, show “Name this creature”.
* **CardFrame** (fixed aspect ratio, e.g., 3:4):

  * If `currentIndex === -1`: placeholder box with dashed border and centered gray text “No cards”.
  * Else: bordered image from `/creatures/{style}/{creatureId}.jpg` with `animate__animated` base class.

    * Out animation: `animate__fadeOut` with 300ms.
    * In animation: `animate__zoomIn` with 200ms (“sudden”).
* **NameTracker** (optional UX):

  * First sight & no name saved: collapsed bar “Save a name?” → input + Save/Skip.
  * Repeat sight with saved name: pill “Reveal name” → shows name under card (aria-live polite).
* **PlayerChips**:

  * Row of buttons with player names. Single-select radio-like behavior. Rightmost chip: **No one**.
  * The selected chip highlights and sets `pendingWinner`.
* **Controls**:

  * **Next** primary button; disabled unless `pendingWinner` is selected (except on first draw where caption is **Start Round** and always enabled).
  * **Undo last** text button (disabled if no past round).
* **Progress**: “Card X of Y”.

Keyboard affordances (desktop):

* `1..9` select player N; `0` selects “No one”.
* `Enter` triggers Next if enabled.
* Focus ring visible.

### Finish (`/finish`)

* **Scoreboard** (descending by score; ties break by name):

  * `Player – Score` list.
  * “Cards won” total equals number of rounds with a player winner.
* Actions:

  * **Play again** → `/settings` (prefilled last settings).
  * **Review names** (optional) → modal listing each creatureId with saved name (if any).

---

## Rules copy (landing, concise)

* On each card, invent or recall the creature’s name.
* Tap the player who named it first (or “No one”).
* Each card is worth **1 point**. Highest score wins.
* Some creatures repeat—try to remember their names!

---

## Reducer actions (GameContext)

```ts
// gameReducer.ts
type Action =
  | { type: 'INIT_GAME'; payload: Game }                  // from Settings
  | { type: 'START_FIRST_CARD' }                          // sets currentIndex=0
  | { type: 'SET_PENDING_WINNER'; playerId: string | null }
  | { type: 'COMMIT_ROUND' }                              // writes Round for current card, advances index or finishes
  | { type: 'UNDO_LAST' }
  | { type: 'SAVE_CREATURE_NAME'; creatureId: number; text: string };

```

`COMMIT_ROUND` persists to `nb:v1:resumeGame` after each state change while playing.

---

## Scoring

* 1 point per round where `winnerPlayerId` is a valid player id.
* “No one” (null) yields no points.
* Solo play (1 player) is allowed; scoring still increments when that player is chosen.

---

## Animations (animate.css mapping)

* Apply `animate__animated` to the image container.
* **Out:** `animate__fadeOut` (`animation-duration: 300ms`).
* **In:** `animate__zoomIn` (`animation-duration: 200ms`).
* Wait for `animationend` before swapping cards to avoid overlap.
* Use `prefers-reduced-motion` to disable animations for accessibility.

---

## Accessibility

* All interactive elements reachable via keyboard; visible focus.
* Buttons have `aria-label`s (e.g., “Player: Alice”, “No one”, “Next card”).
* Placeholder “No cards” is announced by screen readers.
* Name reveal uses `aria-live="polite"`.
* Respect `prefers-reduced-motion`.
* Color choices meet WCAG AA for contrast.

---

## Error handling & edge cases

* **Missing image:** show a neutral illustration box with text “Image not found” and still allow scoring.
* **Settings bounds:** values clamped; if `distinct > available`, auto-reduce to `available`.
* **Large deck:** if `total > 200`, warn; allow anyway.
* **Duplicate player names:** allowed but discouraged; visual nudge “Names are identical”.
* **Deleting players:** if you remove a player during Settings, no impact on past storage; in Play, player list is fixed.
* **Refresh mid-game:** auto-resume from `nb:v1:resumeGame` (route guard sends user to `/play` with dialog “Resumed game in progress”).

---

## Persistence rules

* On **Start!**, save `nb:v1:settings`, update `nb:v1:pastPlayers` with any new names (dedup, trim, cap 30).
* During gameplay, after each round and name save, write `nb:v1:resumeGame`.
* On Finish or explicit Reset, remove `nb:v1:resumeGame`.

---

## Styling guidelines

* Use CSS Modules with a small design system: spacing scale (4px multiples), radius (8px), shadow for CardFrame.
* CardFrame aspect ratio 3:4; max width 420px on mobile, 560px on desktop; centered.
* PlayerChips wrap on small screens.

---

## Testing (minimal)

* **Unit:** `shuffle.ts` produces permutations; deck length matches `N*D`; clamp logic works.
* **Reducer:** INIT/START/COMMIT/UNDO transitions; finish detection.
* **Component:** Next button disabled state; first draw behavior.

---

## Build & dependency notes

* Install: `react`, `react-dom`, `react-router-dom`, `animate.css`, `nanoid` (for ids).
* Import animate.css once in `App.tsx`.

---

## UI copy (centralized)

Create a `strings.ts` to store all visible text (EN), e.g.:

```ts
export const STR = {
  appName: 'NameBeasts!',
  landingBlurb: 'Invent and remember names for mysterious creatures.',
  newGame: 'New game',
  resumeGame: 'Resume game',
  settings: {
    title: 'Game settings',
    distinctCreatures: 'Different creatures',
    duplicatesPerCreature: 'Copies of each creature',
    totalCards: 'Total cards',
    players: 'Players',
    addPlayer: 'Add player',
    pastPlayers: 'Past players',
    chooseStyle: 'Choose style',
    useThisStyle: 'Use this style',
    resetDefaults: 'Reset to defaults',
    start: 'Start!'
  },
  play: {
    startRound: 'Start Round',
    hint: 'Name this creature',
    noOne: 'No one',
    next: 'Next',
    undo: 'Undo last',
    revealName: 'Reveal name',
    saveAName: 'Save a name?',
    save: 'Save',
    skip: 'Skip',
    progress: (i: number, total: number) => `Card ${i} of ${total}`,
    noCards: 'No cards'
  },
  finish: {
    title: 'Scores',
    playAgain: 'Play again',
    reviewNames: 'Review names'
  }
};
```

---

## Minimal algorithms

**Shuffle (Fisher–Yates):**

```ts
export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

**Score compute:**

```ts
export function scores(game: Game): Record<string, number> {
  const s: Record<string, number> = {};
  game.settings.players.forEach(p => (s[p.id] = 0));
  game.rounds.forEach(r => { if (r.winnerPlayerId) s[r.winnerPlayerId]++; });
  return s;
}
```

---

## Route guards

* Visiting `/play` without an active game → redirect to `/settings`.
* Visiting `/finish` without finished game → redirect to `/settings`.

---

## Definition of Done (MVP)

* ✅ Can configure settings (N, D, players), pick Fruitfolk, see total cards.
* ✅ Game deals cards with proper animations; Next locked until a selection.
* ✅ Optional name recording & reveal works.
* ✅ Finish shows correct scores; “Play again” resets flow.
* ✅ All settings and past players persist; game auto-resumes on refresh.
* ✅ Accessible, responsive, and handles missing assets gracefully.

---

## Future-ready (not required now)

* Additional styles via `styles.ts` manifest.
* “Shared point” mode (split point between two players).
* Timed rounds; streak bonuses.
* Stats: per-creature recall rates.
* Localization; service worker for offline.

---
