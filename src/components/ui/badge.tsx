import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-orange-500 text-white shadow-xs',
    secondary: 'border-transparent bg-stone-100 text-stone-900',
    destructive: 'border-transparent bg-red-500 text-white',
    outline: 'text-stone-950 border-stone-200',
    success: 'border-transparent bg-emerald-500 text-white',
    warning: 'border-transparent bg-amber-500 text-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
