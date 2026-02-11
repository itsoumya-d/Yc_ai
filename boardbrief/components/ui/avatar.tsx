'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);
  const initials = getInitials(name);

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={cn(
          'shrink-0 rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-800 font-medium',
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
