import { useNavigate, useParams } from 'react-router-dom';
import UserRow from '../UserRow/UserRow';
import Button from '../Button/Button';
import Tabs from '../Tabs/Tabs';
import { useFollowList } from '../../hooks/useFollowList';
import styles from './FollowListPage.module.css';

const TABS = [
  { key: 'followers', label: '팔로워' },
  { key: 'following', label: '팔로잉' },
];

/**
 * 팔로워/팔로잉 목록 화면. FollowersPage/FollowingPage가 mode만 다르게 넘겨서 재사용한다.
 * (Figma 두 화면의 구조가 완전히 동일 — 상단 탭으로 서로 전환 가능)
 *
 * @param {{ mode: 'followers' | 'following' }} props
 */
function FollowListPage({ mode }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const { items, hasNext, isLoading, error, loadMore } = useFollowList(username, mode);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)} aria-label="뒤로가기">
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
        {items.map((user) => (
          <UserRow
            key={user.username}
            avatarUrl={user.profileImageUrl}
            name={user.name}
            username={user.username}
            onClick={() => navigate(`/${user.username}`)}
          />
        ))}

        {!isLoading && items.length === 0 && (
          <p className={styles.emptyState}>
            {mode === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우한 사람이 없습니다.'}
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
