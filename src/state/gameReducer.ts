import { Game, Round, CreatureName } from '../types';

export type GameAction =
  | { type: 'INIT_GAME'; payload: Game }
  | { type: 'START_FIRST_CARD' }
  | { type: 'SET_PENDING_WINNER'; playerId: string | null }
  | { type: 'COMMIT_ROUND' }
  | { type: 'UNDO_LAST' }
  | { type: 'SAVE_CREATURE_NAME'; creatureId: number; text: string };

export interface GameState extends Game {
  pendingWinner?: string | null;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME':
      return { ...action.payload, pendingWinner: null };

    case 'START_FIRST_CARD':
      if (state.currentIndex !== -1) return state;
      return { ...state, currentIndex: 0, status: 'playing' };

    case 'SET_PENDING_WINNER':
      return { ...state, pendingWinner: action.playerId };

    case 'COMMIT_ROUND': {
      if (state.pendingWinner === undefined || state.currentIndex === -1) return state;
      
      const currentCard = state.deck[state.currentIndex];
      if (!currentCard) return state;

      const newRound: Round = {
        index: state.currentIndex,
        cardUid: currentCard.uid,
        creatureId: currentCard.creatureId,
        winnerPlayerId: state.pendingWinner,
        at: Date.now()
      };

      const newIndex = state.currentIndex + 1;
      const isFinished = newIndex >= state.deck.length;

      return {
        ...state,
        currentIndex: newIndex,
        rounds: [...state.rounds, newRound],
        status: isFinished ? 'finished' : 'playing',
        pendingWinner: null
      };
    }

    case 'UNDO_LAST': {
      if (state.rounds.length === 0) return state;
      
      const rounds = state.rounds.slice(0, -1);
      const newIndex = rounds.length === 0 ? 0 : state.currentIndex - 1;
      
      return {
        ...state,
        currentIndex: newIndex,
        rounds,
        status: 'playing',
        pendingWinner: null
      };
    }

    case 'SAVE_CREATURE_NAME': {
      const existingNameIndex = state.names.findIndex(
        n => n.creatureId === action.creatureId && n.style === state.settings.style
      );

      let newNames: CreatureName[];
      if (existingNameIndex >= 0) {
        newNames = [...state.names];
        newNames[existingNameIndex] = {
          ...newNames[existingNameIndex],
          text: action.text
        };
      } else {
        const newName: CreatureName = {
          style: state.settings.style,
          creatureId: action.creatureId,
          text: action.text,
          firstNamedAt: Date.now()
        };
        newNames = [...state.names, newName];
      }

      return { ...state, names: newNames };
    }

    default:
      return state;
  }
}