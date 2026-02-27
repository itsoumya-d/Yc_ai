import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const variantClasses: Record<string, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
  link: 'border-none bg-transparent text-blue-600 hover:underline p-0 h-auto',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-9 w-9 p-0',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
