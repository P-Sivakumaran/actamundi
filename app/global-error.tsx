'use client'

import * as Sentry from '@sentry/nextjs'
import Error from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: any; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        {/* 
          This is the default Next.js error component but it doesn't allow omitting the statusCode property yet.
          Once that is fixed, we can use it instead of NextError.
          https://github.com/vercel/next.js/issues/29611 
        */}
        {/* Using NextError is a temporary workaround. 
            Ideally, you should render a custom error page here. 
            Refer to Sentry and Next.js documentation for the latest best practices.
        */}
        <Error statusCode={error?.statusCode || 500} title={error?.message || "An unexpected error occurred"} />
        <button onClick={() => reset()}>Try again</button>
        <button onClick={() => Sentry.showReportDialog({ eventId: Sentry.lastEventId() })}>Report feedback</button>
      </body>
    </html>
  )
} 