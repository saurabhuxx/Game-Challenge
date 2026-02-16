import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runGameLogicTests } from './tests/gameLogic.test';
import { runAIServiceTests } from './tests/moralEngine.test';

// Run tests automatically in development environment (console-only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  runGameLogicTests();
  runAIServiceTests();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);