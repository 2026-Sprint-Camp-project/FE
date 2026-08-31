// src/components/RightSidebar/RightSidebar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import styles from '../Layout/Layout.module.css';

// JWT 토큰 디코딩 함수 (라이브러리 없이 순수 JS로 구현)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function RightSidebar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  useEffect(() => {
    async function fetchUsersFromPosts() {
      try {
        // 1. localStorage의 accessToken에서 유저 정보 파싱
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
        const tokenPayload = token ? parseJwt(token) : null;

        // JWT 토큰 내 필드 확인 (userId, id, username, sub 등)
        const currentUserId = tokenPayload?.userId || tokenPayload?.id || tokenPayload?.sub;
        const currentUsername = tokenPayload?.username || tokenPayload?.sub;

        console.log('JWT 토큰 파싱 유저 정보:', { currentUserId, currentUsername, tokenPayload });

        // 2. 게시글 목록 조회
        const posts = await getPosts();
        const postsArray = Array.isArray(posts) ? posts : (posts.data || posts.posts || []);

        const userMap = new Map();

        postsArray.forEach((post) => {
          const userObj = post.user || post.author || post;
          const username = userObj.username || post.username;
          const name = userObj.name || userObj.nickname || post.nickname || username;
          const id = userObj.id || userObj.userId || userObj._id;

          if (username && !userMap.has(username)) {
            userMap.set(username, {
              id: id,
              name: name,
              username: username,
            });
          }
        });

        const uniqueUsers = Array.from(userMap.values());

        // 3. 본인 계정 필터링 (id 또는 username 비교)
        const filteredUsers = uniqueUsers.filter((user) => {
          const isSameId = currentUserId && String(user.id) === String(currentUserId);
          const isSameUsername = currentUsername && String(user.username) === String(currentUsername);

          return !isSameId && !isSameUsername;
        });

        // 4. 무작위 셔플 후 3명 선택
        const shuffled = filteredUsers.sort(() => 0.5 - Math.random());
        setRecommendedUsers(shuffled.slice(0, 3));
      } catch (error) {
        console.error('추천 계정 로드 실패:', error);
      }
    }

    fetchUsersFromPosts();
  }, []);

  const handleFollow = async (targetUserId) => {
    if (!targetUserId) {
      alert('유저 ID 정보가 누락되었습니다.');
      return;
    }
    try {
      console.log(`POST /users/${targetUserId}/follow 요청 실행`);
    } catch (error) {
      console.error('팔로우 요청 실패:', error);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <aside className={styles.rightSidebar}>
      <form
        onSubmit={handleSearchSubmit}
        style={{ background: '#eff3f4', borderRadius: '9999px', padding: '12px 16px' }}
      >
        <input
          type="text"
          placeholder="검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '15px',
          }}
        />
      </form>

      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          무엇이 진행 중인지 살펴보세요
        </h3>
        <div style={{ margin: '12px 0' }}>
          <p style={{ fontSize: '12px', color: '#536471' }}>대한민국에서 트렌드 중</p>
          <p style={{ fontWeight: 'bold' }}>#스프린트캠프</p>
          <p style={{ fontSize: '12px', color: '#536471' }}>1,234 게시물</p>
        </div>
        <div style={{ margin: '12px 0' }}>
          <p style={{ fontSize: '12px', color: '#536471' }}>기술 · 트렌드</p>
          <p style={{ fontWeight: 'bold' }}>React</p>
          <p style={{ fontSize: '12px', color: '#536471' }}>8,520 게시물</p>
        </div>
      </div>

      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          팔로우할 만한 계정
        </h3>
        {recommendedUsers.length > 0 ? (
          recommendedUsers.map((user) => (
            <div
              key={user.id || user.username}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '12px 0',
                gap: '12px',
              }}
            >
              <div
                onClick={() => navigate(`/${user.username}`)}
                style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
              >
                <p
                  style={{
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#536471',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  @{user.username}
                </p>
              </div>

              <button
                onClick={() => handleFollow(user.id)}
                style={{
                  backgroundColor: '#0f1419',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '6px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                팔로우
              </button>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '13px', color: '#536471' }}>추천 계정이 없습니다.</p>
        )}
      </div>
    </aside>
  );
}

export default RightSidebar;