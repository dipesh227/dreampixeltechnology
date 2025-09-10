

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LocalizationProvider } from '../context/LocalizationContext';
import { useLocalization } from '../hooks/useLocalization';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const FallbackUI: React.FC<{ error: Error | undefined }> = ({ error }) => {
    const { t } = useLocalization();
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300 p-4">
          <div className="max-w-lg text-center p-8 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">{t('errorBoundary.title')}</h1>
            <p className="mb-4">
              {t('errorBoundary.description')}
            </p>
            <details className="text-left text-xs text-slate-500 bg-slate-900 p-2 rounded-md">
                <summary>{t('errorBoundary.details')}</summary>
                <p className="mt-2 whitespace-pre-wrap">
                    {error?.message || t('errorBoundary.unknownError')}
                </p>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-primary-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('errorBoundary.refresh')}
            </button>
          </div>
        </div>
    );
};


class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <LocalizationProvider>
            <FallbackUI error={this.state.error} />
        </LocalizationProvider>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
