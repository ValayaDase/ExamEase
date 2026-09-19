import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'easy' | 'medium' | 'hard' | 'mixed' | 'info' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
  const styles = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    hard: 'bg-rose-50 text-rose-700 border-rose-200',
    mixed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    info: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-teal-50 text-teal-700 border-teal-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
