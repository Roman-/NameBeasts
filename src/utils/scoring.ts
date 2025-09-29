import { Game } from '../types';

export function scores(game: Game): Record<string, number> {
  const s: Record<string, number> = {};
  game.settings.players.forEach(p => (s[p.id] = 0));
  game.rounds.forEach(r => { 
    if (r.winnerPlayerId && s[r.winnerPlayerId] !== undefined) {
      s[r.winnerPlayerId]++; 
    }
  });
  return s;
}