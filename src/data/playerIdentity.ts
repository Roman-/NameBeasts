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

export function createDefaultPlayers(): Player[] {
  return [
    {
      id: generateId(),
      name: 'Riley',
      avatar: '😀',
      colorId: 'sunny',
      isDefault: true
    },
    {
      id: generateId(),
      name: 'Nova',
      avatar: '😺',
      colorId: 'berry',
      isDefault: true
    }
  ];
}

