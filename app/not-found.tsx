import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
        <div className="space-y-4 max-w-md">
          <h1 className="text-fluid-5xl font-serif font-bold text-foreground leading-tight">
            404
          </h1>
          <h2 className="text-fluid-2xl font-medium text-foreground/90 space-fluid-4">
            Page not found
          </h2>
          <p className="text-fluid-lg text-muted-foreground space-fluid-5">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="pt-6">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                <span>Back to home</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 