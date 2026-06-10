import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarCheck,
  BookOpen,
  Wallet,
  Timer,
  StickyNote,
  QrCode,
  Gamepad2,
  Settings
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/tools/todos', label: 'Todos', Icon: CheckSquare },
  { to: '/tools/habits', label: 'Habits', Icon: CalendarCheck },
  { to: '/tools/journal', label: 'Journal', Icon: BookOpen },
  { to: '/tools/budget', label: 'Budget', Icon: Wallet },
  { to: '/tools/focus', label: 'Focus', Icon: Timer },
  { to: '/tools/notes', label: 'Notes', Icon: StickyNote },
  { to: '/tools/qr', label: 'QR', Icon: QrCode },
  { to: '/tools/games', label: 'Games', Icon: Gamepad2 },
  { to: '/tools/settings', label: 'Settings', Icon: Settings }
];

export default function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <a href="/" className={styles.brand} aria-label="Fluxday home">
        <span className={styles.brandDot} />
        <span className={styles.brandName}>Fluxday</span>
      </a>
      <ul className={styles.navList}>
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
              aria-label={label}
            >
              <span className={styles.navIcon}><Icon size={18} /></span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
