import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
        ghost:
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
        link:
          'text-primary underline-offset-4 hover:underline active:text-primary/80',
        success:
          'bg-success text-success-foreground hover:bg-success/90 active:bg-success/80',
        info:
          'bg-info text-info-foreground hover:bg-info/90 active:bg-info/80',
        warning:
          'bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80',
        premium:
          'bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0 hover:from-primary-600 hover:to-secondary-600 active:from-primary-700 active:to-secondary-700 shadow-md hover:shadow-lg',
        bordered: 
          'bg-transparent border-2 border-current text-primary hover:bg-primary/10 active:bg-primary/20',
        glass:
          'backdrop-blur-md bg-white/70 dark:bg-black/70 border border-white/20 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
        xs: 'h-8 rounded-sm px-2 text-xs',
        xl: 'h-14 rounded-md px-10 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      rounded: {
        true: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      rounded: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, rounded, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants } 