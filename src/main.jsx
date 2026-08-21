import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import { DatabaseProvider } from './state/DatabaseContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatabaseProvider>
      <App />
    </DatabaseProvider>
  </StrictMode>,
);
