import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import FollowButton from '../../components/FollowButton/FollowButton';
import Tabs from '../../components/Tabs/Tabs';
import * as usersApi from '../../api/users';
import * as relationsApi from '../../api/relations';
import { useAuth } from '../../hooks/useAuth';
import styles from './ProfilePage.module.css';

const TABS = [
  { key: 'posts', label: '게시물' },
  { key: 'replies', label: '답글' },
  { key: 'media', label: '미디어' },
  { key: 'likes', label: '좋아요' },
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

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await relationsApi.unfollow(username);
        setIsFollowing(false);
      } else {
        await relationsApi.follow(username);
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

      <div className={styles.emptyState}>아직 게시물이 없습니다.</div>
    </div>
  );
}

export default ProfilePage;
