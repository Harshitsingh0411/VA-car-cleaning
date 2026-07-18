import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Register Service Worker for PWA & Background Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL || '/'}sw.js`.replace(/\/+/g, '/');
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('PWA Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('PWA Service Worker registration failed:', error);
      });
  });
}
