import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAccessToken, clearTokens } from '../api/auth';
import * as usersApi from '../api/users';

const AuthContext = createContext(null);

/**
 * 로그인 상태(accessToken 존재 여부)와 현재 로그인한 유저 정보를 앱 전체에 제공한다.
 * 실제 토큰 저장은 api/auth.js의 saveTokens()가 담당하고(LoginPage/SignupPage에서 호출),
 * 이 컨텍스트는 그 토큰을 읽어서 /users/me를 불러오는 역할만 한다.
 */
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getAccessToken());
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(!!getAccessToken());

  useEffect(() => {
    if (!accessToken) {
      setCurrentUser(null);
      setIsLoadingUser(false);
      return;
    }

    let cancelled = false;
    setIsLoadingUser(true);

    usersApi
      .getMe()
      .then((data) => {
        if (!cancelled) setCurrentUser(data.user);
      })
      .catch((err) => {
        if (cancelled) return;
        // 토큰이 더 이상 유효하지 않으면 로그아웃 처리
        if (err.status === 401) {
          clearTokens();
          setAccessToken(null);
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  /** 로그인/토큰 갱신 직후 호출해서 accessToken과 currentUser를 다시 읽어온다 */
  const refreshAuth = useCallback(() => {
    setAccessToken(getAccessToken());
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

  const value = {
    isAuthenticated: !!accessToken,
    isLoadingUser,
    currentUser,
    refreshAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 <AuthProvider> 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
