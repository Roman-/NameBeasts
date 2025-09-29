import { generateId } from '../utils/ids';
import { Player } from '../types';

export type PlayerColorId =
  | 'sunny'
  | 'ocean'
  | 'berry'
  | 'forest'
  | 'lavender'
  | 'ember';

export interface PlayerColor {
  id: PlayerColorId;
  label: string;
  light: string;
  bold: string;
  textOnLight: string;
  textOnBold: string;
}

export const PLAYER_AVATARS: string[] = [
  '😀',
  '😎',
  '🤠',
  '🤓',
  '🥳',
  '😺',
  '🦄',
  '🐲',
  '🦊',
  '👾'
];

export const PLAYER_COLORS: PlayerColor[] = [
  {
    id: 'sunny',
    label: 'Sunny',
    light: '#FEF3C7',
    bold: '#F59E0B',
    textOnLight: '#92400E',
    textOnBold: '#FFFBEB'
  },
  {
    id: 'ocean',
    label: 'Ocean',
    light: '#DBEAFE',
    bold: '#2563EB',
    textOnLight: '#1D4ED8',
    textOnBold: '#E0F2FE'
  },
  {
    id: 'berry',
    label: 'Berry',
    light: '#FCE7F3',
    bold: '#DB2777',
    textOnLight: '#9D174D',
    textOnBold: '#FDF2F8'
  },
  {
    id: 'forest',
    label: 'Forest',
    light: '#DCFCE7',
    bold: '#16A34A',
    textOnLight: '#166534',
    textOnBold: '#F0FDF4'
  },
  {
    id: 'lavender',
    label: 'Lavender',
    light: '#EDE9FE',
    bold: '#7C3AED',
    textOnLight: '#5B21B6',
    textOnBold: '#F5F3FF'
  },
  {
    id: 'ember',
    label: 'Ember',
    light: '#FFE4E6',
    bold: '#DC2626',
    textOnLight: '#991B1B',
    textOnBold: '#FEF2F2'
  }
];

export const PLAYER_COLOR_MAP: Record<PlayerColorId, PlayerColor> = PLAYER_COLORS.reduce(
  (acc, color) => {
    acc[color.id] = color;
    return acc;
  },
  {} as Record<PlayerColorId, PlayerColor>
);

type PlayerTemplate = {
  name: string;
  avatar: string;
  colorId: PlayerColorId;
};

const PLAYER_TEMPLATES: PlayerTemplate[] = [
  { name: 'Riley', avatar: '😀', colorId: 'sunny' },
  { name: 'Nova', avatar: '😺', colorId: 'berry' },
  { name: 'Milo', avatar: '🤠', colorId: 'ocean' },
  { name: 'Zara', avatar: '🥳', colorId: 'forest' },
  { name: 'Juno', avatar: '🤓', colorId: 'lavender' },
  { name: 'Kai', avatar: '🦊', colorId: 'ember' },
  { name: 'Lux', avatar: '😎', colorId: 'ocean' },
  { name: 'Sage', avatar: '🦄', colorId: 'forest' },
  { name: 'Indy', avatar: '👾', colorId: 'lavender' },
  { name: 'Vega', avatar: '🐲', colorId: 'berry' }
];

const ensureUniqueName = (baseName: string, takenNames: Set<string>) => {
  let attempt = baseName.trim();
  if (!attempt) {
    attempt = 'Player';
  }

  if (!takenNames.has(attempt.toLowerCase())) {
    return attempt;
  }

  let suffix = 2;
  let candidate = `${attempt} ${suffix}`;
  while (takenNames.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${attempt} ${suffix}`;
  }
  return candidate;
};

const pickNextFromList = <T,>(list: readonly T[], used: Set<T>, fallbackIndex: number) => {
  const available = list.find(item => !used.has(item));
  if (available !== undefined) {
    return available;
  }
  return list[fallbackIndex % list.length];
};

const buildPlayerIdentity = (players: Player[], presetName?: string) => {
  const takenNames = new Set(players.map(player => player.name.toLowerCase()));
  const takenAvatars = new Set(players.map(player => player.avatar));
  const takenColors = new Set(players.map(player => player.colorId as PlayerColorId));

  const nameTemplate = PLAYER_TEMPLATES.find(template => !takenNames.has(template.name.toLowerCase()));

  const baseName = presetName ?? nameTemplate?.name ?? `Player ${players.length + 1}`;
  const name = ensureUniqueName(baseName, takenNames);

  const identityTemplate =
    (!presetName && nameTemplate) ||
    PLAYER_TEMPLATES.find(
      template => !takenAvatars.has(template.avatar) && !takenColors.has(template.colorId)
    ) ||
    PLAYER_TEMPLATES.find(
      template => !takenAvatars.has(template.avatar) || !takenColors.has(template.colorId)
    );

  const avatar =
    identityTemplate && !takenAvatars.has(identityTemplate.avatar)
      ? identityTemplate.avatar
      : pickNextFromList(PLAYER_AVATARS, takenAvatars, players.length);

  const fallbackColor =
    PLAYER_COLORS.find(colorOption => !takenColors.has(colorOption.id)) ??
    PLAYER_COLORS[players.length % PLAYER_COLORS.length];

  const colorId =
    identityTemplate && !takenColors.has(identityTemplate.colorId)
      ? identityTemplate.colorId
      : fallbackColor.id;

  return {
    name,
    avatar,
    colorId
  };
};

export function createPlayerWithDefaults(
  players: Player[],
  options?: { presetName?: string }
): Player {
  const identity = buildPlayerIdentity(players, options?.presetName);

  return {
    id: generateId(),
    name: identity.name,
    avatar: identity.avatar,
    colorId: identity.colorId
  };
}

export function createDefaultPlayers(): Player[] {
  const players: Player[] = [];
  for (let index = 0; index < 2; index++) {
    const player = createPlayerWithDefaults(players);
    players.push(player);
  }
  return players;
}

