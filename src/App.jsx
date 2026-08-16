import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './pages/SignupPage/SignupPage';
import LoginPage from './pages/LoginPage/LoginPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import FollowersPage from './pages/FollowersPage/FollowersPage';
import FollowingPage from './pages/FollowingPage/FollowingPage';
import ListsPage from './pages/ListsPage/ListsPage';
import SettingPage from './pages/SettingPage/SettingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { useAuth } from './hooks/useAuth';

function AppLayout() {
  const { currentUser } = useAuth();
  const user = currentUser
    ? {
        name: currentUser.name,
        username: currentUser.username,
        avatarUrl: currentUser.profileImageUrl,
      }
    : undefined;

  return (
    <Layout user={user} onComposeClick={() => {}} onAccountClick={() => {}} />
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/settings" element={<SettingPage />} />
            <Route path="/settings/profile" element={<EditProfilePage />} />
            <Route path="/:username" element={<ProfilePage />} />
            <Route path="/:username/followers" element={<FollowersPage />} />
            <Route path="/:username/following" element={<FollowingPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
