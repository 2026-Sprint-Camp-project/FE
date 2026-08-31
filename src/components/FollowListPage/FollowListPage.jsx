import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserRow from '../UserRow/UserRow';
import Button from '../Button/Button';
import Tabs from '../Tabs/Tabs';
import { useFollowList } from '../../hooks/useFollowList';
import { useAuth } from '../../hooks/useAuth';
import { follow, unfollow } from '../../api/relations';
import styles from './FollowListPage.module.css';

const TABS = [
  { key: 'followers', label: '팔로워' },
  { key: 'following', label: '팔로잉' },
];

function FollowListPage({ mode }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, hasNext, isLoading, error, loadMore } = useFollowList(
    username,
    mode,
  );

  // getFollowers/getFollowing 응답은 항목마다 isFollowing을 정확히 내려주지만
  // (SearchPage/ProfilePage와 달리 여기선 추가 조회가 필요 X), 그 값은
  // useFollowList가 불러온 시점 기준이라 버튼 클릭 후 상태는 여기서 따로
  // 덮어써서 관리. { [userId]: boolean }
  const [followOverrides, setFollowOverrides] = useState({});

  const handleFollowToggle = async (user) => {
    const userId = user.userId ?? user.user_id;
    const wasFollowing = followOverrides[userId] ?? user.isFollowing;

    setFollowOverrides((prev) => ({ ...prev, [userId]: !wasFollowing }));

    try {
      if (wasFollowing) {
        await unfollow(userId);
      } else {
        await follow(userId);
      }
    } catch (err) {
      if (err.status === 409) {
        setFollowOverrides((prev) => ({ ...prev, [userId]: true }));
      } else if (err.status === 404) {
        setFollowOverrides((prev) => ({ ...prev, [userId]: false }));
      } else {
        setFollowOverrides((prev) => ({ ...prev, [userId]: wasFollowing }));
        console.error('팔로우 요청 실패:', err);
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <p className={styles.title}>@{username}</p>
      </header>

      <Tabs
        items={TABS}
        activeKey={mode}
        onChange={(key) => navigate(`/${username}/${key}`, { replace: true })}
      />

      <div className={styles.list}>
        {items.map((user) => {
          const userId = user.userId ?? user.user_id;
          const isSelf = currentUser?.username === user.username;
          const isFollowing = followOverrides[userId] ?? user.isFollowing;

          return (
            <UserRow
              key={user.username}
              avatarUrl={user.profileImageUrl}
              name={user.name}
              username={user.username}
              isFollowing={isSelf ? undefined : isFollowing}
              onFollowToggle={
                isSelf ? undefined : () => handleFollowToggle(user)
              }
              onClick={() => navigate(`/${user.username}`)}
            />
          );
        })}

        {!isLoading && items.length === 0 && (
          <p className={styles.emptyState}>
            {mode === 'followers'
              ? '아직 팔로워가 없습니다.'
              : '아직 팔로우한 사람이 없습니다.'}
          </p>
        )}

        {error && <p className={styles.errorMessage}>{error}</p>}

        {hasNext && (
          <div className={styles.loadMore}>
            <Button variant="secondary" onClick={loadMore} disabled={isLoading}>
              더보기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowListPage;
