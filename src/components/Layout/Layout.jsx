import { Outlet } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';
import Button from '../Button/Button';
import AccountSwitcher from '../AccountSwitcher/AccountSwitcher';
import RightSidebar from '../RightSideBar/RightSideBar';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: '홈', to: '/' },
  { key: 'search', icon: 'search', label: '검색', to: '/search' },
  { key: 'notifications', icon: 'bell', label: '알림', to: '/notifications' },
  { key: 'more', icon: 'more', label: '설정', to: '/settings' },
];

function Layout({ user, onComposeClick, onAccountClick }) {
  const navItems = user
    ? [
        ...NAV_ITEMS.slice(0, 3),
        {
          key: 'profile',
          icon: 'user',
          label: '프로필',
          to: `/${user.username}`,
        },
        ...NAV_ITEMS.slice(3),
      ]
    : NAV_ITEMS;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <p className={styles.logo}>X</p>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavItem
              key={item.key}
              icon={item.icon}
              label={item.label}
              to={item.to}
            />
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
