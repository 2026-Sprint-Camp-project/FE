import { NavLink } from 'react-router-dom';
import Icon from '../Icon/Icon';
import styles from './NavItem.module.css';

/**
 * 공통 사이드바 네비게이션 항목. Figma 마스터 컴포넌트 `Nav Item`(아이콘 30px + 라벨 24px)에 대응한다.
 * 실제 화면에서는 좌측 Left Nav에 반복돼 있었지만(수동 복제) 이 컴포넌트로 대체한다.
 *
 * @param {{ icon: string, label: string, to: string }} props
 */
function NavItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    >
      <Icon name={icon} size={30} />
      <span className={styles.label}>{label}</span>
    </NavLink>
  );
}

export default NavItem;
