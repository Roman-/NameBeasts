import { StyleId } from '../types';

export const STYLES = {
  Fruitfolk: {
    id: 'Fruitfolk' as const,
    label: 'Fruitfolk',
    imageCount: 8,
    publicPath: '/creatures/Fruitfolk',
    preview: '/creatures/Fruitfolk/1.jpg'
  }
};

export type StyleMeta = typeof STYLES[StyleId];