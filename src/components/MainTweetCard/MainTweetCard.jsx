import React from 'react';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import styles from './MainTweetCard.module.css';

function MainTweetCard({
  author = {},
  createdAt,
  content,
  counts = {},
  // API 속성명(liked, reposted 등)과 Prop명(isLiked 등) 둘 다 지원하도록 수정
  liked,
  isLiked = liked ?? false,
  reposted,
  isReposted = reposted ?? false,
  isRetweeted = false,
  bookmarked,
  isBookmarked = bookmarked ?? false,
  onReply,
  onRepost,
  onRetweet,
  onLike,
  onBookmark,
  onShare,
  onDelete,
  onProfileClick,
  onUserClick,
}) {
  const repostCount = counts.reposts ?? counts.retweets ?? 0;
  const handleRepost = onRepost || onRetweet;
  const isRepostActive = isReposted || isRetweeted;
  const handleProfileClick = onProfileClick || onUserClick;

  return (
    <div className={styles.card}>
      {/* 1. 상단 정보 */}
      <div className={styles.header}>
        <div
          className={styles.authorInfo}
          onClick={handleProfileClick}
          style={{ cursor: handleProfileClick ? 'pointer' : 'default' }}
        >
          <Avatar src={author.avatarUrl} name={author.name} size={48} />
          <div className={styles.authorText}>
            <span className={styles.name}>{author.name || '사용자'}</span>
            <span className={styles.username}>
              @{author.username || 'user'}
            </span>
          </div>
        </div>

        {onDelete && (
          <button type="button" onClick={onDelete} className={styles.deleteButton}>
            삭제
          </button>
        )}
      </div>

      {/* 2. 트윗 본문 */}
      <div className={styles.body}>{content}</div>

      {/* 3. 작성 시간 */}
      <div className={styles.time}>{createdAt || '방금 전'}</div>

      {/* 4. 통계 바 */}
      {(repostCount > 0 || counts.likes > 0) && (
        <div className={styles.stats}>
          {repostCount > 0 && (
            <div>
              <strong className={styles.statNumber}>{repostCount}</strong> 리포스트
            </div>
          )}
          {counts.likes > 0 && (
            <div>
              <strong className={styles.statNumber}>{counts.likes}</strong> 마음에 들어요
            </div>
          )}
        </div>
      )}

      {/* 5. 하단 액션 버튼 */}
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={onReply}>
          <Icon name="reply" size={24} />
          {typeof counts.replies === 'number' && <span>{counts.replies}</span>}
        </button>

        <button
          type="button"
          className={`${styles.action} ${isRepostActive ? styles.reposted : ''}`}
          onClick={handleRepost}
        >
          <Icon name="repost" size={24} />
          {typeof repostCount === 'number' && <span>{repostCount}</span>}
        </button>

        <button
          type="button"
          className={`${styles.action} ${isLiked ? styles.liked : ''}`}
          onClick={onLike}
        >
          <Icon name="heart" size={24} />
          {typeof counts.likes === 'number' && <span>{counts.likes}</span>}
        </button>

        <button
          type="button"
          className={`${styles.action} ${isBookmarked ? styles.bookmarked : ''}`}
          onClick={onBookmark}
        >
          <Icon name="bookmark" size={24} />
        </button>

        <button type="button" className={styles.action} onClick={onShare}>
          <Icon name="share" size={24} />
        </button>
      </div>
    </div>
  );
}

export default MainTweetCard;