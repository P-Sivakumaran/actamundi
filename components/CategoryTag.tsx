'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CategoryTagProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'outline';
  className?: string;
  href?: string;
}

// Define category-specific colors with improved contrast
const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
  Culture: { 
    bg: 'bg-blue-50 dark:bg-blue-900/40', 
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700'
  },
  Politics: { 
    bg: 'bg-purple-50 dark:bg-purple-900/40', 
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-700'
  },
  Ideas: { 
    bg: 'bg-emerald-50 dark:bg-emerald-900/40', 
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700'
  },
  Technology: { 
    bg: 'bg-indigo-50 dark:bg-indigo-900/40', 
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-700'
  },
  Science: { 
    bg: 'bg-teal-50 dark:bg-teal-900/40', 
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-300 dark:border-teal-700'
  },
  Business: { 
    bg: 'bg-amber-50 dark:bg-amber-900/40', 
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700'
  }
};

// Default color for categories not in the map
const defaultColor = { 
  bg: 'bg-gray-50 dark:bg-gray-800/40', 
  text: 'text-gray-800 dark:text-gray-300',
  border: 'border-gray-300 dark:border-gray-700'
};

export function CategoryTag({ 
  category, 
  size = 'md', 
  variant = 'default',
  className,
  href
}: CategoryTagProps) {
  const colorScheme = categoryColors[category] || defaultColor;
  
  // Size variations with improved alignment 
  const sizeClasses = {
    sm: 'text-fluid-xs px-2 py-0.5 min-w-[70px] inline-flex justify-center',
    md: 'text-fluid-sm px-2.5 py-1 min-w-[85px] inline-flex justify-center',
    lg: 'text-fluid-base px-3 py-1.5 min-w-[100px] inline-flex justify-center'
  };
  
  // Variant styles
  const variantClasses = {
    default: cn(
      'border',
      colorScheme.bg,
      colorScheme.text,
      colorScheme.border
    ),
    subtle: cn(
      colorScheme.text,
      'bg-transparent'
    ),
    outline: cn(
      'bg-transparent border',
      colorScheme.text,
      colorScheme.border
    )
  };
  
  const tagContent = (
    <Badge
      variant="outline"
      className={cn(
        'font-medium tracking-wide uppercase rounded-md',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {category}
    </Badge>
  );
  
  // If href is provided, make it a link
  if (href) {
    return (
      <a href={href} className="inline-block no-underline">
        {tagContent}
      </a>
    );
  }
  
  return tagContent;
} 