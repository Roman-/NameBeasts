import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsType, Player, Game, Card, StyleId } from '../types';
import { STR } from '../strings';
import { STYLES } from '../data/styles';
import { generateId, generateUid } from '../utils/ids';
import { shuffle } from '../utils/shuffle';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Modal } from '../components/Modal/Modal';
import { StylePicker } from '../components/StylePicker/StylePicker';
import {
  PLAYER_AVATARS,
  PLAYER_COLOR_MAP,
  PLAYER_COLORS,
  PlayerColorId,
  createDefaultPlayers
} from '../data/playerIdentity';

const NEW_PLAYER_KEY = 'new';

const getDefaultSettings = (): SettingsType => ({
  style: 'Fruitfolk',
  distinctCreatures: 6,
  duplicatesPerCreature: 4,
  players: createDefaultPlayers()
});

type PlayerDraft = {
  id?: string;
  name: string;
  avatar: string;
  colorId: PlayerColorId;
  isDefault?: boolean;
};

const getColorForPlayer = (player: Pick<Player, 'colorId'>) => {
  return (
    PLAYER_COLOR_MAP[player.colorId as PlayerColorId] ??
    PLAYER_COLORS[0]
  );
};

const ensurePlayerIdentity = (players: Player[]): Player[] => {
  return players.map((player, index) => {
    const fallbackAvatar = PLAYER_AVATARS[index % PLAYER_AVATARS.length];
    const fallbackColor = PLAYER_COLORS[index % PLAYER_COLORS.length].id;
    const color = PLAYER_COLOR_MAP[player.colorId as PlayerColorId];

    return {
      ...player,
      avatar: player.avatar || fallbackAvatar,
      colorId: color ? color.id : fallbackColor,
      isDefault: player.isDefault
    };
  });
};

const buildNewPlayerDraft = (players: Player[], presetName?: string): PlayerDraft => {
  const index = players.length;
  return {
    name: presetName ?? `Player ${index + 1}`,
    avatar: PLAYER_AVATARS[index % PLAYER_AVATARS.length],
    colorId: PLAYER_COLORS[index % PLAYER_COLORS.length].id,
  };
};

const toDraft = (player: Player): PlayerDraft => ({
  id: player.id,
  name: player.name,
  avatar: player.avatar,
  colorId: (getColorForPlayer(player).id as PlayerColorId),
  isDefault: player.isDefault
});

