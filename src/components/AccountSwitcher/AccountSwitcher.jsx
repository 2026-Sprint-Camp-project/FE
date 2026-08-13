import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import styles from './AccountSwitcher.module.css';

/**
 * 사이드바 하단 계정 표시. Figma `Account Switcher`(280x56, pill)에 대응한다.
 * mock이 단일 로그인 사용자만 다루므로 계정 전환 로직 없이 정적 표시만 한다
 * (드롭다운/멀티 계정은 다음 단계 과제).
 *
 * @param {{ name: string, username: string, avatarUrl?: string | null, onClick?: () => void }} props
 */
function AccountSwitcher({ name, username, avatarUrl, onClick }) {
  return (
    <button type="button" className={styles.switcher} onClick={onClick}>
      <Avatar src={avatarUrl} name={name} size={40} />
      <div className={styles.text}>
        <p className={styles.name}>{name}</p>
        <p className={styles.username}>@{username}</p>
      </div>
      <Icon name="more" size={18} className={styles.moreIcon} />
    </button>
  );
}

export default AccountSwitcher;
