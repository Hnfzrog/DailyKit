import { useEffect, useRef, useState } from 'react';
import { useGames } from '../../../stores/games';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import styles from './CoinRush.module.css';

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

interface Coin {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

export default function CoinRush() {
  const { scores, updateBest } = useGames();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  
  // References to keep game loop variables without triggering re-renders
  const stateRef = useRef({
    gameState: 'idle',
    score: 0,
    playerX: 180,
    playerY: 460,
    playerWidth: 40,
    playerHeight: 20,
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    speedMultiplier: 1,
    frameCount: 0,
    keys: {} as Record<string, boolean>
  });

  const animIdRef = useRef<number | null>(null);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      stateRef.current.keys[e.key] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse/Touch controls inside Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rootX = e.clientX - rect.left;
    // Scale position matching canvas resolution
    const scaleX = canvasRef.current.width / rect.width;
    const x = rootX * scaleX;
    
    // Clamp playerX inside bounds
    stateRef.current.playerX = Math.max(0, Math.min(canvasRef.current.width - stateRef.current.playerWidth, x - stateRef.current.playerWidth / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing' || !canvasRef.current || e.touches.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rootX = e.touches[0].clientX - rect.left;
    const scaleX = canvasRef.current.width / rect.width;
    const x = rootX * scaleX;
    
    stateRef.current.playerX = Math.max(0, Math.min(canvasRef.current.width - stateRef.current.playerWidth, x - stateRef.current.playerWidth / 2));
  };

  const startGame = () => {
    stateRef.current = {
      gameState: 'playing',
      score: 0,
      playerX: 180,
      playerY: 460,
      playerWidth: 40,
      playerHeight: 20,
      obstacles: [],
      coins: [],
      speedMultiplier: 1,
      frameCount: 0,
      keys: {}
    };
    setScore(0);
    setGameState('playing');
  };

  // Main game loop
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
      state.frameCount++;

      // 1. Update difficulty
      if (state.frameCount % 500 === 0) {
        state.speedMultiplier += 0.15;
      }

      // 2. Clear canvas
      ctx.fillStyle = '#0f1117'; // --color-bg
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background grid lines for a retro vibe
      ctx.strokeStyle = '#1a1d27'; // --color-surface
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 3. Spawn obstacles & coins
      if (state.frameCount % Math.max(30, Math.floor(60 / state.speedMultiplier)) === 0) {
        // Spawn obstacle
        state.obstacles.push({
          x: Math.random() * (canvas.width - 30),
          y: -30,
          width: 20 + Math.random() * 20,
          height: 15 + Math.random() * 15,
          speed: (2 + Math.random() * 2) * state.speedMultiplier
        });
      }

      if (state.frameCount % Math.max(40, Math.floor(80 / state.speedMultiplier)) === 0) {
        // Spawn coin
        state.coins.push({
          x: 15 + Math.random() * (canvas.width - 30),
          y: -15,
          radius: 8,
          speed: (1.5 + Math.random() * 1.5) * state.speedMultiplier
        });
      }

      // 4. Keyboard player movement
      const moveSpeed = 6;
      if (state.keys['ArrowLeft'] || state.keys['a'] || state.keys['A']) {
        state.playerX = Math.max(0, state.playerX - moveSpeed);
      }
      if (state.keys['ArrowRight'] || state.keys['d'] || state.keys['D']) {
        state.playerX = Math.min(canvas.width - state.playerWidth, state.playerX + moveSpeed);
      }

      // 5. Draw Player (Futuristic jet theme)
      ctx.fillStyle = '#7b68ee'; // --color-accent
      ctx.beginPath();
      // Draw wings triangle
      ctx.moveTo(state.playerX, state.playerY + state.playerHeight);
      ctx.lineTo(state.playerX + state.playerWidth / 2, state.playerY);
      ctx.lineTo(state.playerX + state.playerWidth, state.playerY + state.playerHeight);
      ctx.closePath();
      ctx.fill();

      // Wing glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#7b68ee';
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(state.playerX + state.playerWidth / 2 - 4, state.playerY + 4, 8, 8);
      ctx.shadowBlur = 0; // reset shadow

      // 6. Update & Draw Obstacles
      ctx.fillStyle = '#f87171'; // --color-danger
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += obs.speed;

        // Render obstacle (dangerous spike block)
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        // Check crash collision
        const playerY = canvas.height - 40;
        state.playerY = playerY; // sync player Y position
        
        if (
          obs.x < state.playerX + state.playerWidth &&
          obs.x + obs.width > state.playerX &&
          obs.y < playerY + state.playerHeight &&
          obs.y + obs.height > playerY
        ) {
          // Collision! Game Over
          setGameState('gameover');
          updateBest('coinrush_best', state.score);
          return;
        }

        // Clean off-screen
        if (obs.y > canvas.height) {
          state.obstacles.splice(i, 1);
        }
      }

      // 7. Update & Draw Coins
      ctx.fillStyle = '#fbbf24'; // --color-warning / Gold
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#fbbf24';
      
      for (let i = state.coins.length - 1; i >= 0; i--) {
        const coin = state.coins[i];
        coin.y += coin.speed;

        // Draw Gold Coin circle
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw dollar sign/core
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', coin.x, coin.y);
        ctx.fillStyle = '#fbbf24'; // restore fill

        const playerY = canvas.height - 40;

        // Collision Check (circle to AABB rect)
        const closestX = Math.max(state.playerX, Math.min(coin.x, state.playerX + state.playerWidth));
        const closestY = Math.max(playerY, Math.min(coin.y, playerY + state.playerHeight));
        const distanceX = coin.x - closestX;
        const distanceY = coin.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < (coin.radius * coin.radius)) {
          // Collected coin!
          state.score += 1;
          setScore(state.score);
          state.coins.splice(i, 1);
        } else if (coin.y > canvas.height) {
          state.coins.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0; // reset shadow

      // 8. Render HUD info
      ctx.fillStyle = '#e2e4ed'; // --color-text
      ctx.font = '14px "DM Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${state.score}`, 15, 25);
      
      ctx.textAlign = 'right';
      ctx.fillText(`BEST: ${scores.coinrush_best}`, canvas.width - 15, 25);

      animIdRef.current = requestAnimationFrame(gameLoop);
    };

    animIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [gameState, scores.coinrush_best, updateBest]);

  return (
    <div className={styles.page}>
      <Header title="CoinRush" subtitle="Use Arrow keys or drag cursor left/right to move" />

      <div className={styles.layout}>
        <Card className={styles.gameCard}>
          <div className={styles.canvasContainer}>
            <canvas
              ref={canvasRef}
              width={400}
              height={500}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className={styles.canvas}
            />

            {gameState === 'idle' && (
              <div className={styles.overlay}>
                <h2 className={styles.overlayTitle}>CoinRush</h2>
                <p className={styles.overlayText}>Dodge spikes, gather gold coins.</p>
                <button onClick={startGame} className={styles.startBtn} aria-label="Start Game">
                  Start Game
                </button>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className={styles.overlay}>
                <h2 className={[styles.overlayTitle, styles.dangerText].join(' ')}>GAME OVER</h2>
                <div className={styles.gameOverStats}>
                  <p>Your Score: <strong>{score}</strong></p>
                  <p>Personal Best: <strong>{scores.coinrush_best}</strong></p>
                </div>
                <button onClick={startGame} className={styles.restartBtn} aria-label="Play Again">
                  Play Again
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
