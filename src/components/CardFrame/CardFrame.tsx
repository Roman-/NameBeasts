import React, { useEffect, useState } from 'react';
import { Card } from '../../types';
import { STYLES } from '../../data/styles';
import { STR } from '../../strings';
import styles from './CardFrame.module.css';

interface CardFrameProps {
  card?: Card;
  animationClass?: string;
  onAnimationEnd?: () => void;
}

export function CardFrame({ card, animationClass, onAnimationEnd }: CardFrameProps) {
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [card.uid]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`${styles.cardFrame} animate__animated ${animationClass || ''}`} onAnimationEnd={onAnimationEnd}>
      {!hasError ? (
        <>
          <img
            src={imageSrc}
            alt={`Creature ${card.creatureId}`}
            className={`${styles.image} ${isLoaded ? styles.imageVisible : styles.imageHidden}`}
            onLoad={handleLoad}
            onError={handleError}
          />
          {!isLoaded && <div className={styles.loadingOverlay} aria-hidden />}
        </>
      ) : (
        <div className={styles.error}>Image not found</div>
      )}
    </div>
  );
}
