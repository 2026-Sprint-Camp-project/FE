import React, { useState, useEffect } from 'react';
import { getPosts, createPost } from '../../api/posts';
import { useNavigate } from 'react-router-dom';
import Tabs from '../../components/Tabs/Tabs';
import ComposeBox from '../../components/ComposeBox/ComposeBox';
import TweetCard from '../../components/TweetCard/TweetCard';

function HomePage() {
  const [activeTab, setActiveTab] = useState('recommend');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const response = await getPosts();
      
      // 응답 형식이 배열인지 객체 내부 배열인지 안전하게 점검하여 상태 저장
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

  // 새 글 작성
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
        posts.map((post) => (
          <TweetCard
            key={post.postId || post.id}
            author={{
              name: post.authorName || post.user?.name || '사용자',
              username: post.username || post.user?.username || 'user',
              avatarUrl: post.avatarUrl || post.user?.avatarUrl,
            }}
            createdAt={post.createdAt}
            content={post.content}
            counts={{
              replies: post.replyCount ?? 0,
              retweets: post.retweetCount ?? 0,
              likes: post.likeCount ?? 0,
            }}
            isLiked={post.isLiked}
            // 클릭 시 상세 페이지로 이동하도록 추가
            onClick={() => navigate(`/posts/${post.postId || post.id}`)}
          />
        ))
      ) : (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#536471' }}>
          게시글이 없습니다. 첫 번째 글을 작성해 보세요!
        </div>
      )}
    </div>
  );
}

export default HomePage;