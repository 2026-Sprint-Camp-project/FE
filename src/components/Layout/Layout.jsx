import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { createPost } from '../../api/posts'; // HomePage와 동일한 API 모듈 불러오기
import NavItem from '../NavItem/NavItem';
import NavMoreItem from '../NavMoreItem/NavMoreItem';
import Button from '../Button/Button';
import AccountSwitcher from '../AccountSwitcher/AccountSwitcher';
import RightSidebar from '../RightSideBar/RightSideBar';
import Modal from '../Modal/Modal';
import ComposeBox from '../ComposeBox/ComposeBox';
import styles from './Layout.module.css';

const NAV_ITEMS = [
  { key: 'home', icon: 'home', label: '홈', to: '/' },
  { key: 'search', icon: 'search', label: '검색', to: '/search' },
  { key: 'notifications', icon: 'bell', label: '알림', to: '/notifications' },
  { key: 'bookmarks', icon: 'bookmarks', label: '북마크', to: '/bookmarks' }, 
];

function Layout({ user, onComposeClick, onAccountClick }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCompose = () => {
    setIsComposeOpen(true);
    if (onComposeClick) onComposeClick();
  };

  const handleCloseCompose = () => {
    setIsComposeOpen(false);
    setComposeText('');
  };

  const handleTextChange = (eOrValue) => {
    const text = typeof eOrValue === 'string' ? eOrValue : eOrValue?.target?.value;
    setComposeText(text ?? '');
  };

  // HomePage의 게시글 작성 방식과 동일하게 createPost 함수 사용
  const handleComposeSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!composeText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // 기존 API 모듈 함수 호출 (토큰 및 서버 주소 자동 적용)
      await createPost(composeText);

      handleCloseCompose();
      window.location.reload(); // 작성 후 피드 갱신
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = user
    ? [
        ...NAV_ITEMS.slice(0, 4),
        {
          key: 'profile',
          icon: 'user',
          label: '프로필',
          to: `/${user.username}`,
        },
        ...NAV_ITEMS.slice(4),
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
          <NavMoreItem />
        </nav>

        <Button fullWidth onClick={handleOpenCompose}>
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

      {isComposeOpen && (
        <Modal onClose={handleCloseCompose}>
          <ComposeBox
            value={composeText}
            onChange={handleTextChange}
            onSubmit={handleComposeSubmit}
            variant="default"
            submitLabel={isSubmitting ? '게시 중...' : '게시하기'}
          />
        </Modal>
      )}
    </div>
  );
}

export default Layout;