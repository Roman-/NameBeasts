# NameBeasts! 🎮

A children-friendly React web app where players invent and recall names for recurring creature cards. Adults (or the oldest player) act as the facilitator and tap who earned each point.

## Features

- **Landing → Settings → Game → Finish flow** using React Router
- **Fruitfolk art style** with 8 creature images
- **Customizable deck** with 2-8 distinct creatures, each duplicated 1-12 times
- **Name Tracker** to record and reveal creature names
- **Smooth animations** with animate.css
- **Local storage persistence** for settings, players, and game state
- **Resume functionality** if the tab refreshes mid-game
- **Accessible** with keyboard navigation and screen reader support

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router DOM** for navigation
- **Animate.css** for transitions
- **CSS Modules** for component styling
- **Tailwind CSS** for utility classes
- **Nanoid** for unique ID generation

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Game Rules

- On each card, invent or recall the creature's name
- Tap the player who named it first (or "No one")
- Each card is worth **1 point**. Highest score wins
- Some creatures repeat—try to remember their names!

## Project Structure

```
src/
├── app/                 # App setup and routing
├── components/          # Reusable UI components
├── pages/              # Route components
├── state/              # Game state management
├── data/               # Static data (styles manifest)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles
├── types.ts            # TypeScript type definitions
└── strings.ts          # UI text (ready for i18n)
```

## Adding New Art Styles

1. Add images to `public/creatures/[StyleName]/1.jpg` through `N.jpg`
2. Update `src/data/styles.ts` with the new style definition
3. Update the `StyleId` type in `src/types.ts`

## Local Storage Keys

- `nb:v1:settings` - Last used game settings
- `nb:v1:pastPlayers` - Previously used player names
- `nb:v1:resumeGame` - Current game state (cleared on finish)

## Keyboard Shortcuts (Play Screen)

- **1-9**: Select player 1-9
- **0**: Select "No one"
- **Enter**: Proceed to next card