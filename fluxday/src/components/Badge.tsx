import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type Variant = 'accent' | 'success' | 'danger' | 'warning' | 'muted';
type Size = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

export default function Badge({ children, variant = 'accent', size = 'sm' }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant], styles[size]].join(' ')}>
      {children}
    </span>
  );
}