export function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useLocalStorage<SettingsType>('nb:v1:settings', getDefaultSettings());
  const [pastPlayers, setPastPlayers] = useLocalStorage<string[]>('nb:v1:pastPlayers', []);

  const normalizedSettings = useMemo<SettingsType>(() => ({
    ...settings,
    players: ensurePlayerIdentity(settings.players || [])
  }), [settings]);

  const [localSettings, setLocalSettings] = useState<SettingsType>(normalizedSettings);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [activePlayerKey, setActivePlayerKey] = useState<string>(NEW_PLAYER_KEY);
  const [playerDraft, setPlayerDraft] = useState<PlayerDraft>(() =>
    buildNewPlayerDraft(normalizedSettings.players)
  );
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    setLocalSettings(normalizedSettings);
  }, [normalizedSettings]);

  useEffect(() => {
    const hasMissingIdentity = settings.players.some((player) => {
      const color = PLAYER_COLOR_MAP[player.colorId as PlayerColorId];
      return !('avatar' in player) || !player.avatar || !color;
    });

    if (hasMissingIdentity) {
      setSettings(normalizedSettings);
    }
  }, [settings, normalizedSettings, setSettings]);

  const totalCards = localSettings.distinctCreatures * localSettings.duplicatesPerCreature;
  const isLargeDeck = totalCards > 200;
  const maxPlayersReached = localSettings.players.length >= 8;

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

  const openPlayerModal = (player?: Player, presetName?: string) => {
    if (player) {
      setPlayerDraft(toDraft(player));
      setActivePlayerKey(player.id);
    } else {
      setPlayerDraft(buildNewPlayerDraft(localSettings.players, presetName));
      setActivePlayerKey(NEW_PLAYER_KEY);
    }
    setNameError(null);
    setIsPlayerModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setPlayerDraft(prev => ({ ...prev, name }));
    if (nameError) {
      setNameError(null);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setPlayerDraft(prev => ({ ...prev, avatar }));
  };

  const handleColorSelect = (colorId: PlayerColorId) => {
    setPlayerDraft(prev => ({ ...prev, colorId }));
  };

  const handlePlayerSubmit = () => {
    const trimmedName = playerDraft.name.trim();

    if (!trimmedName) {
      setNameError(STR.settings.playerNameRequired);
      return;
    }

    const isDuplicate = localSettings.players.some(player =>
      player.id !== playerDraft.id && player.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setNameError(STR.settings.playerNameDuplicate);
      return;
    }

    if (playerDraft.id) {
      let nextPlayers: Player[] = [];
      setLocalSettings(prev => {
        const updatedPlayers = prev.players.map(player =>
          player.id === playerDraft.id
            ? {
                ...player,
                name: trimmedName,
                avatar: playerDraft.avatar,
                colorId: playerDraft.colorId,
                isDefault: player.isDefault
              }
            : player
        );
        nextPlayers = updatedPlayers;
        return { ...prev, players: updatedPlayers };
      });

      const updatedPlayer = nextPlayers.find(player => player.id === playerDraft.id);
      if (updatedPlayer) {
        setPlayerDraft(toDraft(updatedPlayer));
        setActivePlayerKey(updatedPlayer.id);
      }
      setNameError(null);
      return;
    }

    if (maxPlayersReached) {
      return;
    }

    const newPlayer: Player = {
      id: generateId(),
      name: trimmedName,
      avatar: playerDraft.avatar,
      colorId: playerDraft.colorId
    };

    let nextPlayers: Player[] = [];
    setLocalSettings(prev => {
      const updatedPlayers = [...prev.players, newPlayer];
      nextPlayers = updatedPlayers;
      return { ...prev, players: updatedPlayers };
    });

    setPlayerDraft(buildNewPlayerDraft(nextPlayers));
    setActivePlayerKey(NEW_PLAYER_KEY);
    setNameError(null);
  };

  const handleRemovePlayer = (player: Player) => {
    if (player.isDefault) return;

    let nextPlayers: Player[] = [];
    setLocalSettings(prev => {
      const updatedPlayers = prev.players.filter(p => p.id !== player.id);
      nextPlayers = updatedPlayers;
      return { ...prev, players: updatedPlayers };
    });

    if (activePlayerKey === player.id) {
      setPlayerDraft(buildNewPlayerDraft(nextPlayers));
      setActivePlayerKey(NEW_PLAYER_KEY);
    }
  };

  const addPastPlayer = (name: string) => {
    if (maxPlayersReached) return;
    openPlayerModal(undefined, name);
  };

  const resetToDefaults = () => {
    const defaults = getDefaultSettings();
    setLocalSettings(defaults);
    setSettings(defaults);
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

  const renderPlayerCard = (player: Player) => {
    const color = getColorForPlayer(player);
    const isSelected = activePlayerKey === player.id;

    return (
      <div
        key={player.id}
        className={`relative flex items-center justify-between rounded-lg border-2 p-3 transition-colors ${
          isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
        }`}
        style={{
          backgroundColor: color.light,
          borderColor: color.bold,
          color: color.textOnLight
        }}
      >
        <button
          type="button"
          className="flex items-center space-x-3 text-left"
          onClick={() => openPlayerModal(player)}
        >
          <span className="text-3xl" aria-hidden>
            {player.avatar}
          </span>
          <span className="font-semibold">{player.name}</span>
        </button>
        {!player.isDefault && (
          <button
            type="button"
            onClick={() => handleRemovePlayer(player)}
            className="rounded-full bg-white/60 p-2 text-sm text-red-600 transition hover:bg-white"
            aria-label={STR.settings.removePlayer(player.name)}
          >
            🗑️
          </button>
        )}
        {player.isDefault && (
          <span className="text-xs font-medium text-black/60">{STR.settings.defaultLabel}</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">{STR.settings.title}</h1>

        <div className="space-y-6">
          {/* Creatures Settings */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {STR.settings.distinctCreatures}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures - 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{localSettings.distinctCreatures}</span>
                  <button
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures + 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {STR.settings.duplicatesPerCreature}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature - 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{localSettings.duplicatesPerCreature}</span>
                  <button
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature + 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
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
                  <span className="ml-2 text-orange-600">
                    Large decks can be slow; consider fewer duplicates.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">{STR.settings.players}</h3>
              <button
                onClick={() => openPlayerModal()}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={maxPlayersReached}
              >
                {STR.settings.addPlayer}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {localSettings.players.map(player => renderPlayerCard(player))}
            </div>

            {maxPlayersReached && (
              <p className="mt-4 text-sm text-gray-500">{STR.settings.maxPlayersNote}</p>
            )}

            {pastPlayers.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium text-gray-700">{STR.settings.pastPlayers}</p>
                <div className="flex flex-wrap gap-2">
                  {pastPlayers.slice(0, 10).map((name) => (
                    <button
                      key={name}
                      onClick={() => addPastPlayer(name)}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                      disabled={maxPlayersReached}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Style Selection */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-800">Style</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={STYLES[localSettings.style].preview}
                  alt={STYLES[localSettings.style].label}
                  className="h-16 w-16 rounded-lg border-2 border-blue-500 object-cover"
                />
                <div>
                  <p className="font-medium">{STYLES[localSettings.style].label}</p>
                  <p className="text-sm text-gray-600">{STYLES[localSettings.style].imageCount} creatures</p>
                </div>
              </div>
              <button
                onClick={() => setIsStyleModalOpen(true)}
                className="rounded bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
              >
                {STR.settings.chooseStyle}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={resetToDefaults}
              className="rounded-lg bg-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-300"
            >
              {STR.settings.resetDefaults}
            </button>
            <button
              onClick={startGame}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
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

        {/* Player Identity Modal */}
        <Modal
          isOpen={isPlayerModalOpen}
          onClose={() => setIsPlayerModalOpen(false)}
          title={STR.settings.playerModalTitle}
        >
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="player-name-input">
                {STR.settings.playerNameLabel}
              </label>
              <input
                id="player-name-input"
                type="text"
                value={playerDraft.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder={STR.settings.playerNamePlaceholder}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
              {!nameError && (
                <p className="mt-1 text-xs text-gray-500">{STR.settings.playerNameHint}</p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">{STR.settings.avatarLabel}</p>
              <div className="grid grid-cols-5 gap-2">
                {PLAYER_AVATARS.map((avatar) => {
                  const isSelected = playerDraft.avatar === avatar;
                  return (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => handleAvatarSelect(avatar)}
                      className={`flex h-14 items-center justify-center rounded-lg border text-2xl transition ${
                        isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">{STR.settings.colorLabel}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PLAYER_COLORS.map((color) => {
                  const isSelected = playerDraft.colorId === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleColorSelect(color.id)}
                      className={`flex items-center justify-between rounded-lg border-2 px-3 py-2 text-sm font-medium transition ${
                        isSelected ? 'ring-2 ring-blue-400' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected ? color.bold : color.light,
                        borderColor: color.bold,
                        color: isSelected ? color.textOnBold : color.textOnLight
                      }}
                    >
                      <span>{color.label}</span>
                      <span className="text-lg" aria-hidden>
                        ●
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handlePlayerSubmit}
                className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={maxPlayersReached && !playerDraft.id}
              >
                {playerDraft.id ? STR.settings.savePlayer : STR.settings.addPlayer}
              </button>
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium text-gray-700">{STR.settings.currentPlayers}</p>
              <div className="space-y-3">
                {[...localSettings.players].slice().reverse().map(player => renderPlayerCard(player))}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
