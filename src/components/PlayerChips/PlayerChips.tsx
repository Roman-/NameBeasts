import React from 'react';
import { Player } from '../../types';
import { STR } from '../../strings';
import styles from './PlayerChips.module.css';

interface PlayerChipsProps {
  players: Player[];
  selectedPlayerId?: string | null;
  onPlayerSelect: (playerId: string | null) => void;
}

export function PlayerChips({ players, selectedPlayerId, onPlayerSelect }: PlayerChipsProps) {
  return (
    <div className={styles.container}>
      {players.map((player) => (
        <button
          key={player.id}
          onClick={() => onPlayerSelect(player.id)}
          className={`${styles.chip} ${selectedPlayerId === player.id ? styles.selected : ''}`}
          aria-label={`Player: ${player.name}`}
        >
          {player.name}
        </button>
      ))}
      <button
        onClick={() => onPlayerSelect(null)}
        className={`${styles.chip} ${styles.noOne} ${selectedPlayerId === null ? styles.selected : ''}`}
        aria-label="No one"
      >
        {STR.play.noOne}
      </button>
    </div>
  );
}