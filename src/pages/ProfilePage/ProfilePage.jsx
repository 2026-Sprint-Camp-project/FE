import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import FollowButton from '../../components/FollowButton/FollowButton';
import Tabs from '../../components/Tabs/Tabs';
import TweetCard from '../../components/TweetCard/TweetCard';
import * as usersApi from '../../api/users';
import * as relationsApi from '../../api/relations';
import * as listsApi from '../../api/lists';
import * as postsApi from '../../api/posts';
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

  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  const [lists, setLists] = useState([]);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [listsError, setListsError] = useState('');

  const isOwnProfile = currentUser?.username === username;

  // 1. 프로필 정보 로드
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
        if (!cancelled) setError(err.message || '프로필을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  // 2. '게시물' 탭 전용 데이터 로드
  useEffect(() => {
    if (activeTab !== 'posts') return undefined;
    let cancelled = false;
    setIsPostsLoading(true);

    postsApi
      .getUserPosts(username)
      .then((data) => {
        if (!cancelled) {
          const extractedPosts = Array.isArray(data) ? data : data?.data || data?.posts || [];
          
          const userPosts = extractedPosts.filter((post) => {
            const postUsername = post.username || post.user?.username || post.author?.username;
            return postUsername === username;
          });

          setPosts(userPosts);
        }
      })
      .catch((err) => console.error('게시물 로딩 실패:', err))
      .finally(() => {
        if (!cancelled) setIsPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, username]);

  // 3. '리스트' 탭 전용 데이터 로드
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

  // 상호작용 핸들러
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

  const handleToggleLike = async (e, postId, isLiked) => {
    e.stopPropagation();
    try {
      if (isLiked) {
        await postsApi.unlikePost(postId);
      } else {
        await postsApi.likePost(postId);
      }
      setPosts((prev) =>
        prev.map((p) => {
          if ((p.postId || p.id) === postId) {
            const currentLikes = p.likeCount ?? 0;
            return {
              ...p,
              liked: !isLiked,
              isLiked: !isLiked,
              likeCount: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  const handleToggleRepost = async (e, postId, isReposted) => {
    e.stopPropagation();
    try {
      if (isReposted) {
        await postsApi.unrepost(postId);
      } else {
        await postsApi.repost(postId);
      }
      setPosts((prev) =>
        prev.map((p) => {
          if ((p.postId || p.id) === postId) {
            const currentCount = p.repostCount ?? p.retweetCount ?? 0;
            const nextCount = isReposted ? Math.max(0, currentCount - 1) : currentCount + 1;
            return {
              ...p,
              reposted: !isReposted,
              isReposted: !isReposted,
              repostCount: nextCount,
            };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('리포스트 처리 실패:', err);
    }
  };

  const handleToggleBookmark = async (e, postId, isBookmarked) => {
    e.stopPropagation();
    try {
      if (isBookmarked) {
        await postsApi.unbookmark(postId);
      } else {
        await postsApi.bookmark(postId);
      }
      setPosts((prev) =>
        prev.map((p) =>
          (p.postId || p.id) === postId
            ? { ...p, bookmarked: !isBookmarked, isBookmarked: !isBookmarked }
            : p
        )
      );
    } catch (err) {
      console.error('북마크 처리 실패:', err);
    }
  };

  const handleShare = (e, postId) => {
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(url);
    alert('게시물 링크가 클립보드에 복사되었습니다.');
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
      ) : activeTab === 'posts' ? (
        <div className={styles.postsSection}>
          {isPostsLoading ? (
            <p className={styles.statusMessage} style={{ textAlign: 'center', padding: '20px' }}>
              게시물을 불러오는 중…
            </p>
          ) : posts.length > 0 ? (
            posts.map((post) => {
              const postId = post.postId || post.id;
              const isLiked = post.liked ?? post.isLiked ?? false;
              const isReposted = post.reposted ?? post.isReposted ?? false;
              const isBookmarked = post.bookmarked ?? post.isBookmarked ?? false;

              return (
                <TweetCard
                  key={postId}
                  author={{
                    name: post.name || post.authorName || profile?.name || '사용자',
                    username: post.username || post.user?.username || profile?.username || 'user',
                    avatarUrl: post.avatarUrl || post.profileImageUrl || profile?.profileImageUrl,
                  }}
                  createdAt={post.createdAt}
                  content={post.content}
                  counts={{
                    replies: post.replyCount ?? 0,
                    reposts: post.repostCount ?? post.retweetCount ?? 0,
                    likes: post.likeCount ?? 0,
                  }}
                  isLiked={isLiked}
                  isReposted={isReposted}
                  isBookmarked={isBookmarked}
                  onClick={() => navigate(`/posts/${postId}`)}
                  onLike={(e) => handleToggleLike(e, postId, isLiked)}
                  onRepost={(e) => handleToggleRepost(e, postId, isReposted)}
                  onBookmark={(e) => handleToggleBookmark(e, postId, isBookmarked)}
                  onShare={(e) => handleShare(e, postId)}
                />
              );
            })
          ) : (
            <div className={styles.emptyState}>아직 게시물이 없습니다.</div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>준비 중인 탭입니다.</div>
      )}
    </div>
  );
}

export default ProfilePage;