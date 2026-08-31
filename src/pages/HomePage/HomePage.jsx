import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  rePost,
  unrePost,
  bookmarkPost,
  unbookmarkPost,
} from '../../api/posts';

import Tabs from '../../components/Tabs/Tabs';
import ComposeBox from '../../components/ComposeBox/ComposeBox';
import TweetCard from '../../components/TweetCard/TweetCard';

// 다양한 백엔드 데이터 타입(1/0, "true"/"false", boolean)을 안전하게 boolean으로 변환
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return false;
};

function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recommend');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');

  // 1. 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const response = await getPosts();
      if (Array.isArray(response)) {
        setPosts(response);
      } else if (response && Array.isArray(response.data)) {
        setPosts(response.data);
      } else if (response && Array.isArray(response.posts)) {
        setPosts(response.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('피드 로딩 실패:', err);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. 새 트윗 작성
  const handleComposeSubmit = async (text) => {
    const postContent = text || content;
    if (!postContent.trim()) return;

    try {
      await createPost(postContent);
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error('게시글 작성 실패:', err);
    }
  };

  // 3. 좋아요 상호작용
  const handleLike = async (postId, currentIsLiked, currentLikeCount) => {
    const nextIsLiked = !currentIsLiked;
    const nextLikeCount = nextIsLiked
      ? currentLikeCount + 1
      : Math.max(0, currentLikeCount - 1);

    // UI 즉시 반영 (낙관적 업데이트)
    setPosts((prev) =>
      prev.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isLiked: nextIsLiked,
            liked: nextIsLiked,
            is_liked: nextIsLiked,
            likeCount: nextLikeCount,
            likes: nextLikeCount,
          };
        }
        return post;
      })
    );

    // API 호출 및 409 예외 처리
    try {
      if (nextIsLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        console.warn('이미 좋아요 처리된 게시글입니다. 상태를 true로 유지합니다.');
        setPosts((prev) =>
          prev.map((post) => {
            const id = post.postId || post.id;
            if (id === postId) {
              return { ...post, isLiked: true, liked: true, is_liked: true };
            }
            return post;
          })
        );
      } else {
        console.error('좋아요 처리 실패:', err);
        fetchPosts();
      }
    }
  };

  // 4. 리트윗(리포스트) 상호작용
  const handleRepost = async (
    postId,
    currentIsReposted,
    currentRepostCount,
  ) => {
    const nextIsReposted = !currentIsReposted;
    const nextRepostCount = nextIsReposted
      ? currentRepostCount + 1
      : Math.max(0, currentRepostCount - 1);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isReposted: nextIsReposted,
            reposted: nextIsReposted,
            is_reposted: nextIsReposted,
            repostCount: nextRepostCount,
            reposts: nextRepostCount,
          };
        }
        return post;
      }),
    );

    try {
      if (nextIsReposted) {
        await rePost(postId);
      } else {
        await unrePost(postId);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        console.warn('이미 리포스트 처리된 게시글입니다. 상태를 true로 유지합니다.');
        setPosts((prev) =>
          prev.map((post) => {
            const id = post.postId || post.id;
            if (id === postId) {
              return { ...post, isReposted: true, reposted: true, is_reposted: true };
            }
            return post;
          })
        );
      } else {
        console.error('리트윗 처리 실패:', err);
        fetchPosts();
      }
    }
  };

  // 5. 북마크 상호작용
  const handleBookmark = async (postId, currentIsBookmarked) => {
    const nextIsBookmarked = !currentIsBookmarked;

    setPosts((prev) =>
      prev.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isBookmarked: nextIsBookmarked,
            bookmarked: nextIsBookmarked,
            is_bookmarked: nextIsBookmarked,
          };
        }
        return post;
      })
    );

    try {
      if (nextIsBookmarked) {
        await bookmarkPost(postId);
      } else {
        await unbookmarkPost(postId);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        console.warn('이미 북마크 처리된 게시글입니다. 상태를 true로 유지합니다.');
        setPosts((prev) =>
          prev.map((post) => {
            const id = post.postId || post.id;
            if (id === postId) {
              return { ...post, isBookmarked: true, bookmarked: true, is_bookmarked: true };
            }
            return post;
          })
        );
      } else {
        console.error('북마크 처리 중 실패:', err);
        fetchPosts();
      }
    }
  };

  // 6. 공유 (주소 복사)
  const handleShare = (postId) => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('게시물 링크가 클립보드에 복사되었습니다!');
  };

  return (
    <div>
      <Tabs
        items={[
          { key: 'recommend', label: '추천' },
          { key: 'following', label: '팔로잉' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      <ComposeBox
        value={content}
        onChange={(e) => setContent(e.target?.value ?? e)}
        onSubmit={handleComposeSubmit}
      />

      {Array.isArray(posts) && posts.length > 0 ? (
        posts.map((post) => {
          const postId = post.postId || post.id;

          // snake_case, camelCase, 단수형 키 형태 모두를 다각도로 탐색하여 boolean 변환
          const isLiked = toBoolean(post.liked ?? post.isLiked ?? post.is_liked);
          const isReposted = toBoolean(post.reposted ?? post.isReposted ?? post.is_reposted);
          const isBookmarked = toBoolean(post.bookmarked ?? post.isBookmarked ?? post.is_bookmarked);

          // 카운트 숫자 탐색
          const likeCount = post.likeCount ?? post.likes ?? post.like_count ?? 0;
          const repostCount = post.repostCount ?? post.reposts ?? post.repost_count ?? 0;
          const replyCount = post.replyCount ?? post.replies ?? post.reply_count ?? 0;

          return (
            <TweetCard
              key={postId}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
              isReposted={isReposted}
              author={{
                name: post.name || post.authorName || post.user?.name || '사용자',
                username: post.username || post.user?.username || 'user',
                avatarUrl:
                  post.avatarUrl ||
                  post.profileImageUrl ||
                  post.user?.avatarUrl,
              }}
              createdAt={post.createdAt}
              content={post.content}
              counts={{
                replies: replyCount,
                reposts: repostCount,
                likes: likeCount,
              }}
              onClick={() => navigate(`/posts/${postId}`)}
              onReply={() => navigate(`/posts/${postId}`)}
              onLike={() => handleLike(postId, isLiked, likeCount)}
              onRepost={() => handleRepost(postId, isReposted, repostCount)}
              onBookmark={() => handleBookmark(postId, isBookmarked)}
              onShare={() => handleShare(postId)}
            />
          );
        })
      ) : (
        <div
          style={{ padding: '40px 0', textAlign: 'center', color: '#536471' }}
        >
          게시글이 없습니다. 첫 번째 글을 작성해 보세요!
        </div>
      )}
    </div>
  );
}

export default HomePage;