import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full
        px-4 py-2
        rounded-md
        shadow-sm
        focus:outline-none focus:ring-0
        ${className}
      `}
      {...props}
    />
  );
}
