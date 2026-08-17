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

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    setCurrentUser(null);
  }, []);

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
      .catch(() => {
        // 401이면 client.js가 쏘는 auth:unauthorized 이벤트가 아래 리스너에서
        // 로그아웃을 처리한다. 그 외 에러는 currentUser를 갱신하지 않고 넘어간다
        // (일시적인 네트워크 문제로 로그인 상태 자체를 끊지는 않는다).
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // 어떤 페이지에서든 인증된 요청이 401을 받으면(세션 만료/무효화) 전역으로 로그아웃 처리한다.
  // 이게 없으면 각 페이지가 401을 받아도 자기 화면에 에러 문구만 띄우고 끝나서,
  // 로그인이 끊겼는데도 계속 그 페이지에 "붕 뜬" 채로 남아 있게 된다.
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  /** 로그인/토큰 갱신 직후 호출해서 accessToken과 currentUser를 다시 읽어온다 */
  const refreshAuth = useCallback(() => {
    setAccessToken(getAccessToken());
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
