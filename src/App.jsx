import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage/SignupPage';
import LoginPage from './pages/LoginPage/LoginPage';

function App() {
  return (
    <BrowserRouter>
      {/* TODO: 인증 컨텍스트(AuthProvider) 구현 후 다시 감싸기 */}
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
