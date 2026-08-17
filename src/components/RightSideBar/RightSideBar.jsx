// src/components/RightSidebar/RightSidebar.jsx
import React from 'react';
import styles from '../Layout/Layout.module.css'; // Layout.module.css 불러오기

function RightSidebar() {
  return (
    <aside className={styles.rightSidebar}>
      {/* 1. 검색 영역 */}
      <div style={{ background: '#eff3f4', borderRadius: '9999px', padding: '12px 16px' }}>
        <input
          type="text"
          placeholder="검색"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '15px',
          }}
        />
      </div>

      {/* 2. 실시간 트렌드 위젯 */}
      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          무엇이 진행 중인지 살펴보세요
        </h3>
        <div style={{ margin: '12px 0' }}>
          <p style={{ fontSize: '12px', color: '#536471' }}>대한민국에서 트렌드 중</p>
          <p style={{ fontWeight: 'bold' }}>#스프링캠프</p>
          <p style={{ fontSize: '12px', color: '#536471' }}>1,234 게시물</p>
        </div>
        <div style={{ margin: '12px 0' }}>
          <p style={{ fontSize: '12px', color: '#536471' }}>기술 · 트렌드</p>
          <p style={{ fontWeight: 'bold' }}>React</p>
          <p style={{ fontSize: '12px', color: '#536471' }}>8,520 게시물</p>
        </div>
      </div>

      {/* 3. 팔로우 추천 위젯 */}
      <div style={{ background: '#f7f9f9', borderRadius: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          팔로우할 만한 계정
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
          <div>
            <p style={{ fontWeight: 'bold' }}>이서연</p>
            <p style={{ fontSize: '13px', color: '#536471' }}>@seoyeon</p>
          </div>
          <button style={{ backgroundColor: '#0f1419', color: '#fff', border: 'none', borderRadius: '9999px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            팔로우
          </button>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;