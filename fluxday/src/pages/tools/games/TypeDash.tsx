import { useEffect, useRef, useState } from 'react';
import { useGames } from '../../../stores/games';
import { genId } from '../../../utils/format';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import styles from './TypeDash.module.css';

interface FallingWord {
  id: string;
  text: string;
  x: number;
  y: number;
  speed: number;
  color: string;
}

const COMMON_WORDS = [
  'the', 'of', 'to', 'and', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i',
  'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said',
  'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so',
  'some', 'her', 'would', 'make', 'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'people',
  'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part',
  'over', 'new', 'sound', 'take', 'only', 'little', 'work', 'know', 'place', 'years', 'live', 'me', 'back', 'give', 'most', 'very', 'after', 'thing', 'our', 'just',
  'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where', 'help', 'through', 'much', 'before', 'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell',
  'boy', 'follow', 'came', 'want', 'show', 'also', 'around', 'form', 'three', 'small', 'set', 'put', 'end', 'does', 'another', 'well', 'large', 'must', 'big', 'even',
  'such', 'because', 'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land', 'different', 'home', 'us', 'move', 'try', 'kind', 'hand', 'picture', 'again',
  'change', 'off', 'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study', 'still', 'learn', 'should', 'america', 'world'
];

const COLORS = ['#7b68ee', '#4ade80', '#fbbf24', '#e2e4ed', '#60a5fa', '#a78bfa'];

export default function TypeDash() {
  const { scores, updateBest } = useGames();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [typedText, setTypedText] = useState('');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [wpm, setWpm] = useState(0);

  // References to keep game loop variables sync and performant
  const stateRef = useRef({
    gameState: 'idle',
    words: [] as FallingWord[],
    score: 0,
    combo: 1,
    misses: 0,
    wordsTyped: 0,
    startTime: 0,
    lastSpawnTime: 0,
    spawnInterval: 2500, // ms
    baseSpeed: 0.8,
    difficultyMultiplier: 1
  });

  const animIdRef = useRef<number | null>(null);

  const startGame = () => {
    stateRef.current = {
      gameState: 'playing',
      words: [],
      score: 0,
      combo: 1,
      misses: 0,
      wordsTyped: 0,
      startTime: Date.now(),
      lastSpawnTime: 0,
      spawnInterval: 2500,
      baseSpeed: 0.8,
      difficultyMultiplier: 1
    };

    setScore(0);
    setCombo(1);
    setWpm(0);
    setTypedText('');
    setGameState('playing');
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle word input submissions (Space or Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const word = typedText.trim().toLowerCase();
      if (!word) return;

      const state = stateRef.current;
      // Find the lowest word matching the typed text
      let matchedIndex = -1;
      let lowestY = -1;

      for (let i = 0; i < state.words.length; i++) {
        if (state.words[i].text === word) {
          if (state.words[i].y > lowestY) {
            lowestY = state.words[i].y;
            matchedIndex = i;
          }
        }
      }

      if (matchedIndex !== -1) {
        // Correct match!
        state.wordsTyped += 1;
        state.score += 1 * state.combo;
        state.combo = Math.min(4, state.combo + 1);
        state.words.splice(matchedIndex, 1);
        
        setScore(state.score);
        setCombo(state.combo);
      } else {
        // Wrong match -> Reset combo
        state.combo = 1;
        setCombo(1);
      }

      setTypedText('');
    }
  };

  // Main canvas animation loop
  useEffect(() => {
    stateRef.current.gameState = gameState;
    if (gameState !== 'playing') {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const state = stateRef.current;
      const now = Date.now();
      const elapsed = (now - state.startTime) / 1000; // seconds

      // 1. Difficulty increases every 30 seconds
      const speedPhase = Math.floor(elapsed / 30);
      state.difficultyMultiplier = 1 + speedPhase * 0.25;
      state.spawnInterval = Math.max(1000, 2500 - speedPhase * 300);

      // 2. Spawn word if interval elapsed
      if (now - state.lastSpawnTime > state.spawnInterval) {
        const randWord = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
        ctx.font = 'bold 16px "DM Mono", monospace';
        const wordWidth = ctx.measureText(randWord).width;
        
        state.words.push({
          id: genId(),
          text: randWord,
          x: Math.max(10, Math.random() * (canvas.width - wordWidth - 20)),
          y: -10,
          speed: (state.baseSpeed + Math.random() * 0.4) * state.difficultyMultiplier,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
        state.lastSpawnTime = now;
      }

      // 3. Clear canvas
      ctx.fillStyle = '#0f1117'; // --color-bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw danger zone line at the bottom
      ctx.strokeStyle = 'rgba(248, 113, 113, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 40);
      ctx.lineTo(canvas.width, canvas.height - 40);
      ctx.stroke();

      // 4. Update and Draw active words
      for (let i = state.words.length - 1; i >= 0; i--) {
        const word = state.words[i];
        word.y += word.speed;

        // Draw text
        ctx.fillStyle = word.color;
        ctx.font = 'bold 16px "DM Mono", monospace';
        ctx.fillText(word.text, word.x, word.y);

        // Check if word hit bottom line
        if (word.y >= canvas.height - 45) {
          state.misses += 1;
          state.combo = 1;
          
           setCombo(1);
          state.words.splice(i, 1);

          if (state.misses >= 5) {
            // Game Over
            setGameState('gameover');
            updateBest('typedash_best', state.score);
            
            // Calculate WPM
            const totalMin = elapsed / 60;
            const finalWpm = totalMin > 0 ? Math.round(state.wordsTyped / totalMin) : state.wordsTyped;
            setWpm(finalWpm);
            return;
          }
        }
      }

      // 5. Draw HUD stats on Canvas
      ctx.fillStyle = 'rgba(226, 228, 237, 0.6)';
      ctx.font = '12px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${state.score} (x${state.combo})`, 10, 20);
      
      ctx.textAlign = 'right';
      ctx.fillText(`MISSES: ${state.misses}/5`, canvas.width - 10, 20);

      animIdRef.current = requestAnimationFrame(gameLoop);
    };

    animIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, updateBest]);

  return (
    <div className={styles.page}>
      <Header title="TypeDash" subtitle="Type words and hit Space or Enter to clear them" />

      <div className={styles.layout}>
        <Card className={styles.gameCard}>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              width={400}
              height={500}
              className={styles.canvas}
            />

            {gameState === 'idle' && (
              <div className={styles.overlay}>
                <h2 className={styles.overlayTitle}>TypeDash</h2>
                <p className={styles.overlayText}>
                  Type falling words before they hit the ground. Keep combos for higher scores.
                </p>
                <button onClick={startGame} className={styles.startBtn} aria-label="Start Game">
                  Start Game
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className={styles.overlay}>
                <h2 className={[styles.overlayTitle, styles.dangerText].join(' ')}>GAME OVER</h2>
                <div className={styles.gameOverStats}>
                  <p>Score: <strong>{score}</strong></p>
                  <p>WPM: <strong>{wpm}</strong></p>
                  <p>Personal Best: <strong>{scores.typedash_best} words</strong></p>
                </div>
                <button onClick={startGame} className={styles.restartBtn} aria-label="Play Again">
                  Play Again
                </button>
              </div>
            )}
          </div>

          {gameState === 'playing' && (
            <div className={styles.inputArea}>
              <div className={styles.comboBadge}>
                Combo: x{combo}
              </div>
              <input
                ref={inputRef}
                id="typedash-word-input"
                type="text"
                className={styles.wordInput}
                placeholder="Type here..."
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                autoFocus
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
