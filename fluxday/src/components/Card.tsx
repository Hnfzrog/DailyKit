import type { ReactNode, CSSProperties } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  hoverable?: boolean;
  padding?: string;
  style?: CSSProperties;
  className?: string;
}

export default function Card({
  children,
  hoverable = false,
  padding,
  style,
  className = ''
}: CardProps) {
  return (
    <div
      className={[styles.card, hoverable ? styles.hoverable : '', className].join(' ')}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
