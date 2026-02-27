import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(clsx('bg-white rounded-xl border border-gray-200 shadow-sm', className))}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={twMerge(clsx('px-6 py-4 border-b border-gray-100', className))}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div
      className={twMerge(clsx('px-6 py-4', className))}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={twMerge(clsx('text-base font-semibold text-gray-900', className))}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={twMerge(clsx('px-6 py-4 border-t border-gray-100', className))}
      {...props}
    />
  );
}
