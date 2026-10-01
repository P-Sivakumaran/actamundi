'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string | null>(null)

  useEffect(() => {
    // Extract error ID if available (can be reported to Sentry or similar)
    if (error?.digest) {
      setErrorId(error.digest.substring(0, 8))
    }
  }, [error])

  return (
    <div className="container mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
        <div className="space-y-4 max-w-md">
          <h1 className="text-fluid-5xl font-serif font-bold text-foreground leading-tight">
            Oops!
          </h1>
          <h2 className="text-fluid-2xl font-medium text-foreground/90 space-fluid-4">
            Something went wrong
          </h2>
          <p className="text-fluid-lg text-muted-foreground space-fluid-5">
            We're sorry, but we encountered an unexpected error while processing your request.
          </p>
          
          {errorId && (
            <div className="my-4 py-2 px-4 bg-muted rounded-md">
              <p className="text-fluid-sm text-muted-foreground">
                Error ID: <code className="font-mono">{errorId}</code>
              </p>
            </div>
          )}
          
          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => reset()} 
              size="lg" 
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try again</span>
            </Button>
            
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