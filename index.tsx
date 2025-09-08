
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { UserProgressProvider } from './context/UserProgressContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <UserProgressProvider>
        <App />
      </UserProgressProvider>
    </LanguageProvider>
  </React.StrictMode>
);
