import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        "bg-gradient-to-r from-muted via-muted/80 to-muted",
        "animate-[pulse_1.5s_cubic-bezier(0.4,_0,_0.6,_1)_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton } 