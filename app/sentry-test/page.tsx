"use client";

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryTestPage() {
  const handleClientError = () => {
    try {
      // Deliberately throw an error
      throw new Error("Test client-side error from Sentry test page");
    } catch (error) {
      if (error instanceof Error) {
        Sentry.captureException(error);
        alert("Client error captured by Sentry!");
      }
    }
  };

  const handleApiError = async () => {
    try {
      const res = await fetch("/api/sentry-test-error");
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        Sentry.captureException(error);
        alert("API error captured by Sentry!");
      }
    }
  };

  const handleUnhandledError = () => {
    // This will be caught by the ErrorBoundary component
    throw new Error("Test unhandled error from Sentry test page");
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Sentry Integration Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Client-side Error</CardTitle>
            <CardDescription>
              Trigger a handled client-side error that will be captured by Sentry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This error is caught in a try/catch and reported to Sentry.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleClientError}>Trigger Client Error</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API Error</CardTitle>
            <CardDescription>
              Trigger an error in an API route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This will call an API endpoint that deliberately throws an error.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleApiError} variant="secondary">Trigger API Error</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Unhandled Error</CardTitle>
          <CardDescription>
            Trigger an unhandled error that will be caught by ErrorBoundary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-500 dark:text-yellow-400 mb-2">Warning: This will crash the component!</p>
          <p>The error will be caught by the ErrorBoundary component and reported to Sentry.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUnhandledError} variant="destructive">Crash Component</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 