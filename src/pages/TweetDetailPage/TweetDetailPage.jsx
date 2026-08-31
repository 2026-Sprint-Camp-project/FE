// src/pages/TweetDetailPage/TweetDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPostDetail,
  getPosts,
  createReply,
  likePost,
  unlikePost,
  bookmarkPost,
  unbookmarkPost,
  rePost,
  unrePost,
  deletePost,
  updatePost
} from '../../api/posts';

import MainTweetCard from '../../components/MainTweetCard/MainTweetCard';
import TweetCard from '../../components/TweetCard/TweetCard';
import ReplyForm from '../../components/ReplyForm/ReplyForm';
import Modal from '../../components/Modal/Modal';
import ComposeBox from '../../components/ComposeBox/ComposeBox';

function TweetDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 데이터 불러오기 (상세 게시글 + 답글 프론트엔드 필터링)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 메인 게시글 상세 데이터 가져오기
        const postData = await getPostDetail(postId);
        let currentPost = postData?.data || postData;

        // 답글 및 전체 게시글 목록 가져오기
        try {
          const allPostsData = await getPosts();

          let allPosts = [];
          if (Array.isArray(allPostsData)) allPosts = allPostsData;
          else if (allPostsData?.data && Array.isArray(allPostsData.data)) allPosts = allPostsData.data;
          else if (allPostsData?.posts && Array.isArray(allPostsData.posts)) allPosts = allPostsData.posts;

          // 전체 목록(allPosts)에서 현재 글을 찾아 liked, reposted 최신 상태 동기화
          const targetInList = allPosts.find(
            (p) => String(p.postId || p.id) === String(postId)
          );

          if (targetInList) {
            currentPost = {
              ...currentPost,
              liked: targetInList.liked ?? currentPost.liked,
              reposted: targetInList.reposted ?? currentPost.reposted,
              bookmarked: targetInList.bookmarked ?? currentPost.bookmarked,
              likeCount: targetInList.likeCount ?? currentPost.likeCount,
              repostCount: targetInList.repostCount ?? currentPost.repostCount,
            };
          }

          // 전체 글 중에서 replyToPostId가 현재 글의 postId와 일치하는 것만 걸러내기
          const filteredReplies = allPosts.filter(
            (p) => p.replyToPostId === Number(postId) || p.replyToPostId === String(postId)
          );

          setReplies(filteredReplies);
        } catch (e) {
          console.log('답글 및 상태 동기화 실패:', e);
        }

        setPost(currentPost);
      } catch (err) {
        console.error('상세 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // 프로필 이동 핸들러 (이벤트 버블링 방지 포함)
  const handleUserClick = (e, username) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (username) {
      navigate(`/${username}`);
    }
  };

  // 2. 답글 작성 핸들러
  const handleReplySubmit = async (content) => {
    try {
      const response = await createReply(postId, content);

      const newReply = {
        id: response.postId || Date.now(),
        content: content,
        createdAt: '방금 전',
        authorName: '사용자',
        username: 'user',
      };

      setReplies((prevReplies) => [newReply, ...prevReplies]);
      setPost((prev) => ({
        ...prev,
        replyCount: (prev?.replyCount || 0) + 1,
        counts: { ...prev?.counts, replies: (prev?.counts?.replies || 0) + 1 }
      }));

      alert('답글이 등록되었습니다!');
    } catch (err) {
      console.error('답글 작성 실패:', err);
      alert('답글 등록에 실패했습니다.');
    }
  };

  // 3. 좋아요 핸들러
  const handleLike = async () => {
    if (!post) return;
    const currentIsLiked = post.liked ?? post.isLiked ?? false;
    const nextIsLiked = !currentIsLiked;
    const nextLikeCount = nextIsLiked
      ? (post.likeCount ?? post.likes ?? 0) + 1
      : Math.max(0, (post.likeCount ?? post.likes ?? 0) - 1);

    setPost(prev => ({
      ...prev,
      liked: nextIsLiked,
      isLiked: nextIsLiked,
      likeCount: nextLikeCount,
      likes: nextLikeCount
    }));

    try {
      if (nextIsLiked) await likePost(postId);
      else await unlikePost(postId);
    } catch (err) {
      console.error('좋아요 실패:', err);
    }
  };

  // 4. 리포스트 핸들러
  const handleRepost = async () => {
    if (!post) return;
    const currentIsReposted = post.reposted ?? post.isReposted ?? post.isRetweeted ?? false;
    const nextIsReposted = !currentIsReposted;
    const nextRepostCount = nextIsReposted
      ? (post.repostCount ?? post.reposts ?? post.retweetCount ?? 0) + 1
      : Math.max(0, (post.repostCount ?? post.reposts ?? post.retweetCount ?? 0) - 1);

    setPost(prev => ({
      ...prev,
      reposted: nextIsReposted,
      isReposted: nextIsReposted,
      isRetweeted: nextIsReposted,
      repostCount: nextRepostCount,
      retweetCount: nextRepostCount
    }));

    try {
      if (nextIsReposted) await rePost(postId);
      else await unrePost(postId);
    } catch (err) {
      console.error('리포스트 실패:', err);
    }
  };

  // 5. 북마크 핸들러
  const handleBookmark = async () => {
    if (!post) return;
    const currentIsBookmarked = post.bookmarked ?? post.isBookmarked ?? false;
    const nextIsBookmarked = !currentIsBookmarked;

    setPost(prev => ({
      ...prev,
      bookmarked: nextIsBookmarked,
      isBookmarked: nextIsBookmarked
    }));

    try {
      if (nextIsBookmarked) await bookmarkPost(postId);
      else await unbookmarkPost(postId);
    } catch (err) {
      console.error('북마크 실패:', err);
    }
  };

  // 6. 공유 핸들러
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/posts/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('게시물 링크가 클립보드에 복사되었습니다!');
  };

  // 7. 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePost(postId);
      alert('게시글이 삭제되었습니다.');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('게시글 삭제 실패:', err);
      alert('게시글 삭제에 실패했습니다. (작성자 본인만 가능)');
    }
  };

  // --- 게시글 수정 관련 핸들러 (Layout.jsx와 동일 방식) ---
  const handleOpenEdit = () => {
    setEditContent(post?.content || '');
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditContent('');
  };

  const handleEditChange = (eOrValue) => {
    const text = typeof eOrValue === 'string' ? eOrValue : eOrValue?.target?.value;
    setEditContent(text ?? '');
  };

  const handleEditSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 수정 API 호출
      await updatePost(postId, editContent);

      // UI 상의 게시글 내용 업데이트
      setPost(prev => ({
        ...prev,
        content: editContent
      }));

      handleCloseEdit();
      alert('게시글이 수정되었습니다.');
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다. (작성자 본인만 가능)');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>로딩 중...</div>;
  if (!post) return <div style={{ padding: '20px' }}>게시글을 찾을 수 없습니다.</div>;

  const mainAuthorUsername = post?.username || post?.user?.username;

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
        postId={post.postId || post.id}
        author={{
          name: post?.name || post?.authorName || post?.user?.name || '사용자',
          username: mainAuthorUsername || 'user',
          avatarUrl: post?.avatarUrl || post?.profileImageUrl || post?.user?.avatarUrl,
        }}
        createdAt={post?.createdAt}
        content={post?.content}
        counts={{
          replies: post?.replyCount ?? replies.length ?? 0,
          reposts: post?.repostCount ?? post?.reposts ?? post?.retweetCount ?? 0,
          likes: post?.likeCount ?? post?.likes ?? 0,
        }}
        isLiked={post.liked ?? post?.liked ?? post?.isLiked ?? false}
        isReposted={post.reposted ?? post?.reposted ?? post?.isReposted ?? post?.isRetweeted ?? false}
        isRetweeted={post.retweeted ?? post?.reposted ?? post?.isReposted ?? post?.isRetweeted ?? false}
        isBookmarked={post.bookmarked ?? post?.bookmarked ?? post?.isBookmarked ?? false}
        onLike={handleLike}
        onRepost={handleRepost}
        onRetweet={handleRepost}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onProfileClick={(e) => handleUserClick(e, mainAuthorUsername)}
        onUserClick={(e) => handleUserClick(e, mainAuthorUsername)}
      />

      {/* 답글 입력 폼 */}
      <ReplyForm onSubmit={handleReplySubmit} />

      {/* 답글 리스트 */}
      <div>
        {Array.isArray(replies) && replies.length > 0 ? (
          replies.map((reply) => {
            const replyUsername = reply.username || reply.user?.username;
            const replyId = reply.id || reply.postId;

            return (
              <TweetCard
                key={replyId}
                author={{
                  name: reply.name || reply.authorName || reply.user?.name || '사용자',
                  username: replyUsername || 'user',
                  avatarUrl: reply.avatarUrl || reply.profileImageUrl || reply.user?.avatarUrl,
                }}
                createdAt={reply.createdAt}
                content={reply.content}
                counts={{
                  replies: reply.replyCount || 0,
                  reposts: reply.repostCount || reply.retweetCount || 0,
                  likes: reply.likeCount || reply.likes || 0,
                }}
                onClick={() => navigate(`/posts/${replyId}`)}
                onProfileClick={(e) => handleUserClick(e, replyUsername)}
                onUserClick={(e) => handleUserClick(e, replyUsername)}
              />
            );
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#536471' }}>
            첫 번째 답글을 남겨보세요!
          </div>
        )}
      </div>

      {/* Layout과 동일한 방식의 게시글 수정 모달 */}
      {isEditOpen && (
        <Modal onClose={handleCloseEdit}>
          <ComposeBox
            value={editContent}
            onChange={handleEditChange}
            onSubmit={handleEditSubmit}
            variant="default"
            submitLabel={isSubmitting ? '수정 중...' : '수정하기'}
          />
        </Modal>
      )}

    </div>
  );
}

export default TweetDetailPage;