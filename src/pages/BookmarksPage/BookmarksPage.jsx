// src/pages/BookmarksPage/BookmarksPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, likePost, unlikePost, retweetPost, unretweetPost, bookmarkPost, unbookmarkPost } from '../../api/posts'; //[cite: 8]
import Layout from '../../components/Layout/Layout'; //[cite: 9]
import TweetCard from '../../components/TweetCard/TweetCard'; //[cite: 8]

function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 북마크 목록 불러오기
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getBookmarks();
      
      // 안전한 배열 데이터 추출 로직[cite: 7, 8]
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

  // 북마크 해제 (낙관적 업데이트)[cite: 5, 8]
  const handleBookmark = async (postId, currentIsBookmarked) => {
    // 북마크 페이지이므로 북마크 취소 시 목록에서 바로 숨기는 UI 처리도 가능합니다.
    // 여기서는 기존 상태값만 뒤집도록 처리합니다.
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
        await bookmarkPost(postId); //[cite: 8]
      } else {
        await unbookmarkPost(postId); //[cite: 8]
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
      fetchBookmarks(); // 에러 시 원래 상태로 원복[cite: 8]
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
          @{/* 유저네임이 필요하다면 user 객체에서 가져올 수 있습니다 */}내 북마크
        </div>
      </div>

      {/* 북마크 리스트 렌더링 */}
      <div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>로딩 중...</div>
        ) : bookmarks.length > 0 ? (
          bookmarks.map((post) => {
            const postId = post.postId || post.id;
            
            // API 명세서를 고려한 안전한 필드 참조[cite: 8]
            const isLiked = post.liked ?? post.isLiked ?? false;
            const isRetweeted = post.reposted ?? post.isRetweeted ?? false;
            // 북마크 목록으로 불러온 것이므로 기본적으로 true일 확률이 높음
            const isBookmarked = post.bookmarked ?? post.isBookmarked ?? true; 
            
            const likeCount = post.likeCount ?? post.likes ?? 0;
            const retweetCount = post.repostCount ?? post.retweetCount ?? post.retweets ?? 0;
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
                  retweets: retweetCount,
                  likes: likeCount,
                }}
                isLiked={isLiked}
                isRetweeted={isRetweeted}
                isBookmarked={isBookmarked}
                onClick={() => navigate(`/posts/${postId}`)}
                onBookmark={() => handleBookmark(postId, isBookmarked)}
                // 필요시 onLike, onRetweet 핸들러도 HomePage처럼 연결해 줍니다.[cite: 8]
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