import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage/SignupPage';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import EditProfilePage from './pages/EditProfilePage/EditProfilePage';
import FollowersPage from './pages/FollowersPage/FollowersPage';
import FollowingPage from './pages/FollowingPage/FollowingPage';
import ListsPage from './pages/ListsPage/ListsPage';
import ListDetailPage from './pages/ListDetailPage/ListDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
import SettingPage from './pages/SettingPage/SettingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { useAuth } from './hooks/useAuth';
import TweetDetailPage from './pages/TweetDetailPage/TweetDetailPage';
import SearchPage from './pages/SearchPage/SearchPage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import BookmarksPage from './pages/BookmarksPage/BookmarksPage';

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
        {/* 로그인 / 회원가입 (사이드바 없는 독립 페이지) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts/:postId" element={<TweetDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/lists" element={<ListsPage />} />
            <Route path="/lists/:listId" element={<ListDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
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
