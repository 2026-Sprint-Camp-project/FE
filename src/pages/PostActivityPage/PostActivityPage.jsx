// src/pages/PostActivityPage/PostActivityPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getPostLikes, getPostReposts } from '../../api/posts';
import Tabs from '../../components/Tabs/Tabs';
import Avatar from '../../components/Avatar/Avatar';
import FollowButton from '../../components/FollowButton/FollowButton';

function PostActivityPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'reposts';
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEngagements = async () => {
      setIsLoading(true);
      try {
        const data = activeTab === 'likes' 
          ? await getPostLikes(postId) 
          : await getPostReposts(postId);
        
        // ✨ 백엔드 응답 형태가 어떠하든 안전하게 users 배열만 쏙 뽑아냅니다!
        let extractedUsers = [];
        if (data && Array.isArray(data.users)) {
          extractedUsers = data.users;
        } else if (data?.data && Array.isArray(data.data.users)) {
          extractedUsers = data.data.users;
        } else if (Array.isArray(data)) {
          extractedUsers = data;
        }

        setUsers(extractedUsers);
      } catch (err) {
        console.error('사용자 목록 조회 실패:', err);
        setUsers([]); // 에러 시 빈 배열로 초기화
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEngagements();
  }, [postId, activeTab]);

  return (
    <div style={{ borderLeft: '1px solid #EFF3F4', borderRight: '1px solid #EFF3F4', minHeight: '100vh' }}>
      
      {/* 상단 헤더 */}
      <header style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '16px', display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #EFF3F4', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>
          ←
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>게시 활동</h2>
      </header>

      {/* 탭 메뉴 */}
      <Tabs
        items={[
          { key: 'reposts', label: '리포스트' },
          { key: 'likes', label: '마음에 들어요' }
        ]}
        activeKey={activeTab}
        onChange={(key) => setSearchParams({ tab: key })}
      />
      
      {/* 사용자 목록 렌더링 영역 */}
      <div>
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>로딩 중...</div>
        ) : users.length > 0 ? (
          users.map(user => (
            <div 
              key={user.userId || user.id} 
              onClick={() => navigate(`/${user.username}`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #EFF3F4', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar src={user.profileImageUrl} name={user.name} size={48} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#0F1419' }}>{user.name || '사용자'}</span>
                  <span style={{ fontSize: '15px', color: '#536471' }}>@{user.username || 'user'}</span>
                </div>
              </div>
              
              {/* ✨ API 명세서에 있는 isFollowing 값을 활용한 팔로우 버튼 */}
              <div>
                <FollowButton 
                  isFollowing={user.isFollowing} 
                  onClick={(e) => {
                    e.stopPropagation(); // 버튼 클릭 시 프로필로 넘어가는 것 방지
                    console.log('팔로우 토글 연결 필요');
                  }} 
                />
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#536471' }}>
            아직 {activeTab === 'likes' ? '마음에 들어요를 누른' : '리포스트한'} 사용자가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default PostActivityPage;