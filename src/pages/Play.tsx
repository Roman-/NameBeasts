import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const rounds = state.rounds ?? [];
  const canUndo = rounds.length > 0;

  const players = state.settings?.players ?? [];

  const playerScores = useMemo(() => {
    const scores: Record<string, number> = {};
    players.forEach((player) => {
      scores[player.id] = 0;
    });

    let noOne = 0;

    rounds.forEach((round) => {
      if (round.winnerPlayerId === null) {
        noOne += 1;
      } else if (round.winnerPlayerId) {
        scores[round.winnerPlayerId] = (scores[round.winnerPlayerId] ?? 0) + 1;
      }
    });

    return { scores, noOne };
  }, [players, rounds]);

  const currentTurnPlayer = useMemo(() => {
    if (!players || players.length === 0) return undefined;
    const index = rounds.length % players.length;
    return players[index];
  }, [players, rounds.length]);

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

  const totalCards = state.deck?.length ?? 0;
  const currentCardNumber =
    !state.deck || isFirstDraw
      ? 0
      : Math.min(state.currentIndex + 1, totalCards);

  const progressLabel =
    totalCards === 0
      ? STR.play.noCards
      : isFirstDraw
        ? STR.play.ready(totalCards)
        : STR.play.progress(currentCardNumber, totalCards);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="text-center text-sm font-medium text-gray-600 mb-4">{progressLabel}</div>

        {/* Hint */}
        {currentCard && (
          <div className="text-center text-lg font-medium text-gray-800 mb-4">
            {STR.play.hint}
          </div>
        )}

        {/* Card */}
        <div className="mb-6">
          <CardFrame
            key={currentCard ? currentCard.uid : 'placeholder-card'}
            card={currentCard}
            animationClass={animationClass}
            onAnimationEnd={handleAnimationEnd}
          />
        </div>

        {/* Player Selection */}
        {!isFirstDraw && (
          <>
            {currentTurnPlayer && (
              <div className="text-center text-sm font-semibold text-gray-600 mb-2" aria-live="polite">
                {STR.play.turnLabel(currentTurnPlayer.name)}
              </div>
            )}
            <PlayerChips
              players={players}
              selectedPlayerId={state.pendingWinner}
              onPlayerSelect={handlePlayerSelect}
              scores={playerScores.scores}
              noOneScore={playerScores.noOne}
              currentTurnPlayerId={currentTurnPlayer?.id}
            />
          </>
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