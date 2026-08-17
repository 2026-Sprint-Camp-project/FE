import { Outlet } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Button from '../Button/Button';
import AccountSwitcher from '../AccountSwitcher/AccountSwitcher';
import RightSidebar from '../RightSidebar/RightSidebar';
import styles from './Layout.module.css';

// "더보기"는 실제 X처럼 드롭다운 메뉴가 될 수도 있지만, Figma에 목적지가
// 명시돼 있지 않아 우선 설정 페이지로 연결해뒀다. 필요해지면 바꿀 것.
const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: '홈', to: '/' },
  { key: 'search', icon: 'search', label: '검색', to: '/search' },
  { key: 'notifications', icon: 'bell', label: '알림', to: '/notifications' },
  { key: 'more', icon: 'more', label: '더보기', to: '/settings' },
];

/**
 * 로그인 이후 공통 레이아웃(좌측 사이드바 + 우측 라우트 컨텐츠). Figma `Left Nav`에 대응한다.
 * `App.jsx`에서 `<Route element={<ProtectedRoute />}>` 하위에 이 컴포넌트를 두고,
 * 홈/검색/알림 등 실제 페이지는 <Outlet/> 자리에 중첩 라우트로 넣는다.
 *
 * user를 넘기면 프로필 NavItem 경로와 하단 AccountSwitcher가 채워지고,
 * 없으면(아직 프로필 API 연동 전 등) 두 영역을 생략한다.
 *
 * @param {{
 *   user?: { name: string, username: string, avatarUrl?: string | null },
 *   onComposeClick?: () => void,
 *   onAccountClick?: () => void,
 * }} props
 */
function Layout({ user, onComposeClick, onAccountClick }) {
  // 홈/검색/알림 다음, 더보기 앞에 프로필 항목을 끼워 넣는다(Figma 순서 기준).
  const navItems = user
    ? [
        ...NAV_ITEMS.slice(0, 3),
        { key: 'profile', icon: 'user', label: '프로필', to: `/${user.username}` },
        ...NAV_ITEMS.slice(3),
      ]
    : NAV_ITEMS;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.logo}>X</p>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavItem key={item.key} icon={item.icon} label={item.label} to={item.to} />
          ))}
        </nav>

        <Button fullWidth onClick={onComposeClick}>
          게시하기
        </Button>

        {user && (
          <div className={styles.accountSwitcherSlot}>
            <AccountSwitcher
              name={user.name}
              username={user.username}
              avatarUrl={user.avatarUrl}
              onClick={onAccountClick}
            />
          </div>
        )}
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      <RightSidebar />
    </div>
  );
}

export default Layout;
