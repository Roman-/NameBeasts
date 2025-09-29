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
  createDefaultPlayers,
  createPlayerWithDefaults
} from '../data/playerIdentity';

const getDefaultSettings = (): SettingsType => ({
  style: 'Fruitfolk',
  distinctCreatures: 6,
  duplicatesPerCreature: 4,
  players: createDefaultPlayers()
});

type PlayerDraft = {
  id: string;
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
  const [playerDraft, setPlayerDraft] = useState<PlayerDraft | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [lastAddedPlayerId, setLastAddedPlayerId] = useState<string | null>(null);
  const [areStyleImagesLoaded, setAreStyleImagesLoaded] = useState(false);

  const playerDraftColor = playerDraft
    ? PLAYER_COLOR_MAP[playerDraft.colorId as PlayerColorId] ?? PLAYER_COLORS[0]
    : null;

  const currentStyle = STYLES[localSettings.style];

  const styleImageUrls = useMemo(() => {
    return Array.from({ length: currentStyle.imageCount }, (_, index) =>
      `${currentStyle.publicPath}/${index + 1}.jpg`
    );
  }, [currentStyle]);

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

  useEffect(() => {
    if (!lastAddedPlayerId) return;
    const timeout = window.setTimeout(() => setLastAddedPlayerId(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [lastAddedPlayerId]);

  useEffect(() => {
    let isCancelled = false;
    const totalImages = styleImageUrls.length;

    if (totalImages === 0) {
      setAreStyleImagesLoaded(true);
      return;
    }

    setAreStyleImagesLoaded(false);
    let loadedCount = 0;

    const handleLoad = () => {
      loadedCount += 1;
      if (!isCancelled && loadedCount >= totalImages) {
        setAreStyleImagesLoaded(true);
      }
    };

    const preloaders = styleImageUrls.map(src => {
      const image = new Image();
      let hasSettled = false;
      const settle = () => {
        if (hasSettled) return;
        hasSettled = true;
        handleLoad();
      };
      image.onload = settle;
      image.onerror = settle;
      image.src = src;
      if (image.complete) {
        settle();
      }
      return image;
    });

    return () => {
      isCancelled = true;
      preloaders.forEach(image => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [styleImageUrls]);

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

  const openPlayerModal = (player: Player) => {
    setPlayerDraft(toDraft(player));
    setNameError(null);
    setIsPlayerModalOpen(true);
  };

  const closePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setPlayerDraft(null);
    setNameError(null);
  };

  const handleNameChange = (name: string) => {
    setPlayerDraft(prev => (prev ? { ...prev, name } : prev));
    if (nameError) {
      setNameError(null);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setPlayerDraft(prev => (prev ? { ...prev, avatar } : prev));
  };

  const handleColorSelect = (colorId: PlayerColorId) => {
    setPlayerDraft(prev => (prev ? { ...prev, colorId } : prev));
  };

  const handlePlayerSubmit = () => {
    if (!playerDraft) return;

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

    setLocalSettings(prev => ({
      ...prev,
      players: prev.players.map(player =>
        player.id === playerDraft.id
          ? {
              ...player,
              name: trimmedName,
              avatar: playerDraft.avatar,
              colorId: playerDraft.colorId
            }
          : player
      )
    }));

    setPlayerDraft(prev => (prev ? { ...prev, name: trimmedName } : prev));
    setNameError(null);
    closePlayerModal();
  };

  const handleRemovePlayer = (player: Player) => {
    if (player.isDefault) return;

    setLocalSettings(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== player.id)
    }));

    if (playerDraft?.id === player.id) {
      closePlayerModal();
    }
  };

  const addPlayerWithDefaults = (presetName?: string) => {
    if (maxPlayersReached) return;

    let created: Player | null = null;
    setLocalSettings(prev => {
      const newPlayer = createPlayerWithDefaults(prev.players, { presetName });
      created = newPlayer;
      return {
        ...prev,
        players: [...prev.players, newPlayer]
      };
    });

    if (created) {
      setLastAddedPlayerId(created.id);
    }
  };

  const addPastPlayer = (name: string) => {
    addPlayerWithDefaults(name);
  };

  const resetToDefaults = () => {
    const defaults = getDefaultSettings();
    setLocalSettings(defaults);
    setSettings(defaults);
    setLastAddedPlayerId(null);
    closePlayerModal();
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
    const styleMeta = STYLES[localSettings.style];
    const availableCreatureIds = Array.from({ length: styleMeta.imageCount }, (_, index) => index + 1);
    const selectedCreatureIds = shuffle([...availableCreatureIds]).slice(0, localSettings.distinctCreatures);

    selectedCreatureIds.forEach((creatureId) => {
      for (let d = 0; d < localSettings.duplicatesPerCreature; d++) {
        cards.push({
          uid: generateUid(),
          creatureId,
          style: localSettings.style
        });
      }
    });

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
    const isRecent = lastAddedPlayerId === player.id;

    return (
      <div
        key={player.id}
        className={`flex items-center justify-between rounded-xl border-2 p-4 shadow-sm transition ${
          isRecent ? 'ring-2 ring-offset-2 ring-blue-400' : ''
        }`}
        style={{
          backgroundColor: color.light,
          borderColor: color.bold,
          color: color.textOnLight
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
            style={{ backgroundColor: color.bold, color: color.textOnBold }}
            aria-hidden
          >
            {player.avatar}
          </div>
          <div>
            <button
              type="button"
              onClick={() => openPlayerModal(player)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block text-lg font-semibold">{player.name}</span>
              <span className="block text-xs text-black/60">{STR.settings.tapToEdit}</span>
            </button>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium">
              <span aria-hidden>●</span> {color.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openPlayerModal(player)}
            className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-white"
          >
            {STR.settings.editPlayer}
          </button>
          {!player.isDefault ? (
            <button
              type="button"
              onClick={() => handleRemovePlayer(player)}
              className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-white"
              aria-label={STR.settings.removePlayer(player.name)}
            >
              {STR.settings.remove}
            </button>
          ) : (
            <span className="rounded-full bg-white/50 px-3 py-1 text-xs font-medium text-black/60">
              {STR.settings.defaultLabel}
            </span>
          )}
        </div>
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
            <h3 className="mb-4 text-lg font-medium text-gray-800">
              {STR.settings.creaturesPanelTitle}
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {STR.settings.distinctCreatures}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures - 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label={`Decrease ${STR.settings.distinctCreatures.toLowerCase()}`}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-base font-semibold">
                    {localSettings.distinctCreatures}
                  </span>
                  <button
                    onClick={() => updateDistinctCreatures(localSettings.distinctCreatures + 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label={`Increase ${STR.settings.distinctCreatures.toLowerCase()}`}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {STR.settings.duplicatesPerCreature}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature - 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label={`Decrease ${STR.settings.duplicatesPerCreature.toLowerCase()}`}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-base font-semibold">
                    {localSettings.duplicatesPerCreature}
                  </span>
                  <button
                    onClick={() => updateDuplicates(localSettings.duplicatesPerCreature + 1)}
                    className="h-8 w-8 rounded bg-gray-200 hover:bg-gray-300"
                    aria-label={`Increase ${STR.settings.duplicatesPerCreature.toLowerCase()}`}
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
                onClick={() => addPlayerWithDefaults()}
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex -space-x-6">
                  {styleImageUrls.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${currentStyle.label} creature ${index + 1}`}
                      loading="eager"
                      className="h-24 w-16 rounded-xl border-2 border-white object-cover shadow-md ring-1 ring-blue-100"
                    />
                  ))}
                </div>
                <div>
                  <p className="font-medium">{currentStyle.label}</p>
                  <p className="text-sm text-gray-600">{currentStyle.imageCount} creatures</p>
                  {!areStyleImagesLoaded && (
                    <p className="mt-1 text-xs text-blue-600">Loading creatures…</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsStyleModalOpen(true)}
                className="self-start rounded bg-blue-100 px-4 py-2 text-blue-700 transition hover:bg-blue-200"
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
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-blue-900/60 disabled:hover:bg-blue-200"
              disabled={!areStyleImagesLoaded}
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
          onClose={closePlayerModal}
          title={STR.settings.playerModalTitle}
        >
          {playerDraft && playerDraftColor && (
            <div className="space-y-6">
              <div
                className="flex items-center justify-between rounded-xl border-2 p-4 shadow-sm"
                style={{
                  backgroundColor: playerDraftColor.light,
                  borderColor: playerDraftColor.bold,
                  color: playerDraftColor.textOnLight
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                    style={{
                      backgroundColor: playerDraftColor.bold,
                      color: playerDraftColor.textOnBold
                    }}
                    aria-hidden
                  >
                    {playerDraft.avatar}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {playerDraft.name.trim() || STR.settings.playerPreviewPlaceholder}
                    </p>
                    <p className="text-xs text-black/60">
                      {playerDraftColor.label} {STR.settings.paletteLabel}
                    </p>
                  </div>
                </div>
              </div>

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
                          isSelected
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                            : 'border-gray-200 bg-white hover:border-blue-300'
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
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                >
                  {STR.settings.savePlayer}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
