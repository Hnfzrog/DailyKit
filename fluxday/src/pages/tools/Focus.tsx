import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { useFocus } from '../../stores/focus';
import { todayKey } from '../../utils/date';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import ProgressRing from '../../components/ProgressRing';
import styles from './Focus.module.css';

export default function Focus() {
  const { focusData, updateSettings, logSession } = useFocus();
  const { settings, history } = focusData;

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [label, setLabel] = useState('');
  
  // Keep track of settings input values
  const [workInput, setWorkInput] = useState(settings.workMinutes);
  const [breakInput, setBreakInput] = useState(settings.breakMinutes);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound notification using Web Audio API
  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.15); // E6
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  // Handle ticking timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            playAlarm();

            if (mode === 'work') {
              // Log the session
              logSession({
                date: todayKey(),
                duration: settings.workMinutes,
                label: label.trim() || 'Focus Session',
                completedAt: new Date().toISOString()
              });
              // Switch to break
              setMode('break');
              return settings.breakMinutes * 60;
            } else {
              // Switch to work
              setMode('work');
              return settings.workMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode, settings, label, logSession]);

  // Sync timeLeft when settings change or mode changes
  useEffect(() => {
    setTimeLeft(mode === 'work' ? settings.workMinutes * 60 : settings.breakMinutes * 60);
    setIsActive(false);
  }, [settings, mode]);

  const totalSeconds = mode === 'work' ? settings.workMinutes * 60 : settings.breakMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  // Format time (mm:ss)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? settings.workMinutes * 60 : settings.breakMinutes * 60);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      workMinutes: Math.max(1, workInput),
      breakMinutes: Math.max(1, breakInput)
    });
  };

  return (
    <div className={styles.page}>
      <Header title="Focus Timer" subtitle="Pomodoro technique to stay on track" />

      <div className={styles.layout}>
        {/* Left pane: Timer and controls */}
        <div className={styles.timerPane}>
          <Card className={styles.timerCard}>
            <div className={styles.modeBadges}>
              <Badge variant={mode === 'work' ? 'accent' : 'muted'}>
                {mode === 'work' ? '💻 Work Focus' : '☕ Break Time'}
              </Badge>
            </div>

            <div className={styles.progressContainer}>
              <ProgressRing
                value={progress}
                size={220}
                strokeWidth={8}
                color={mode === 'work' ? 'var(--color-accent)' : 'var(--color-success)'}
              >
                <div className={styles.timeLabel}>
                  <div className={styles.timeValue}>{formatTime(timeLeft)}</div>
                  <div className={styles.modeLabel}>{mode === 'work' ? 'Focusing' : 'Resting'}</div>
                </div>
              </ProgressRing>
            </div>

            <div className={styles.controls}>
              <button
                className={[styles.btn, styles.startBtn].join(' ')}
                onClick={handleStartPause}
                aria-label={isActive ? 'Pause' : 'Start'}
              >
                {isActive ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                className={[styles.btn, styles.resetBtn].join(' ')}
                onClick={handleReset}
                aria-label="Reset timer"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {mode === 'work' && (
              <div className={styles.labelSection}>
                <input
                  id="focus-label-input"
                  type="text"
                  className={styles.labelInput}
                  placeholder="What are you working on?"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  disabled={isActive}
                />
              </div>
            )}
          </Card>

          {/* Settings Card */}
          <Card>
            <h3 className={styles.sectionTitle}>Timer Configuration</h3>
            <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label htmlFor="focus-work-min" className={styles.formLabel}>Work (minutes)</label>
                <input
                  id="focus-work-min"
                  type="number"
                  min="1"
                  max="120"
                  className={styles.settingsInput}
                  value={workInput}
                  onChange={(e) => setWorkInput(parseInt(e.target.value) || 25)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="focus-break-min" className={styles.formLabel}>Break (minutes)</label>
                <input
                  id="focus-break-min"
                  type="number"
                  min="1"
                  max="60"
                  className={styles.settingsInput}
                  value={breakInput}
                  onChange={(e) => setBreakInput(parseInt(e.target.value) || 5)}
                />
              </div>
              <button type="submit" className={styles.saveBtn} aria-label="Save timer settings">
                <Save size={16} /> Save Settings
              </button>
            </form>
          </Card>
        </div>

        {/* Right pane: Session history */}
        <div className={styles.historyPane}>
          <Card className={styles.historyCard}>
            <h3 className={styles.sectionTitle}>Focus History</h3>
            {history.length === 0 ? (
              <div className={styles.empty}>No completed sessions yet. You got this!</div>
            ) : (
              <div className={styles.historyListWrapper}>
                <ul className={styles.historyList}>
                  {history.map((session, index) => (
                    <li key={index} className={styles.historyItem}>
                      <div className={styles.historyMarker}>
                        <CheckCircle2 size={16} color="var(--color-success)" />
                      </div>
                      <div className={styles.historyDetails}>
                        <div className={styles.historyLabel}>{session.label}</div>
                        <div className={styles.historyMeta}>
                          {session.date} • {session.duration}m
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
