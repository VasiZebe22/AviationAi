import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';  // First - Design tokens
import './styles/global.css';     // Second - Global styles
import './index.css';            // Third - App specific styles
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
