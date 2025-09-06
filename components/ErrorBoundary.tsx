
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 p-4">
          <div className="max-w-lg text-center p-8 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong.</h1>
            <p className="mb-4">
              We've encountered an unexpected error. Please try refreshing the page. If the problem persists, please contact support.
            </p>
            <details className="text-left text-xs text-slate-500 bg-slate-900 p-2 rounded-md">
                <summary>Error Details</summary>
                <p className="mt-2 whitespace-pre-wrap">
                    {this.state.error?.message || 'An unknown error occurred.'}
                </p>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-primary-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
