import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { registerServiceWorker } from './lib/pwa.js';
import { DatabaseProvider } from './state/DatabaseContext.jsx';
import { UiProvider } from './state/UiContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatabaseProvider>
      <UiProvider>
        <App />
      </UiProvider>
    </DatabaseProvider>
  </StrictMode>,
);

registerServiceWorker();
