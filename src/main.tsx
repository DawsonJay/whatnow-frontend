import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { EmbeddingsProvider } from './context/EmbeddingsContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmbeddingsProvider>
      <App />
    </EmbeddingsProvider>
  </StrictMode>,
);
