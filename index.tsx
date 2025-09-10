
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { LocalizationProvider } from './context/LocalizationContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <AuthProvider>
            <LocalizationProvider>
                <App />
            </LocalizationProvider>
        </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);