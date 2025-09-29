import React from 'react';
import { Link } from 'react-router-dom';
import { STR } from '../strings';

export function Landing() {
  const resumeGame = localStorage.getItem('nb:v1:resumeGame');
  const hasResumeGame = resumeGame !== null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-green-50">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{STR.appName}</h1>
        <p className="text-lg text-gray-600 mb-8">{STR.landingBlurb}</p>
        
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-gray-200">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Rules:</h2>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>• On each card, invent or recall the creature's name.</li>
              <li>• Tap the player who named it first (or "No one").</li>
              <li>• Each card is worth <strong>1 point</strong>. Highest score wins.</li>
              <li>• Some creatures repeat—try to remember their names!</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link 
              to="/settings" 
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {STR.newGame}
            </Link>
            
            {hasResumeGame && (
              <Link 
                to="/play" 
                className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {STR.resumeGame}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}