import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  retweetPost,
  unretweetPost,
  bookmarkPost,
  unbookmarkPost,
} from '../../api/posts';

import Tabs from '../../components/Tabs/Tabs';
import ComposeBox from '../../components/ComposeBox/ComposeBox';
import TweetCard from '../../components/TweetCard/TweetCard';

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

  // 3. 좋아요 상호작용 (409 에러 방지 및 낙관적 업데이트)
  const handleLike = async (postId, currentIsLiked, currentLikeCount) => {
    const nextIsLiked = !currentIsLiked;
    const nextLikeCount = nextIsLiked
      ? currentLikeCount + 1
      : Math.max(0, currentLikeCount - 1);

    // UI 즉시 변경
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isLiked: nextIsLiked,
            liked: nextIsLiked, // 백엔드 필드명도 같이 업데이트
            likeCount: nextLikeCount,
          };
        }
        return post;
      }),
    );

    try {
      if (nextIsLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      fetchPosts(); // 에러(409 등) 발생 시 원래 서버 데이터로 원복
    }
  };

  // 4. 리트윗(리포스트) 상호작용
  const handleRetweet = async (
    postId,
    currentIsRetweeted,
    currentRetweetCount,
  ) => {
    const nextIsRetweeted = !currentIsRetweeted;
    const nextRetweetCount = nextIsRetweeted
      ? currentRetweetCount + 1
      : Math.max(0, currentRetweetCount - 1);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isRetweeted: nextIsRetweeted,
            reposted: nextIsRetweeted, // 백엔드 필드명(reposted) 동기화
            retweetCount: nextRetweetCount,
            repostCount: nextRetweetCount,
          };
        }
        return post;
      }),
    );

    try {
      if (nextIsRetweeted) {
        await retweetPost(postId);
      } else {
        await unretweetPost(postId);
      }
    } catch (err) {
      console.error('리트윗 처리 실패:', err);
      fetchPosts();
    }
  };

  // 5. 북마크 상호작용
  const handleBookmark = async (postId, currentIsBookmarked) => {
    const nextIsBookmarked = !currentIsBookmarked;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return {
            ...post,
            isBookmarked: nextIsBookmarked,
            bookmarked: nextIsBookmarked,
          };
        }
        return post;
      }),
    );

    try {
      if (nextIsBookmarked) {
        await bookmarkPost(postId);
      } else {
        await unbookmarkPost(postId);
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
      fetchPosts();
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

          // ✨ API 명세서의 liked, reposted, bookmarked 값을 최우선으로 확인!
          const isLiked = post.liked ?? post.isLiked ?? false;
          const isRetweeted = post.reposted ?? post.isRetweeted ?? false;
          const isBookmarked = post.bookmarked ?? post.isBookmarked ?? false;

          // 카운트 필드명도 안전하게 전부 탐색
          const likeCount = post.likeCount ?? post.likes ?? 0;
          const retweetCount =
            post.repostCount ?? post.retweetCount ?? post.retweets ?? 0;
          const replyCount = post.replyCount ?? post.replies ?? 0;

          return (
            <TweetCard
              key={postId}
              author={{
                name: name || post.authorName || post.user?.name || '사용자',
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
                retweets: retweetCount,
                likes: likeCount,
              }}
              isLiked={isLiked}
              isRetweeted={isRetweeted}
              isBookmarked={isBookmarked}
              onClick={() => navigate(`/posts/${postId}`)}
              onReply={() => navigate(`/posts/${postId}`)}
              onLike={() => handleLike(postId, isLiked, likeCount)}
              onRetweet={() => handleRetweet(postId, isRetweeted, retweetCount)}
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
