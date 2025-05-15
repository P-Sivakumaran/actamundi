import { NextResponse } from 'next/server';

// Force this route to be dynamic so it's not statically optimized
export const dynamic = 'force-dynamic';

// This API route deliberately throws an error to test Sentry integration
export async function GET() {
  throw new Error('Test error from Sentry test API route');
  
  // This code is unreachable, but included for completeness
  return NextResponse.json({ message: 'This should never be returned' });
} 