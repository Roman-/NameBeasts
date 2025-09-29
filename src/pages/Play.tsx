import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGameContext } from '../state/GameContext';
import { CardFrame } from '../components/CardFrame/CardFrame';
import { PlayerChips } from '../components/PlayerChips/PlayerChips';
import { STR } from '../strings';
import { Game } from '../types';
import { useNavbar } from '../state/NavbarContext';

export function Play() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useGameContext();
  const { setActions } = useNavbar();
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

  const handlePlayerSelect = (playerId: string | null) => {
    dispatch({ type: 'SET_PENDING_WINNER', playerId });
  };

  const handleNext = () => {
    if (isAnimating) return;

    if (isFirstDraw) {
      dispatch({ type: 'START_FIRST_CARD' });
      setAnimationClass('animate__zoomIn');
      return;
    }

    if (state.pendingWinner === undefined) return;

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

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    dispatch({ type: 'UNDO_LAST' });
    setAnimationClass('animate__zoomIn');
  }, [canUndo, dispatch]);

  useEffect(() => {
    if (!canUndo) {
      setActions(null);
      return () => setActions(null);
    }

    const undoButton = (
      <button
        onClick={handleUndo}
        className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
        disabled={isAnimating}
      >
        {STR.play.undo}
      </button>
    );

    setActions(undoButton);

    return () => setActions(null);
  }, [canUndo, handleUndo, isAnimating, setActions]);

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
          {isFirstDraw ? (
            <button
              onClick={handleNext}
              disabled={isAnimating}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {STR.play.startRound}
            </button>
          ) : (
            state.pendingWinner !== undefined && (
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {STR.play.next}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}