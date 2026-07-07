"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { captureMessage, captureException } from '@/lib/error-monitoring';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorTestPage() {
  const [logCount, setLogCount] = useState(0);

  // Function to trigger a message capture
  const handleLogMessage = () => {
    captureMessage(`Test message logged ${logCount + 1}`, 'info', {
      page: 'error-test',
      timestamp: new Date().toISOString(),
    });
    setLogCount(prev => prev + 1);
  };

  // Function to trigger an error capture
  const handleTriggerError = () => {
    try {
      // Deliberately throw an error
      throw new Error(`Test error thrown ${logCount + 1}`);
    } catch (error) {
      if (error instanceof Error) {
        captureException(error, {
          page: 'error-test',
          timestamp: new Date().toISOString(),
        });
      }
      setLogCount(prev => prev + 1);
    }
  };

  // Function to trigger an unhandled error (will be caught by ErrorBoundary)
  const handleUnhandledError = () => {
    // This will throw an error that isn't caught locally
    throw new Error(`Unhandled error ${logCount + 1}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sentry Integration Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Captured Messages</CardTitle>
            <CardDescription>Send an info message to Sentry</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This will send a message to Sentry without throwing an error.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogMessage}>Log Message</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Captured Exceptions</CardTitle>
            <CardDescription>Send a handled exception to Sentry</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This will throw and capture an error with Sentry.</p>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleTriggerError}>Trigger Error</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Unhandled Exception</CardTitle>
          <CardDescription>Trigger an error that will be caught by the ErrorBoundary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-500 dark:text-yellow-400 mb-2">Warning: This will crash the component!</p>
          <p>The error will be caught by the ErrorBoundary component and reported to Sentry.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleUnhandledError}>Crash Component</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 