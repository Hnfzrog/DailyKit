import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { storageGet } from './utils/storage';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Todos from './pages/tools/Todos';
import Habits from './pages/tools/Habits';
import Journal from './pages/tools/Journal';
import Budget from './pages/tools/Budget';
import Focus from './pages/tools/Focus';
import Notes from './pages/tools/Notes';
import QR from './pages/tools/QR';
import Games from './pages/tools/games/Games';
import CoinRush from './pages/tools/games/CoinRush';
import TypeDash from './pages/tools/games/TypeDash';
import Settings from './pages/tools/Settings';
import styles from './App.module.css';

export default function App() {
  useEffect(() => {
    const settings = storageGet<{ theme?: string }>('fx_settings', {});
    const theme = settings.theme ?? 'dark';
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!prefersDark) document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  return (
    <BrowserRouter>
      <div className={styles.appShell}>
        <Sidebar />
        <main className={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tools/todos" element={<Todos />} />
            <Route path="/tools/habits" element={<Habits />} />
            <Route path="/tools/journal" element={<Journal />} />
            <Route path="/tools/budget" element={<Budget />} />
            <Route path="/tools/focus" element={<Focus />} />
            <Route path="/tools/notes" element={<Notes />} />
            <Route path="/tools/qr" element={<QR />} />
            <Route path="/tools/games" element={<Games />} />
            <Route path="/tools/games/coinrush" element={<CoinRush />} />
            <Route path="/tools/games/typedash" element={<TypeDash />} />
            <Route path="/tools/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
