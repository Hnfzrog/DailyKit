import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, ArrowRight, Zap } from 'lucide-react';
import { useGames } from '../../../stores/games';
import Header from '../../../components/Header';
import Card from '../../../components/Card';
import styles from './Games.module.css';

export default function Games() {
  const { scores } = useGames();

  return (
    <div className={styles.page}>
      <Header title="Games Hub" subtitle="Relax and train your reflexes during breaks" />

      <div className={styles.layout}>
        {/* CoinRush Hub Card */}
        <Card hoverable className={styles.gameCard}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <Gamepad2 size={32} color="var(--color-warning)" />
          </div>
          <div className={styles.gameInfo}>
            <h3 className={styles.gameTitle}>CoinRush</h3>
            <p className={styles.gameDesc}>
              A retro arcade style dodging game. Dodge obstacles, collect coins, and survive as the speed increases!
            </p>
            <div className={styles.scoreRow}>
              <Trophy size={16} color="var(--color-warning)" />
              <span className={styles.scoreLabel}>High Score:</span>
              <span className={styles.scoreVal}>{scores.coinrush_best} coins</span>
            </div>
            <Link to="/tools/games/coinrush" className={styles.playBtn} aria-label="Play CoinRush">
              Play CoinRush <ArrowRight size={16} />
            </Link>
          </div>
        </Card>

        {/* TypeDash Hub Card */}
        <Card hoverable className={styles.gameCard}>
          <div className={styles.iconWrapper} style={{ background: 'rgba(123, 104, 238, 0.15)' }}>
            <Zap size={32} color="var(--color-accent)" />
          </div>
          <div className={styles.gameInfo}>
            <h3 className={styles.gameTitle}>TypeDash</h3>
            <p className={styles.gameDesc}>
              Test your typing speed and reflexes. Type falling words before they hit the ground. Build combos for max score!
            </p>
            <div className={styles.scoreRow}>
              <Trophy size={16} color="var(--color-accent)" />
              <span className={styles.scoreLabel}>High Score:</span>
              <span className={styles.scoreVal}>{scores.typedash_best} words</span>
            </div>
            <Link to="/tools/games/typedash" className={styles.playBtn} aria-label="Play TypeDash">
              Play TypeDash <ArrowRight size={16} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
