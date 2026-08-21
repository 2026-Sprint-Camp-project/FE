import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icon/Icon';
import styles from './NavMoreItem.module.css';

const MENU_ITEMS = [
  { key: 'settings', label: '설정', to: '/settings' },
  { key: 'lists', label: '리스트', to: '/lists' },
];

/**
 * 사이드바 "더보기" 항목. 예전엔 라벨이 "설정"이라 눌렀을 때 바로 /settings로만
 * 이동했는데, 리스트 화면이 생기면서 설정/리스트 중 하나를 고르는 팝업 메뉴로 바꿨다.
 * NavItem과 달리 NavLink가 아니라 버튼 + 팝업 메뉴 조합이라 별도 컴포넌트로 뺐다.
 */
function NavMoreItem() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const location = useLocation();

  const isActive = MENU_ITEMS.some((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Icon name="more" size={30} />
        <span className={styles.label}>더보기</span>
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              role="menuitem"
              className={styles.menuItem}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavMoreItem;
