import React from 'react';
import { Card } from '../../types';
import { STYLES } from '../../data/styles';
import { STR } from '../../strings';
import styles from './CardFrame.module.css';

interface CardFrameProps {
  card?: Card;
  animationClass?: string;
  hidden?: boolean;
  onAnimationEnd?: () => void;
}

export function CardFrame({ card, animationClass, hidden, onAnimationEnd }: CardFrameProps) {
  if (!card) {
    return (
      <div className={styles.cardFrame}>
        <div className={styles.placeholder}>
          {STR.play.noCards}
        </div>
      </div>
    );
  }

  const style = STYLES[card.style];
  const imageSrc = `${style.publicPath}/${card.creatureId}.jpg`;

  const classes = [styles.cardFrame, 'animate__animated'];
  if (animationClass) {
    classes.push(animationClass);
  }
  if (hidden) {
    classes.push(styles.hidden);
  }

  return (
    <div className={classes.join(' ')} onAnimationEnd={onAnimationEnd}>
      <img
        src={imageSrc}
        alt={`Creature ${card.creatureId}`}
        className={styles.image}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="' + styles.error + '">Image not found</div>';
          }
        }}
      />
    </div>
  );
}