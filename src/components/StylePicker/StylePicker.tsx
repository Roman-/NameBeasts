import React from 'react';
import { StyleId } from '../../types';
import { STYLES } from '../../data/styles';
import { STR } from '../../strings';
import styles from './StylePicker.module.css';

interface StylePickerProps {
  selectedStyle: StyleId;
  onStyleSelect: (style: StyleId) => void;
  onConfirm: () => void;
}

export function StylePicker({ selectedStyle, onStyleSelect, onConfirm }: StylePickerProps) {
  const style = STYLES[selectedStyle];

  return (
    <div className={styles.container}>
      {/* Style tabs - for future expansion */}
      <div className={styles.tabs}>
        {Object.values(STYLES).map((s) => (
          <button
            key={s.id}
            onClick={() => onStyleSelect(s.id)}
            className={`${styles.tab} ${selectedStyle === s.id ? styles.activeTab : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Image gallery */}
      <div className={styles.gallery}>
        <h3 className={styles.galleryTitle}>{style.label} Creatures</h3>
        <div className={styles.imageGrid}>
          {Array.from({ length: style.imageCount }, (_, i) => i + 1).map((creatureId) => (
            <div key={creatureId} className={styles.imageContainer}>
              <img
                src={`${style.publicPath}/${creatureId}.jpg`}
                alt={`${style.label} creature ${creatureId}`}
                className={styles.image}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className={styles.imageLabel}>#{creatureId}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <div className={styles.actions}>
        <button onClick={onConfirm} className={styles.confirmButton}>
          {STR.settings.useThisStyle}
        </button>
      </div>
    </div>
  );
}