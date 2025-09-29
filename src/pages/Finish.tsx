import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGameContext } from '../state/GameContext';
import { STR } from '../strings';

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
              const isWinner = index === 0 && score > 0;
              
              return (
                <div 
                  key={player.id}
                  className={`flex justify-between items-center p-4 rounded-lg ${
                    isWinner ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${
                      isWinner ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className={`text-lg font-medium ${
                      isWinner ? 'text-yellow-800' : 'text-gray-800'
                    }`}>
                      {player.name}
                    </span>
                    {isWinner && (
                      <span className="text-2xl">🏆</span>
                    )}
                  </div>
                  <span className={`text-2xl font-bold ${
                    isWinner ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Cards won: {totalCardsWon} of {state.deck?.length || 0}
          </div>
        </div>

        {/* Saved Names */}
        {state.names && state.names.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Creature Names</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.names.map((name) => (
                <div key={`${name.style}-${name.creatureId}`} className="flex items-center space-x-3">
                  <img 
                    src={`/creatures/${name.style}/${name.creatureId}.jpg`}
                    alt={`Creature ${name.creatureId}`}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <div>
                    <p className="font-medium">"{name.text}"</p>
                    <p className="text-sm text-gray-600">Creature #{name.creatureId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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