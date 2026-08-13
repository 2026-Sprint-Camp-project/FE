import Avatar from '../Avatar/Avatar';
import FollowButton from '../FollowButton/FollowButton';
import styles from './UserRow.module.css';

/**
 * 공통 유저 행. Figma `Follow Row`(팔로우 추천)와 `User Row`(팔로워/팔로잉 목록)를
 * 대조한 결과 구조가 동일해 하나로 통합했다.
 *
 * isFollowing/onFollowToggle을 주면 기본 FollowButton이 trailing에 렌더링되고,
 * 팔로우 버튼이 아닌 다른 요소가 필요하면 trailing으로 직접 넘겨 덮어쓸 수 있다.
 *
 * @param {{
 *   avatarUrl?: string | null,
 *   name: string,
 *   username: string,
 *   isFollowing?: boolean,
 *   onFollowToggle?: () => void,
 *   trailing?: React.ReactNode,
 *   onClick?: () => void,
 * }} props
 */
function UserRow({ avatarUrl, name, username, isFollowing, onFollowToggle, trailing, onClick }) {
  const isClickable = typeof onClick === 'function';
  const trailingContent =
    trailing ??
    (typeof onFollowToggle === 'function' ? (
      <FollowButton isFollowing={isFollowing} onClick={onFollowToggle} />
    ) : null);

  return (
    <div className={styles.row}>
      <div
        className={isClickable ? `${styles.identity} ${styles.clickable}` : styles.identity}
        onClick={onClick}
      >
        <Avatar src={avatarUrl} name={name} size={40} />
        <div className={styles.text}>
          <p className={styles.name}>{name}</p>
          <p className={styles.username}>@{username}</p>
        </div>
      </div>
      {trailingContent}
    </div>
  );
}

export default UserRow;
