// src/pages/TweetDetailPage/TweetDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPostDetail, 
  getReplies, 
  likePost, 
  unlikePost, 
  bookmarkPost, 
  unbookmarkPost, 
  rePost, 
  unrePost,
  deletePost 
} from '../../api/posts';

import MainTweetCard from '../../components/MainTweetCard/MainTweetCard';
import TweetCard from '../../components/TweetCard/TweetCard';
import ReplyForm from '../../components/ReplyForm/ReplyForm';

function TweetDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await deletePost(postId);
      alert('게시글이 삭제되었습니다.');
      // 삭제 성공 시 홈 피드로 이동 (뒤로 가기 방지)
      navigate('/', { replace: true }); 
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다. (작성자 본인만 가능)');
    }
  };

  // 트윗 상세 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postData = await getPostDetail(postId);
        setPost(postData?.data || postData);

        try {
          const replyData = await getReplies(postId);
          setReplies(replyData?.data || replyData || []);
        } catch (e) {
          console.log('답글 목록 불러오기 생략');
        }
      } catch (err) {
        console.error('상세 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // ❤️ 좋아요 클릭 핸들러 (낙관적 업데이트)
  const handleLike = async () => {
    if (!post) return;

    const prevPost = { ...post };
    const nextIsLiked = !post.isLiked;
    const nextLikeCount = nextIsLiked 
      ? (post.likeCount || post.counts?.likes || 0) + 1 
      : Math.max(0, (post.likeCount || post.counts?.likes || 0) - 1);

    // 1. UI 우선 변경
    setPost({
      ...post,
      isLiked: nextIsLiked,
      likeCount: nextLikeCount,
      counts: { ...post.counts, likes: nextLikeCount },
    });

    // 2. 백그라운드 API 호출
    try {
      if (nextIsLiked) {
        await likePost(postId);
      } else {
        await unlikePost(postId);
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      setPost(prevPost); // 실패 시 이전 상태로 원복
    }
  };

  // 🔁 리포스트 클릭 핸들러
  const handleRepost = async () => {
    if (!post) return;

    const prevPost = { ...post };
    const nextIsReposted = !post.isReposted;
    const nextRepostCount = nextIsReposted 
      ? (post.repostCount || post.counts?.reposts || 0) + 1 
      : Math.max(0, (post.repostCount || post.counts?.reposts || 0) - 1);

    setPost({
      ...post,
      isReposted: nextIsReposted,
      repostCount: nextRepostCount,
      counts: { ...post.counts, reposts: nextRepostCount },
    });

    try {
      if (nextIsReposted) {
        await rePost(postId);
      } else {
        await unrePost(postId);
      }
    } catch (err) {
      console.error('리포스트 처리 실패:', err);
      setPost(prevPost);
    }
  };

  // 🔖 북마크 클릭 핸들러
  const handleBookmark = async () => {
    if (!post) return;

    const prevPost = { ...post };
    const nextIsBookmarked = !post.isBookmarked;

    setPost({
      ...post,
      isBookmarked: nextIsBookmarked,
    });

    try {
      if (nextIsBookmarked) {
        await bookmarkPost(postId);
      } else {
        await unbookmarkPost(postId);
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
      setPost(prevPost);
    }
  };

  // 📤 공유 클릭 핸들러 (클립보드 주소 복사)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('게시물 링크가 클립보드에 복사되었습니다!');
  };

  if (loading) return <div style={{ padding: '20px' }}>로딩 중...</div>;
  if (!post) return <div style={{ padding: '20px' }}>게시글을 찾을 수 없습니다.</div>;

  return (
    <div style={{ borderLeft: '1px solid #EFF3F4', borderRight: '1px solid #EFF3F4', minHeight: '100vh' }}>
      
      {/* 헤더 */}
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)', padding: '12px 16px', borderBottom: '1px solid #EFF3F4',
        display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
          ←
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>게시물</h2>
      </div>

      {/* 메인 게시글 카드 */}
      <MainTweetCard
        author={{
          name: post?.authorName || post?.user?.name || post?.author?.name || '사용자',
          username: post?.username || post?.user?.username || post?.author?.username || 'user',
          avatarUrl: post?.avatarUrl || post?.user?.avatarUrl || post?.author?.avatarUrl,
        }}
        createdAt={post?.createdAt}
        content={post?.content}
        counts={{
          replies: post?.replyCount ?? replies.length,
          reposts: post?.repostCount ?? post?.counts?.reposts ?? 0,
          likes: post?.likeCount ?? post?.counts?.likes ?? 0,
        }}
        isLiked={post?.isLiked}
        isReposted={post?.isReposted}
        isBookmarked={post?.isBookmarked}
        onLike={handleLike}
        onRepost={handleRepost}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      {/* 답글 입력 */}
      <ReplyForm onSubmit={() => {}} />

      {/* 답글 리스트 */}
      <div>
        {Array.isArray(replies) && replies.length > 0 ? (
          replies.map((reply) => (
            <TweetCard
              key={reply.id || reply.replyId}
              author={{
                name: reply.authorName || reply.user?.name || '익명',
                username: reply.username || reply.user?.username || 'user',
                avatarUrl: reply.avatarUrl || reply.user?.avatarUrl,
              }}
              createdAt={reply.createdAt}
              content={reply.content}
              counts={{
                replies: reply.replyCount || 0,
                reposts: reply.repostCount || 0,
                likes: reply.likeCount || 0,
              }}
            />
          ))
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#536471' }}>
            첫 번째 답글을 남겨보세요!
          </div>
        )}
      </div>

    </div>
  );
}

export default TweetDetailPage;