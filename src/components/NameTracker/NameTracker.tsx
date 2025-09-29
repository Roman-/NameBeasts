import React, { useState } from 'react';
import { CreatureName, StyleId } from '../../types';
import { STR } from '../../strings';
import styles from './NameTracker.module.css';

interface NameTrackerProps {
  creatureId: number;
  style: StyleId;
  existingNames: CreatureName[];
  onSaveName: (creatureId: number, text: string) => void;
}

export function NameTracker({ creatureId, style, existingNames, onSaveName }: NameTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [showRevealedName, setShowRevealedName] = useState(false);

  const existingName = existingNames.find(n => n.creatureId === creatureId && n.style === style);
  const isFirstSight = !existingName;

  const handleSave = () => {
    if (nameInput.trim()) {
      onSaveName(creatureId, nameInput.trim());
      setNameInput('');
      setIsExpanded(false);
    }
  };

  const handleSkip = () => {
    setIsExpanded(false);
    setNameInput('');
  };

  const handleReveal = () => {
    setShowRevealedName(true);
  };

  if (isFirstSight) {
    return (
      <div className={styles.container}>
        {!isExpanded ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className={styles.expandButton}
          >
            {STR.play.saveAName}
          </button>
        ) : (
          <div className={styles.inputContainer}>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter creature name..."
              className={styles.input}
              autoFocus
            />
            <div className={styles.buttonGroup}>
              <button onClick={handleSave} className={styles.saveButton}>
                {STR.play.save}
              </button>
              <button onClick={handleSkip} className={styles.skipButton}>
                {STR.play.skip}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!showRevealedName ? (
        <button onClick={handleReveal} className={styles.revealButton}>
          {STR.play.revealName}
        </button>
      ) : (
        <div className={styles.revealedName} aria-live="polite">
          <strong>"{existingName?.text}"</strong>
        </div>
      )}
    </div>
  );
}