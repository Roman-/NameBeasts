import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { gameReducer, GameAction, GameState } from './gameReducer';
import { Game } from '../types';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

interface GameProviderProps {
  children: React.ReactNode;
  initialGame?: Game;
}

export function GameProvider({ children, initialGame }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGame || {} as GameState);

  // Persist game state to localStorage during gameplay
  useEffect(() => {
    if (state.status === 'playing' && state.id) {
      localStorage.setItem('nb:v1:resumeGame', JSON.stringify(state));
    } else if (state.status === 'finished') {
      localStorage.removeItem('nb:v1:resumeGame');
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}