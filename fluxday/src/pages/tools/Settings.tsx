import { useState } from 'react';
import { Save, Download, Upload, AlertTriangle, Trash2, Sun, Moon, Laptop } from 'lucide-react';
import { storageGet, storageSet, storageRemove, exportAllFxData, importFxData } from '../../utils/storage';
import Header from '../../components/Header';
import Card from '../../components/Card';
import styles from './Settings.module.css';

interface AppSettings {
  userName: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'there',
  theme: 'dark'
};

const CLEAR_OPTIONS = [
  { label: 'Todos & Projects', key: 'fx_todos', description: 'Removes all tasks and project tags.' },
  { label: 'Habits & Streaks', key: 'fx_habits', description: 'Removes all habit configurations and logs.' },
  { label: 'Daily Journal', key: 'fx_journal', description: 'Deletes all journal entries and mood history.' },
  { label: 'Budget & Transactions', key: 'fx_budget', description: 'Deletes all income/expense records.' },
  { label: 'Focus History', key: 'fx_focus', description: 'Clears focus logs and timer settings.' },
  { label: 'Game Scores', key: 'fx_games', description: 'Resets all game high scores.' }
];

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>(() =>
    storageGet<AppSettings>('fx_settings', DEFAULT_SETTINGS)
  );

  const [userNameInput, setUserNameInput] = useState(settings.userName);
  
  // Confirmation Modal state
  const [showModal, setShowModal] = useState(false);
  const [targetClearKey, setTargetClearKey] = useState<string | 'all' | null>(null);
  const [targetLabel, setTargetLabel] = useState('');

  // Handle setting updates
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    storageSet('fx_settings', next);

    // If changing theme, apply it immediately
    if (key === 'theme') {
      const themeVal = value as AppSettings['theme'];
      if (themeVal === 'light') {
        document.documentElement.classList.add('light');
      } else if (themeVal === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (!prefersDark) {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    updateSetting('userName', userNameInput.trim() || 'there');
    alert('User name updated!');
  };

  // Export data
  const handleExport = () => {
    const data = exportAllFxData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'fluxday_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import data
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          importFxData(parsed);
          alert('Data successfully imported! The app will reload now.');
          window.location.reload();
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Clear confirmation triggers
  const triggerClear = (key: string | 'all', label: string) => {
    setTargetClearKey(key);
    setTargetLabel(label);
    setShowModal(true);
  };

  const executeClear = () => {
    if (!targetClearKey) return;
    
    if (targetClearKey === 'all') {
      // Clear all fx_ prefixed keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fx_')) {
          storageRemove(key);
        }
      }
      alert('All Fluxday data has been reset. The app will reload now.');
      window.location.reload();
    } else {
      storageRemove(targetClearKey);
      alert(`${targetLabel} cleared successfully.`);
      setShowModal(false);
      setTargetClearKey(null);
      setTargetLabel('');
    }
  };

  return (
    <div className={styles.page}>
      <Header title="Settings" subtitle="Personalize Fluxday and manage your local database" />

      <div className={styles.layout}>
        {/* Left Column: Personalization & Theme */}
        <div className={styles.column}>
          {/* User Profile Settings */}
          <Card>
            <h3 className={styles.sectionTitle}>Profile Configuration</h3>
            <form onSubmit={handleSaveName} className={styles.nameForm}>
              <div className={styles.formGroup}>
                <label htmlFor="settings-user-name" className={styles.label}>Your Name</label>
                <input
                  id="settings-user-name"
                  type="text"
                  placeholder="e.g. Alex"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" className={styles.saveBtn} aria-label="Save profile name">
                <Save size={16} /> Save Profile
              </button>
            </form>
          </Card>

          {/* Theme/Appearance Settings */}
          <Card>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <div className={styles.themeGrid}>
              <button
                className={[styles.themeBtn, settings.theme === 'light' ? styles.themeActive : ''].join(' ')}
                onClick={() => updateSetting('theme', 'light')}
                aria-label="Light theme"
                aria-pressed={settings.theme === 'light'}
              >
                <Sun size={20} />
                <span>Light</span>
              </button>
              <button
                className={[styles.themeBtn, settings.theme === 'dark' ? styles.themeActive : ''].join(' ')}
                onClick={() => updateSetting('theme', 'dark')}
                aria-label="Dark theme"
                aria-pressed={settings.theme === 'dark'}
              >
                <Moon size={20} />
                <span>Dark</span>
              </button>
              <button
                className={[styles.themeBtn, settings.theme === 'system' ? styles.themeActive : ''].join(' ')}
                onClick={() => updateSetting('theme', 'system')}
                aria-label="System theme"
                aria-pressed={settings.theme === 'system'}
              >
                <Laptop size={20} />
                <span>System</span>
              </button>
            </div>
          </Card>

          {/* Data Backup & Restore */}
          <Card>
            <h3 className={styles.sectionTitle}>Data Portability</h3>
            <p className={styles.sectionDesc}>
              Since Fluxday runs entirely in your browser, backing up your data regularly is highly recommended.
            </p>
            <div className={styles.backupActions}>
              <button onClick={handleExport} className={styles.exportBtn} aria-label="Export backup as JSON">
                <Download size={16} /> Export Backup (JSON)
              </button>
              <label className={styles.importBtnLabel}>
                <Upload size={16} /> Import Backup (JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className={styles.fileInput}
                />
              </label>
            </div>
          </Card>
        </div>

        {/* Right Column: Danger Zone / Clearing Data */}
        <div className={styles.column}>
          <Card className={styles.dangerCard}>
            <div className={styles.dangerHeader}>
              <AlertTriangle color="var(--color-danger)" size={24} />
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
            </div>
            <p className={styles.sectionDesc}>
              These actions are permanent. Data deleted here cannot be restored unless you have a recent backup file.
            </p>

            <div className={styles.clearOptions}>
              {CLEAR_OPTIONS.map((opt) => (
                <div key={opt.key} className={styles.clearRow}>
                  <div className={styles.clearMeta}>
                    <span className={styles.clearLabel}>{opt.label}</span>
                    <span className={styles.clearDesc}>{opt.description}</span>
                  </div>
                  <button
                    onClick={() => triggerClear(opt.key, opt.label)}
                    className={styles.clearBtn}
                    aria-label={`Clear ${opt.label}`}
                  >
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.fullResetRow}>
              <button
                onClick={() => triggerClear('all', 'Entire Application Data')}
                className={styles.fullResetBtn}
                aria-label="Full reset database"
              >
                <AlertTriangle size={16} /> Full Reset (Delete Everything)
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <AlertTriangle color="var(--color-danger)" size={32} />
              <h4>Confirm Action</h4>
            </div>
            <p className={styles.modalText}>
              Are you absolutely sure you want to delete <strong>{targetLabel}</strong>?
              This action is irreversible.
            </p>
            <div className={styles.modalActions}>
              <button onClick={executeClear} className={styles.modalConfirmBtn} aria-label="Confirm deletion">
                Yes, Delete
              </button>
              <button onClick={() => setShowModal(false)} className={styles.modalCancelBtn} aria-label="Cancel deletion">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
