// src/components/RightSidebar/RightSidebar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../api/posts';
import styles from '../Layout/Layout.module.css'; // Layout.module.css 불러오기

function RightSidebar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [recommendedUsers, setRecommendedUsers] = useState([]);

  useEffect(() => {
    async function fetchUsersFromPosts() {
      try {
        // 1. 실제 전체 게시글 목록 조회
        const posts = await getPosts();
        const postsArray = Array.isArray(posts) ? posts : (posts.data || posts.posts || []);

        // 2. 게시글들에서 작성자(User) 정보 중복 없이 추출
        const userMap = new Map();

        postsArray.forEach((post) => {
          // 백엔드 게시글 데이터 구조에 대응 (post.user, post.author, 혹은 post 자체 필드)
          const userObj = post.user || post.author || post;
          const username = userObj.username || post.username;
          const name = userObj.name || userObj.nickname || post.nickname || username;

          if (username && !userMap.has(username)) {
            userMap.set(username, {
              id: userObj.id || userObj._id || username,
              name: name,
              username: username,
            });
          }
        });

        const uniqueUsers = Array.from(userMap.values());

        // 3. 추출한 실제 유저들을 무작위 셔플 후 3명만 추출
        const shuffled = uniqueUsers.sort(() => 0.5 - Math.random());
        setRecommendedUsers(shuffled.slice(0, 3));
      } catch (error) {
        console.error('추천 계정 로드 실패:', error);
      }
    }

    fetchUsersFromPosts();
  }, []);

  // 검색창 제출 시 /search 페이지로 이동해서 실제 검색을 수행한다.
  // (트렌드/추천 계정 위젯은 아직 목업 — 여기서는 손대지 않음)
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <aside className={styles.rightSidebar}>
      {/* 1. 검색 영역 */}
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

      {/* 2. 실시간 트렌드 위젯 */}
      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px' }}>
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

      {/* 3. 팔로우 추천 위젯 */}
      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px', marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          팔로우할 만한 계정
        </h3>
        {recommendedUsers.length > 0 ? (
          recommendedUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                margin: '12px 0',
                gap: '12px',
              }}
            >
              {/* 클릭 시 유저 프로필로 이동하는 영역 */}
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