// src/components/MainTweetCard/MainTweetCard.jsx
import React from 'react';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';

function MainTweetCard({
  author = {},
  createdAt,
  content,
  counts = {},
  isLiked = false,
  isRetweeted = false,
  isBookmarked = false,
  onReply,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onMoreClick,
}) {
  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #EFF3F4', backgroundColor: '#ffffff' }}>
      
      {/* 1. 작성자 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar src={author.avatarUrl} name={author.name} size={48} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0F1419' }}>
              {author.name || '김개발'}
            </span>
            <span style={{ fontSize: '14px', color: '#536471' }}>
              @{author.username || 'user'}
            </span>
          </div>
        </div>
        
        {onMoreClick && (
          <button 
            onClick={onMoreClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#536471' }}
          >
            <Icon name="more" size={20} />
          </button>
        )}
      </div>

      {/* 2. 트윗 본문 */}
      <div style={{
        fontSize: '20px',
        lineHeight: '1.4',
        color: '#0F1419',
        marginBottom: '16px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {content}
      </div>

      {/* 3. 작성 시간 */}
      <div style={{ fontSize: '15px', color: '#536471', paddingBottom: '16px', borderBottom: '1px solid #EFF3F4' }}>
        {createdAt || '방금 전'}
      </div>

      {/* 4. 중단 통계 바 (리트윗 / 마음에 들어요 총 수) */}
      {(counts.retweets > 0 || counts.likes > 0) && (
        <div style={{
          display: 'flex',
          gap: '20px',
          padding: '16px 0',
          borderBottom: '1px solid #EFF3F4',
          fontSize: '15px',
          color: '#536471'
        }}>
          {counts.retweets > 0 && (
            <div><strong style={{ color: '#0F1419' }}>{counts.retweets}</strong> 리트윗</div>
          )}
          {counts.likes > 0 && (
            <div><strong style={{ color: '#0F1419' }}>{counts.likes}</strong> 마음에 들어요</div>
          )}
        </div>
      )}

      {/* 5. ✨ 하단 아이콘 + 숫자 표시 버튼 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '12px' }}>
        
        {/* 답글 아이콘 + 숫자 */}
        <button type="button" style={actionBtnStyle} onClick={onReply}>
          <Icon name="reply" size={20} color="#536471" />
          <span style={{ fontSize: '13px', color: '#536471' }}>
            {counts.replies ?? 0}
          </span>
        </button>

        {/* 리트윗 아이콘 + 숫자 */}
        <button 
          type="button" 
          style={actionBtnStyle} 
          onClick={onRetweet}
        >
          <Icon name="retweet" size={20} color={isRetweeted ? '#00BA7C' : '#536471'} />
          <span style={{ fontSize: '13px', color: isRetweeted ? '#00BA7C' : '#536471' }}>
            {counts.retweets ?? 0}
          </span>
        </button>

        {/* 좋아요 아이콘 + 숫자 */}
        <button 
          type="button" 
          style={actionBtnStyle} 
          onClick={onLike}
        >
          <Icon name="heart" size={20} color={isLiked ? '#F91880' : '#536471'} />
          <span style={{ fontSize: '13px', color: isLiked ? '#F91880' : '#536471' }}>
            {counts.likes ?? 0}
          </span>
        </button>

        {/* 북마크 아이콘 */}
        <button type="button" style={actionBtnStyle} onClick={onBookmark}>
          <Icon name="bookmark" size={20} color={isBookmarked ? '#1D9BF0' : '#536471'} />
        </button>

        {/* 공유 아이콘 */}
        <button type="button" style={actionBtnStyle} onClick={onShare}>
          <Icon name="share" size={20} color="#536471" />
        </button>

      </div>

    </div>
  );
}

// 아이콘과 숫자가 가로로 정렬되도록 정돈된 버튼 스타일
const actionBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px', // 아이콘과 숫자 사이 간격
  padding: '8px 12px',
  borderRadius: '20px',
  transition: 'background-color 0.2s',
};

export default MainTweetCard;