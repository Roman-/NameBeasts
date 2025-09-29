import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameContext } from '../state/GameContext';
import { STR } from '../strings';
import { PLAYER_COLOR_MAP, PLAYER_COLORS, PlayerColorId } from '../data/playerIdentity';

const getColorForPlayer = (playerColorId: string) =>
  PLAYER_COLOR_MAP[playerColorId as PlayerColorId] ?? PLAYER_COLORS[0];

export function Finish() {
  const navigate = useNavigate();
  const { state } = useGameContext();

  // Redirect if no finished game
  React.useEffect(() => {
    if (!state.settings || state.status !== 'finished') {
      navigate('/settings');
    }
  }, [state, navigate]);

  if (!state.settings || state.status !== 'finished') {
    return <div>Loading...</div>;
  }

  // Calculate scores
  const scores: Record<string, number> = {};
  state.settings.players.forEach(p => (scores[p.id] = 0));
  state.rounds?.forEach(r => {
    if (r.winnerPlayerId && scores[r.winnerPlayerId] !== undefined) {
      scores[r.winnerPlayerId]++;
    }
  });

  // Sort players by score (descending), then by name
  const sortedPlayers = [...state.settings.players].sort((a, b) => {
    const scoreA = scores[a.id] || 0;
    const scoreB = scores[b.id] || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.name.localeCompare(b.name);
  });

  const scoreValues = Object.values(scores);
  const topScore = scoreValues.length > 0 ? Math.max(...scoreValues) : 0;
  const topScoreCount = sortedPlayers.filter(player => (scores[player.id] || 0) === topScore && topScore > 0).length;
  const totalCardsWon = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">{STR.finish.title}</h1>
        
        {/* Scoreboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const score = scores[player.id] || 0;
              const isWinner = score > 0 && score === topScore;

              const color = getColorForPlayer(player.colorId);

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-xl border-2 p-4 shadow-sm ${
                    isWinner ? 'ring-2 ring-yellow-300' : ''
                  }`}
                  style={{
                    backgroundColor: color.light,
                    borderColor: color.bold,
                    color: color.textOnLight
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                      style={{
                        backgroundColor: color.bold,
                        color: color.textOnBold
                      }}
                      aria-hidden
                    >
                      {player.avatar}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{player.name}</p>
                      <p className="text-sm text-black/60">#{index + 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {isWinner && (
                      <span
                        className="text-2xl"
                        aria-label={topScoreCount > 1 ? STR.finish.topScoreTie : STR.finish.topScore}
                      >
                        🏆
                      </span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: color.textOnLight }}>
                      {score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Cards won: {totalCardsWon} of {state.deck?.length || 0}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/settings"
            className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700"
          >
            {STR.finish.playAgain}
          </Link>
          <Link 
            to="/"
            className="px-6 py-3 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}