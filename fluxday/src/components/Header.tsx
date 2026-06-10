import { formatDateLong } from '../utils/date';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <time className={styles.date} dateTime={new Date().toISOString()}>
        {formatDateLong()}
      </time>
    </header>
  );
}
