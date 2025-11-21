'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
            <div className="w-full max-w-md text-center">
                {/* Error Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>

                {/* Error Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Something went wrong!
                </h1>

                {/* Error Message */}
                <p className="text-muted-foreground mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
                            Error Details
                        </summary>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
                            {error.stack}
                        </pre>
                    </details>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try again
                    </Button>

                    <Link href="/">
                        <Button variant="outline">
                            <Home className="h-4 w-4 mr-2" />
                            Go home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
} 