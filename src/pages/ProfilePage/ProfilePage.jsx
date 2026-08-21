import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import FollowButton from '../../components/FollowButton/FollowButton';
import Tabs from '../../components/Tabs/Tabs';
import * as usersApi from '../../api/users';
import * as relationsApi from '../../api/relations';
import * as listsApi from '../../api/lists';
import { useAuth } from '../../hooks/useAuth';
import styles from './ProfilePage.module.css';

const TABS = [
  { key: 'posts', label: '게시물' },
  { key: 'replies', label: '답글' },
  { key: 'media', label: '미디어' },
  { key: 'likes', label: '좋아요' },
  { key: 'lists', label: '리스트' },
];

function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const [lists, setLists] = useState([]);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [listsError, setListsError] = useState('');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    usersApi
      .getUser(username)
      .then((data) => {
        if (!cancelled) setProfile(data.user);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err.message || '프로필을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  // '리스트' 탭을 눌렀을 때만 조회한다 (다른 사용자의 리스트도 여기로 조회됨)
  useEffect(() => {
    if (activeTab !== 'lists') return undefined;
    let cancelled = false;
    setIsListsLoading(true);
    setListsError('');

    listsApi
      .getUserLists(username)
      .then((data) => {
        if (!cancelled) setLists(data.lists ?? []);
      })
      .catch((err) => {
        if (!cancelled) setListsError(err.message || '리스트를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsListsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, username]);

  const handleFollowToggle = async () => {
    const targetId = profile.userId;
    try {
      if (isFollowing) {
        await relationsApi.unfollow(targetId);
        setIsFollowing(false);
      } else {
        await relationsApi.follow(targetId);
        setIsFollowing(true);
      }
    } catch (err) {
      if (err.status === 409) setIsFollowing(true);
      else if (err.status === 404) setIsFollowing(false);
      else window.alert(err.message || '요청에 실패했습니다.');
    }
  };

  if (isLoading) return null;

  if (error || !profile) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.errorMessage}>
          {error || '사용자를 찾을 수 없습니다.'}
        </p>
      </div>
    );
  }

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
        <p className={styles.title}>{profile.name}</p>
      </header>

      <div
        className={styles.banner}
        style={
          profile.bannerImageUrl
            ? { backgroundImage: `url(${profile.bannerImageUrl})` }
            : undefined
        }
      />

      <div className={styles.profileInfo}>
        <div className={styles.avatarRow}>
          <Avatar
            src={profile.profileImageUrl}
            name={profile.name}
            size={80}
            className={styles.avatar}
          />
          {isOwnProfile ? (
            <Button
              variant="secondary"
              onClick={() => navigate('/settings/profile')}
            >
              프로필 수정
            </Button>
          ) : (
            <FollowButton
              isFollowing={isFollowing}
              onClick={handleFollowToggle}
            />
          )}
        </div>

        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.username}>@{profile.username}</p>
        </div>

        {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
        {profile.location && (
          <p className={styles.location}>📍 {profile.location}</p>
        )}

        <div className={styles.counts}>
          <Link to={`/${username}/following`} className={styles.countLink}>
            <strong>{profile.followingCount ?? 0}</strong> 팔로잉
          </Link>
          <Link to={`/${username}/followers`} className={styles.countLink}>
            <strong>{profile.followerCount ?? 0}</strong> 팔로워
          </Link>
        </div>
      </div>

      <Tabs items={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'lists' ? (
        <div className={styles.listsSection}>
          {isListsLoading && (
            <p className={styles.statusMessage}>불러오는 중…</p>
          )}
          {!isListsLoading && listsError && (
            <p className={styles.errorMessage}>{listsError}</p>
          )}
          {!isListsLoading && !listsError && lists.length === 0 && (
            <p className={styles.emptyState}>
              {isOwnProfile
                ? '아직 만든 리스트가 없습니다.'
                : '공개된 리스트가 없습니다.'}
            </p>
          )}
          {!isListsLoading && !listsError && lists.length > 0 && (
            <div className={styles.listRows}>
              {lists.map((list) =>
                isOwnProfile ? (
                  <button
                    key={list.listId}
                    type="button"
                    className={styles.listRow}
                    onClick={() =>
                      navigate(`/lists/${list.listId}`, { state: { list } })
                    }
                  >
                    <p className={styles.listRowTitle}>
                      {list.listName}
                      {list.isPrivate && (
                        <span className={styles.badge}>비공개</span>
                      )}
                    </p>
                    {list.description && (
                      <p className={styles.listRowDescription}>
                        {list.description}
                      </p>
                    )}
                  </button>
                ) : (
                  <div key={list.listId} className={styles.listRow}>
                    <p className={styles.listRowTitle}>{list.listName}</p>
                    {list.description && (
                      <p className={styles.listRowDescription}>
                        {list.description}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>아직 게시물이 없습니다.</div>
      )}
    </div>
  );
}

export default ProfilePage;
