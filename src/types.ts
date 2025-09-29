// types.ts
export type StyleId = 'Fruitfolk';     // extensible

export type Settings = {
  style: StyleId;                       // default 'Fruitfolk'
  distinctCreatures: number;            // 2..8 (clamped to style's imageCount)
  duplicatesPerCreature: number;        // 1..12 (soft max), default 4
  players: Player[];
};

export type Player = {
  id: string;
  name: string;
  avatar: string;
  colorId: string;
};

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

export type Game = {
  id: string;                           // e.g., nanoid
  settings: Settings;
  deck: Card[];                         // shuffled
  currentIndex: number;                 // -1 before first draw
  rounds: Round[];                      // made choices
  status: 'ready' | 'playing' | 'finished';
};