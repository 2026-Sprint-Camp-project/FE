import styles from './FollowButton.module.css';

/**
 * 공통 팔로우 버튼. Figma `Follow Button`(71x32, 검은 배경 pill)에 대응한다.
 * 팔로잉 상태는 Figma에 별도 variant가 없어, X의 통상적인 hover-unfollow 패턴 대신
 * 가장 단순한 outline 스타일로 구분했다(팔로우: 검은 배경, 팔로잉: 테두리만).
 *
 * @param {{ isFollowing: boolean, onClick: () => void, disabled?: boolean }} props
 */
function FollowButton({ isFollowing, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={isFollowing ? styles.following : styles.follow}
      onClick={onClick}
      disabled={disabled}
    >
      {isFollowing ? '팔로잉' : '팔로우'}
    </button>
  );
}

export default FollowButton;
