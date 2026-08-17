// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// MSW 관련 코드는 모두 깔끔하게 지운 상태입니다.

// 이 부분이 있어야 리액트가 화면을 그립니다!
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);