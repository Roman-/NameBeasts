import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Settings } from '../pages/Settings';
import { Play } from '../pages/Play';
import { Finish } from '../pages/Finish';
import { GameProvider } from '../state/GameContext';

// Wrapper component for game-related routes that need GameContext
function GameRouteWrapper({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/play',
    element: (
      <GameRouteWrapper>
        <Play />
      </GameRouteWrapper>
    )
  },
  {
    path: '/finish',
    element: (
      <GameRouteWrapper>
        <Finish />
      </GameRouteWrapper>
    )
  }
]);