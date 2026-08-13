import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 개발 모드에서만 MSW(mock 서버)를 켠다. 실제 배포 빌드에는 포함되지 않는다.
async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mock/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
