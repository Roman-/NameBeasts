import React from 'react';
import { Player } from '../../types';
import { STR } from '../../strings';
import styles from './PlayerChips.module.css';
import { PLAYER_COLOR_MAP, PLAYER_COLORS, PlayerColorId } from '../../data/playerIdentity';

interface PlayerChipsProps {
  players: Player[];
  selectedPlayerId?: string | null;
  onPlayerSelect: (playerId: string | null) => void;
  scores?: Record<string, number>;
  noOneScore?: number;
  currentTurnPlayerId?: string;
}

export function PlayerChips({
  players,
  selectedPlayerId,
  onPlayerSelect,
  scores = {},
  noOneScore = 0,
  currentTurnPlayerId
}: PlayerChipsProps) {
  const getColorForPlayer = (player: Player) =>
    PLAYER_COLOR_MAP[player.colorId as PlayerColorId] ?? PLAYER_COLORS[0];

  return (
    <div className={styles.container}>
      {players.map((player) => {
        const color = getColorForPlayer(player);
        const isSelected = selectedPlayerId === player.id;
        const isCurrentTurn = currentTurnPlayerId === player.id;
        const score = scores[player.id] ?? 0;
        const pointsLabel = STR.play.points(score);

        return (
          <button
            key={player.id}
            onClick={() => onPlayerSelect(player.id)}
            className={`${styles.chip} ${isSelected ? styles.selected : ''} ${
              isCurrentTurn ? styles.currentTurn : ''
            }`}
            aria-label={`${STR.play.playerAria(player.name, score)}`}
            style={{
              backgroundColor: isSelected ? color.bold : color.light,
              color: isSelected ? color.textOnBold : color.textOnLight,
              borderColor: color.bold
            }}
          >
            <span className={styles.avatar} aria-hidden>
              {player.avatar}
            </span>
            <span className={styles.details}>
              <span className={styles.name}>{player.name}</span>
              <span className={styles.points} aria-hidden>
                {pointsLabel}
              </span>
            </span>
            {isCurrentTurn && (
              <span className={styles.turnBadge} aria-hidden>
                {STR.play.turnBadge}
              </span>
            )}
          </button>
        );
      })}
      <button
        onClick={() => onPlayerSelect(null)}
        className={`${styles.chip} ${styles.noOne} ${selectedPlayerId === null ? styles.selected : ''}`}
        aria-label={STR.play.noOneAria(noOneScore)}
      >
        <span className={styles.details}>
          <span className={styles.name}>{STR.play.noOne}</span>
          <span className={styles.points} aria-hidden>
            {STR.play.points(noOneScore)}
          </span>
        </span>
      </button>
    </div>
  );
}