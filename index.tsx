import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { areSupabaseKeysSet } from './services/supabaseClient';
import EnvVarModal from './components/EnvVarModal';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (areSupabaseKeysSet()) {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <EnvVarModal />
    </React.StrictMode>
  );
}
