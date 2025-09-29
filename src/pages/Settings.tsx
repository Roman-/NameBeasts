import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsType, Player, Game, Card, StyleId } from '../types';
import { STR } from '../strings';
import { STYLES } from '../data/styles';
import { generateId, generateUid } from '../utils/ids';
import { shuffle } from '../utils/shuffle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from '../components/Modal/Modal';
import { StylePicker } from '../components/StylePicker/StylePicker';

const DEFAULT_SETTINGS: SettingsType = {
  style: 'Fruitfolk',
  distinctCreatures: 6,
  duplicatesPerCreature: 4,
  players: [
    { id: generateId(), name: 'Player 1' },
    { id: generateId(), name: 'Player 2' }
  ]
};

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useLocalStorage('nb:v1:settings', DEFAULT_SETTINGS);
  const [pastPlayers, setPastPlayers] = useLocalStorage<string[]>('nb:v1:pastPlayers', []);
  
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  const totalCards = localSettings.distinctCreatures * localSettings.duplicatesPerCreature;
  const isLargeDeck = totalCards > 200;

  const updateDistinctCreatures = (value: number) => {
    const style = STYLES[localSettings.style];
    const clamped = Math.max(2, Math.min(8, Math.min(value, style.imageCount)));
    setLocalSettings(prev => ({ ...prev, distinctCreatures: clamped }));
  };

  const updateDuplicates = (value: number) => {
    let clamped = Math.max(1, Math.min(12, value));
    const newTotal = localSettings.distinctCreatures * clamped;
    if (newTotal > 200) {
      clamped = Math.floor(200 / localSettings.distinctCreatures);
    }
    setLocalSettings(prev => ({ ...prev, duplicatesPerCreature: clamped }));
  };

  const addPlayer = () => {
    if (localSettings.players.length >= 8) return;
    const newPlayer: Player = {
      id: generateId(),
      name: `Player ${localSettings.players.length + 1}`
    };
    setLocalSettings(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  };

  const removePlayer = (id: string) => {
    if (localSettings.players.length <= 1) return;
    setLocalSettings(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const updatePlayerName = (id: string, name: string) => {
    setLocalSettings(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, name } : p)
    }));
  };

  const addPastPlayer = (name: string) => {
    if (localSettings.players.some(p => p.name === name)) return;
    const newPlayer: Player = { id: generateId(), name };
    setLocalSettings(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  };

  const resetToDefaults = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const handleStyleSelect = (style: StyleId) => {
    setLocalSettings(prev => ({ ...prev, style }));
  };

  const handleStyleConfirm = () => {
    setIsStyleModalOpen(false);
  };

  const startGame = () => {
    // Build deck
    const cards: Card[] = [];
    for (let creatureId = 1; creatureId <= localSettings.distinctCreatures; creatureId++) {
      for (let d = 0; d < localSettings.duplicatesPerCreature; d++) {
        cards.push({
          uid: generateUid(),
          creatureId,
          style: localSettings.style
        });
      }
    }
    
    const shuffledDeck = shuffle(cards);
    
    const game: Game = {
      id: generateId(),
      settings: localSettings,
      deck: shuffledDeck,
      currentIndex: -1,
      rounds: [],
      names: [],
      status: 'ready'
    };

    // Save settings and update past players
    setSettings(localSettings);
    const newNames = localSettings.players.map(p => p.name);
    const updatedPastPlayers = Array.from(new Set([...newNames, ...pastPlayers])).slice(0, 30);
    setPastPlayers(updatedPastPlayers);

    // Save game and navigate
    localStorage.setItem('nb:v1:resumeGame', JSON.stringify(game));
    navigate('/play', { state: { game } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{STR.settings.title}</h1>
        
        <div className="space-y-6">
          {/* Creatures Settings */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {STR.settings.distinctCreatures}
                </label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures - 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{localSettings.distinctCreatures}</span>
                  <button 
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures + 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {STR.settings.duplicatesPerCreature}
                </label>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature - 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{localSettings.duplicatesPerCreature}</span>
                  <button 
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature + 1)}
                    className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {STR.settings.totalCards}: <strong>{totalCards}</strong>
                {isLargeDeck && (
                  <span className="text-orange-600 ml-2">
                    Large decks can be slow; consider fewer duplicates.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">{STR.settings.players}</h3>
            
            <div className="space-y-3">
              {localSettings.players.map((player, index) => (
                <div key={player.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {localSettings.players.length > 1 && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {localSettings.players.length < 8 && (
              <button
                onClick={addPlayer}
                className="mt-3 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {STR.settings.addPlayer}
              </button>
            )}

            {pastPlayers.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{STR.settings.pastPlayers}</p>
                <div className="flex flex-wrap gap-2">
                  {pastPlayers.slice(0, 10).map((name) => (
                    <button
                      key={name}
                      onClick={() => addPastPlayer(name)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Style</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src={STYLES[localSettings.style].preview} 
                  alt={STYLES[localSettings.style].label}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-blue-500"
                />
                <div>
                  <p className="font-medium">{STYLES[localSettings.style].label}</p>
                  <p className="text-sm text-gray-600">{STYLES[localSettings.style].imageCount} creatures</p>
                </div>
              </div>
              <button
                onClick={() => setIsStyleModalOpen(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {STR.settings.chooseStyle}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetToDefaults}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {STR.settings.resetDefaults}
            </button>
            <button
              onClick={startGame}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {STR.settings.start}
            </button>
          </div>
        </div>

        {/* Style Picker Modal */}
        <Modal 
          isOpen={isStyleModalOpen} 
          onClose={() => setIsStyleModalOpen(false)}
          title="Choose Art Style"
        >
          <StylePicker
            selectedStyle={localSettings.style}
            onStyleSelect={handleStyleSelect}
            onConfirm={handleStyleConfirm}
          />
        </Modal>
      </div>
    </div>
  );
}