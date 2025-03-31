'use client';

import React, { ReactNode, useState } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="mb-4">
          There was an error loading the alerts. Please try again later.
        </p>
        {error && (
          <details className="border border-red-200 rounded p-2 bg-white">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap text-sm text-red-600">
              {error.message}
            </pre>
          </details>
        )}
        <button
          onClick={() => setHasError(false)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (e) {
    if (e instanceof Error) {
      setError(e);
    } else {
      setError(new Error('Unknown error occurred'));
    }
    setHasError(true);
    return null;
  }
} 