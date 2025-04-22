import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-blue-950 shadow-md rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}