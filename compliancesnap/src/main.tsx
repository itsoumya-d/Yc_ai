import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ServiceWorkerRegister } from './components/pwa/sw-register';
import './globals.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
      <ServiceWorkerRegister />
    </StrictMode>,
  );
}
