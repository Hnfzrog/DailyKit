import { useState, useEffect } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export interface GameScores {
  coinrush_best: number;
  typedash_best: number;
}

const STORAGE_KEY = 'fx_games';
const DEFAULT_SCORES: GameScores = {
  coinrush_best: 0,
  typedash_best: 0
};

export function useGames() {
  const [scores, setScores] = useState<GameScores>(() =>
    storageGet<GameScores>(STORAGE_KEY, DEFAULT_SCORES)
  );

  useEffect(() => {
    storageSet(STORAGE_KEY, scores);
  }, [scores]);

  function updateBest(game: keyof GameScores, score: number) {
    setScores((prev) => {
      if (score <= prev[game]) return prev;
      return { ...prev, [game]: score };
    });
  }

  return { scores, updateBest };
}
