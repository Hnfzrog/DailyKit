import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Plus, Trash2, QrCode as QrIcon } from 'lucide-react';
import { storageGet, storageSet } from '../../utils/storage';
import { genId } from '../../utils/format';
import Header from '../../components/Header';
import Card from '../../components/Card';
import styles from './QR.module.css';

interface QREntry {
  id: string;
  text: string;
  label: string;
  timestamp: string;
}

const STORAGE_KEY = 'fx_qr';

export default function QR() {
  const [history, setHistory] = useState<QREntry[]>(() =>
    storageGet<QREntry[]>(STORAGE_KEY, [])
  );

  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [activeText, setActiveText] = useState<string>('');
  const [activeLabel, setActiveLabel] = useState<string>('');

  useEffect(() => {
    storageSet(STORAGE_KEY, history);
  }, [history]);

  // Load the first history item on mount if available
  useEffect(() => {
    if (history.length > 0 && !activeText) {
      handleLoad(history[0]);
    }
  }, [history]);

  // Regenerate QR when activeText changes
  useEffect(() => {
    if (activeText) {
      QRCode.toDataURL(
        activeText,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#1a1d27',  // match card background for a neat contrast
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrUrl(url);
          }
        }
      );
    } else {
      setQrUrl('');
    }
  }, [activeText]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) return;

    const cleanLabel = label.trim() || cleanText;
    const newEntry: QREntry = {
      id: genId(),
      text: cleanText,
      label: cleanLabel,
      timestamp: new Date().toLocaleString()
    };

    // Prepend to history, max 10 entries
    setHistory((prev) => [newEntry, ...prev.slice(0, 9)]);
    setActiveText(cleanText);
    setActiveLabel(cleanLabel);
    
    setText('');
    setLabel('');
  }

  function handleLoad(entry: QREntry) {
    setActiveText(entry.text);
    setActiveLabel(entry.label);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (history.length > 0 && history[0].id === id) {
      setActiveText('');
      setActiveLabel('');
    }
  }

  function handleDownload() {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr_${activeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className={styles.page}>
      <Header title="QR Generator" subtitle="Generate & download QR codes for URLs and text" />

      <div className={styles.layout}>
        {/* Left side: Generator and active display */}
        <div className={styles.generatorPane}>
          <Card>
            <h3 className={styles.sectionTitle}>Generate Code</h3>
            <form onSubmit={handleGenerate} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="qr-text" className={styles.label}>URL or Text</label>
                <input
                  id="qr-text"
                  type="text"
                  placeholder="https://example.com or any text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="qr-label" className={styles.label}>Label (optional)</label>
                <input
                  id="qr-label"
                  type="text"
                  placeholder="e.g. Portfolio Website"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.submitBtn} aria-label="Generate QR code">
                <Plus size={16} /> Generate QR
              </button>
            </form>
          </Card>

          {activeText && (
            <Card className={styles.qrDisplayCard}>
              <h3 className={styles.sectionTitle}>{activeLabel}</h3>
              <p className={styles.activeTextDisplay}>{activeText}</p>
              
              {qrUrl && (
                <div className={styles.qrWrapper}>
                  <img src={qrUrl} alt="Generated QR Code" className={styles.qrImg} />
                </div>
              )}

              <button onClick={handleDownload} className={styles.downloadBtn} aria-label="Download QR code as PNG">
                <Download size={16} /> Download PNG
              </button>
            </Card>
          )}
        </div>

        {/* Right side: History list */}
        <div className={styles.historyPane}>
          <Card className={styles.historyCard}>
            <h3 className={styles.sectionTitle}>Recent Codes</h3>
            {history.length === 0 ? (
              <div className={styles.empty}>No codes generated yet.</div>
            ) : (
              <div className={styles.historyList}>
                {history.map((entry) => {
                  const isActive = entry.text === activeText && entry.label === activeLabel;
                  return (
                    <div
                      key={entry.id}
                      onClick={() => handleLoad(entry)}
                      className={[styles.historyItem, isActive ? styles.historyActive : ''].join(' ')}
                    >
                      <QrIcon size={20} className={styles.historyIcon} />
                      <div className={styles.historyMeta}>
                        <span className={styles.historyLabel}>{entry.label}</span>
                        <span className={styles.historyTime}>{entry.timestamp}</span>
                      </div>
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        className={styles.deleteBtn}
                        aria-label={`Delete history item ${entry.label}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
