import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameContext } from '../state/GameContext';
import { CardFrame } from '../components/CardFrame/CardFrame';
import { PlayerChips } from '../components/PlayerChips/PlayerChips';
import { NameTracker } from '../components/NameTracker/NameTracker';
import { STR } from '../strings';
import { Game } from '../types';

export function Play() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useGameContext();
  const [animationClass, setAnimationClass] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize game from location state or localStorage
  useEffect(() => {
    const gameFromState = location.state?.game as Game;
    const resumeGameStr = localStorage.getItem('nb:v1:resumeGame');
    
    if (gameFromState) {
      dispatch({ type: 'INIT_GAME', payload: gameFromState });
    } else if (resumeGameStr) {
      try {
        const resumeGame = JSON.parse(resumeGameStr) as Game;
        dispatch({ type: 'INIT_GAME', payload: resumeGame });
      } catch (error) {
        console.error('Failed to parse resume game:', error);
        navigate('/settings');
      }
    } else {
      navigate('/settings');
    }
  }, [location.state, dispatch, navigate]);

  // Navigate to finish when game is complete
  useEffect(() => {
    if (state.status === 'finished') {
      navigate('/finish');
    }
  }, [state.status, navigate]);

  const currentCard = state.currentIndex >= 0 ? state.deck?.[state.currentIndex] : undefined;
  const isFirstDraw = state.currentIndex === -1;
  const canUndo = state.rounds && state.rounds.length > 0;
  const canProceed = isFirstDraw || state.pendingWinner !== undefined;

  const handlePlayerSelect = (playerId: string | null) => {
    dispatch({ type: 'SET_PENDING_WINNER', playerId });
  };

  const handleNext = () => {
    if (isFirstDraw) {
      dispatch({ type: 'START_FIRST_CARD' });
      setAnimationClass('animate__zoomIn');
      return;
    }

    if (!canProceed) return;

    setIsAnimating(true);
    setAnimationClass('animate__fadeOut');
  };

  const handleAnimationEnd = () => {
    if (animationClass === 'animate__fadeOut') {
      dispatch({ type: 'COMMIT_ROUND' });
      setAnimationClass('animate__zoomIn');
    } else if (animationClass === 'animate__zoomIn') {
      setAnimationClass('');
      setIsAnimating(false);
    }
  };

  const handleUndo = () => {
    if (!canUndo) return;
    dispatch({ type: 'UNDO_LAST' });
    setAnimationClass('animate__zoomIn');
  };

  const handleSaveName = (creatureId: number, text: string) => {
    dispatch({ type: 'SAVE_CREATURE_NAME', creatureId, text });
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return;

      const key = e.key;
      if (key >= '1' && key <= '9') {
        const playerIndex = parseInt(key) - 1;
        if (state.settings?.players && playerIndex < state.settings.players.length) {
          handlePlayerSelect(state.settings.players[playerIndex].id);
        }
      } else if (key === '0') {
        handlePlayerSelect(null);
      } else if (key === 'Enter' && canProceed) {
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAnimating, canProceed, state.settings?.players, handlePlayerSelect, handleNext]);

  if (!state.settings) {
    return <div>Loading...</div>;
  }

  const progress = state.deck ? `${Math.max(0, state.currentIndex)} of ${state.deck.length}` : '';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="text-center text-sm text-gray-600 mb-4">
          Card {progress}
        </div>

        {/* Hint */}
        {currentCard && (
          <div className="text-center text-lg font-medium text-gray-800 mb-4">
            {STR.play.hint}
          </div>
        )}

        {/* Card */}
        <div className="mb-6">
          <CardFrame 
            card={currentCard}
            animationClass={animationClass}
            onAnimationEnd={handleAnimationEnd}
          />
        </div>

        {/* Name Tracker */}
        {currentCard && (
          <NameTracker
            creatureId={currentCard.creatureId}
            style={currentCard.style}
            existingNames={state.names || []}
            onSaveName={handleSaveName}
          />
        )}

        {/* Player Selection */}
        {!isFirstDraw && (
          <PlayerChips
            players={state.settings.players}
            selectedPlayerId={state.pendingWinner}
            onPlayerSelect={handlePlayerSelect}
          />
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4 mt-6">
          {canUndo && (
            <button
              onClick={handleUndo}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isAnimating}
            >
              {STR.play.undo}
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed || isAnimating}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isFirstDraw ? STR.play.startRound : STR.play.next}
          </button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Keyboard: 1-9 for players, 0 for "No one", Enter to proceed</p>
        </div>
      </div>
    </div>
  );
}