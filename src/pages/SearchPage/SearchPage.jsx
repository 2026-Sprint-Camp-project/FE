import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchPosts, searchUsers } from '../../api/search'; // API 통신 함수 경로 확인
// src/pages/SearchPage/SearchPage.jsx 상단
import Icon from '../../components/Icon/Icon'; // 👈 Icon 컴포넌트 추가

import Tabs from '../../components/Tabs/Tabs';
import TweetCard from '../../components/TweetCard/TweetCard';
import Avatar from '../../components/Avatar/Avatar';
import FollowButton from '../../components/FollowButton/FollowButton';

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL에서 ?q= 뒤의 검색어를 가져옵니다.
  const query = searchParams.get('q') || ''; 
  const [activeTab, setActiveTab] = useState('tweets'); // 'tweets' | 'users'
  
  // 검색 결과 상태 관리
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색어 입력(엔터) 핸들러
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const newQuery = e.target.value;
      if (newQuery.trim()) {
        setSearchParams({ q: newQuery });
      }
    }
  };

  // query나 탭이 바뀔 때마다 API 호출
  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'tweets') {
          const postData = await searchPosts(query);
          // 💡 배열인지, 객체 안의 데이터인지 확인해서 안전하게 추출[cite: 2]
          if (Array.isArray(postData)) setPosts(postData);
          else if (postData && Array.isArray(postData.data)) setPosts(postData.data);
          else if (postData && Array.isArray(postData.posts)) setPosts(postData.posts);
          else setPosts([]); 
        } else {
          const userData = await searchUsers(query);
          if (Array.isArray(userData)) setUsers(userData);
          else if (userData && Array.isArray(userData.data)) setUsers(userData.data);
          else if (userData && Array.isArray(userData.users)) setUsers(userData.users);
          else setUsers([]);
        }
      } catch (err) {
        console.error('검색 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, activeTab]);

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #EFF3F4', position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)', zIndex: 10 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: '#EFF3F4', 
          borderRadius: '9999px', 
          padding: '0 16px' // 좌우 여백을 주어 아이콘이 너무 벽에 붙지 않게 합니다
        }}>
          {/* ✨ 돋보기 아이콘 추가 */}
          <Icon name="search" size={20} color="#536471" />
          
          <input
            type="text"
            defaultValue={query}
            onKeyDown={handleSearch}
            placeholder="검색"
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 12px', 
              border: 'none', 
              backgroundColor: 'transparent', // 배경색을 투명하게 해서 부모 div의 회색이 보이게 합니다
              outline: 'none',
              fontSize: '15px'
            }}
          />
        </div>

      {/* 2. 분류 탭 */}
      <Tabs
        items={[
          { key: 'tweets', label: '트윗' },
          { key: 'users', label: '유저' },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

      {/* 3. 검색 결과 리스트 */}
      <div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>검색 중...</div>
        ) : activeTab === 'tweets' ? (
          // 📝 트윗 검색 결과 렌더링
          posts.length > 0 ? (
            posts.map((post) => {
              const postId = post.postId || post.id;
              // 데이터 추출 시 백엔드의 다양한 필드명을 안전하게 커버합니다[cite: 2]
              const authorName = post.name || post.authorName || post.user?.name || post.author?.name || '사용자';
              const username = post.username || post.user?.username || post.author?.username || 'user';
              const avatarUrl = post.avatarUrl || post.profileImageUrl || post.user?.avatarUrl;
              
              const replyCount = post.replyCount ?? post.replies ?? post.counts?.replies ?? 0;
              const repostCount = post.repostCount ?? post.repostCount ?? post.reposts ?? 0;
              const likeCount = post.likeCount ?? post.likes ?? post.counts?.likes ?? 0;

              return (
                <TweetCard
                  key={postId}
                  author={{
                    name: authorName,
                    username: username,
                    avatarUrl: avatarUrl,
                  }}
                  createdAt={post.createdAt}
                  content={post.content}
                  counts={{
                    replies: replyCount,
                    reposts: repostCount,
                    likes: likeCount,
                  }}
                  isLiked={post.liked ?? post.isLiked ?? false}
                  isReposted={post.reposted ?? post.isReposted ?? false}
                  isBookmarked={post.bookmarked ?? post.isBookmarked ?? false}
                  onClick={() => navigate(`/posts/${postId}`)}
                />
              );
            })
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>"{query}"에 대한 트윗 검색 결과가 없습니다.</div>
          )
        ) : (
          // 👥 유저 검색 결과 렌더링
          users.length > 0 ? (
            users.map((user) => (
              <div 
                key={user.userId || user.id} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '16px', borderBottom: '1px solid #EFF3F4', cursor: 'pointer'
                }}
                onClick={() => navigate(`/${user.username}`)} // 프로필 페이지 이동
              >
                {/* 좌측: 아바타 및 이름/아이디 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar src={user.avatarUrl || user.profileImageUrl} name={user.name} size={48} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0F1419' }}>{user.name}</span>
                    <span style={{ fontSize: '15px', color: '#536471' }}>@{user.username}</span>
                    {user.bio && (
                      <span style={{ fontSize: '14px', color: '#0F1419', marginTop: '4px' }}>{user.bio}</span>
                    )}
                  </div>
                </div>

                {/* 우측: 팔로우 버튼 */}
                <div>
                  <FollowButton 
                    isFollowing={user.isFollowing} 
                    onClick={(e) => {
                      e.stopPropagation(); // 버튼 클릭 시 프로필로 이동하지 않도록 방지
                      console.log(`${user.name} 팔로우 동작 연결 필요`);
                      // TODO: 팔로우/언팔로우 API 연결
                    }} 
                  />
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>"{query}"에 대한 유저 검색 결과가 없습니다.</div>
          )
        )}
      </div>
    </div>
  );
}

export default SearchPage;
