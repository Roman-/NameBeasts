import React from 'react';
import { Player } from '../../types';
import { STR } from '../../strings';
import styles from './PlayerChips.module.css';
import { PLAYER_COLOR_MAP, PLAYER_COLORS, PlayerColorId } from '../../data/playerIdentity';

interface PlayerChipsProps {
  players: Player[];
  selectedPlayerId?: string | null;
  onPlayerSelect: (playerId: string | null) => void;
}

export function PlayerChips({ players, selectedPlayerId, onPlayerSelect }: PlayerChipsProps) {
  const getColorForPlayer = (player: Player) =>
    PLAYER_COLOR_MAP[player.colorId as PlayerColorId] ?? PLAYER_COLORS[0];

  return (
    <div className={styles.container}>
      {players.map((player) => {
        const color = getColorForPlayer(player);
        const isSelected = selectedPlayerId === player.id;

        return (
          <button
            key={player.id}
            onClick={() => onPlayerSelect(player.id)}
            className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
            aria-label={`Player: ${player.name}`}
            style={{
              backgroundColor: isSelected ? color.bold : color.light,
              color: isSelected ? color.textOnBold : color.textOnLight,
              borderColor: color.bold
            }}
          >
            <span className={styles.avatar} aria-hidden>
              {player.avatar}
            </span>
            <span className={styles.name}>{player.name}</span>
          </button>
        );
      })}
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