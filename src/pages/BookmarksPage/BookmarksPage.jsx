// src/pages/BookmarksPage/BookmarksPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getBookmarks, 
  likePost, 
  unlikePost, 
  rePost, 
  unrePost, 
  bookmarkPost, 
  unbookmarkPost 
} from '../../api/posts';
import Layout from '../../components/Layout/Layout';
import TweetCard from '../../components/TweetCard/TweetCard';

function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 북마크 목록 불러오기
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getBookmarks();
      
      if (Array.isArray(response)) {
        setBookmarks(response);
      } else if (response && Array.isArray(response.data)) {
        setBookmarks(response.data);
      } else if (response && Array.isArray(response.bookmarks)) {
        setBookmarks(response.bookmarks);
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.error('북마크 목록 로딩 실패:', err);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // 좋아요 처리 (낙관적 업데이트)
  const handleLike = async (postId, currentIsLiked) => {
    const nextIsLiked = !currentIsLiked;

    setBookmarks((prev) =>
      prev.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          const currentCount = post.likeCount ?? post.likes ?? 0;
          const nextCount = nextIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
          return {
            ...post,
            isLiked: nextIsLiked,
            liked: nextIsLiked,
            likeCount: nextCount,
            likes: nextCount,
          };
        }
        return post;
      })
    );

    try {
      if (nextIsLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      fetchBookmarks();
    }
  };

  // 리포스트 처리 (낙관적 업데이트)
  const handleRepost = async (postId, currentIsReposted) => {
    const nextIsReposted = !currentIsReposted;

    setBookmarks((prev) =>
      prev.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          const currentCount = post.repostCount ?? post.reposts ?? 0;
          const nextCount = nextIsReposted ? currentCount + 1 : Math.max(0, currentCount - 1);
          return {
            ...post,
            isReposted: nextIsReposted,
            reposted: nextIsReposted,
            repostCount: nextCount,
            reposts: nextCount,
          };
        }
        return post;
      })
    );

    try {
      if (nextIsReposted) {
        await rePost(postId);
      } else {
        await unrePost(postId);
      }
    } catch (err) {
      console.error('리포스트 처리 실패:', err);
      fetchBookmarks();
    }
  };

  // 북마크 해제 (낙관적 업데이트)
  const handleBookmark = async (postId, currentIsBookmarked) => {
    const nextIsBookmarked = !currentIsBookmarked;

    setBookmarks((prev) =>
      prev.map((post) => {
        const id = post.postId || post.id;
        if (id === postId) {
          return { ...post, isBookmarked: nextIsBookmarked, bookmarked: nextIsBookmarked };
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
      console.error('북마크 처리 실패:', err);
      fetchBookmarks();
    }
  };

  return (
    <div style={{ borderLeft: '1px solid #EFF3F4', borderRight: '1px solid #EFF3F4', minHeight: '100vh' }}>
      {/* 상단 헤더 영역 */}
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)', padding: '16px', borderBottom: '1px solid #EFF3F4', zIndex: 10
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>북마크</h2>
        <div style={{ fontSize: '13px', color: '#536471', marginTop: '2px' }}>
          내 북마크
        </div>
      </div>

      {/* 북마크 리스트 렌더링 */}
      <div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>로딩 중...</div>
        ) : bookmarks.length > 0 ? (
          bookmarks.map((post) => {
            const postId = post.postId || post.id;
            
            const isLiked = post.liked ?? post.isLiked ?? false;
            const isReposted = post.reposted ?? post.isReposted ?? false;
            const isBookmarked = post.bookmarked ?? post.isBookmarked ?? true; 
            
            const likeCount = post.likeCount ?? post.likes ?? 0;
            const repostCount = post.repostCount ?? post.reposts ?? 0;
            const replyCount = post.replyCount ?? post.replies ?? 0;

            return (
              <TweetCard
                key={postId}
                author={{
                  name: post.name || post.authorName || post.user?.name || '사용자',
                  username: post.username || post.user?.username || 'user',
                  avatarUrl: post.avatarUrl || post.profileImageUrl || post.user?.avatarUrl,
                }}
                createdAt={post.createdAt}
                content={post.content}
                counts={{
                  replies: replyCount,
                  reposts: repostCount,
                  likes: likeCount,
                }}
                isLiked={isLiked}
                isReposted={isReposted}
                isBookmarked={isBookmarked}
                onClick={() => navigate(`/posts/${postId}`)}
                onBookmark={() => handleBookmark(postId, isBookmarked)}
                onLike={() => handleLike(postId, isLiked)}
                onRepost={() => handleRepost(postId, isReposted)}
              />
            );
          })
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>저장된 북마크가 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default BookmarksPage;