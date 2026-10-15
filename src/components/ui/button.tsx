import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'whatsapp';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none min-h-[44px] cursor-pointer active:scale-[0.98]';

    const variants = {
      default: 'bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:bg-orange-600',
      destructive: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
      outline: 'border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 shadow-xs',
      secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
      ghost: 'hover:bg-stone-100 text-stone-700',
      link: 'text-orange-600 underline-offset-4 hover:underline min-h-0',
      whatsapp: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700',
    };

    const sizes = {
      default: 'h-11 px-5 py-2.5',
      sm: 'h-9 rounded-lg px-3 text-xs min-h-[36px]',
      lg: 'h-13 rounded-2xl px-8 text-base min-h-[48px]',
      icon: 'h-11 w-11 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
