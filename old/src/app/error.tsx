'use client'; 

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
