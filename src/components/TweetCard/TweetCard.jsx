import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import styles from './TweetCard.module.css';

/**
 * 공통 트윗 카드. Figma 마스터 컴포넌트 `Tweet Card`에 대응한다.
 * 좋아요/리트윗/북마크 카운트는 관계 테이블에서 파생되는 값이라 순수 props로만
 * 받고, 실제 API 연동은 페이지/훅 쪽 책임으로 둔다(콜백만 노출).
 *
 * @param {{
 *   author: { name: string, username: string, avatarUrl?: string | null },
 *   createdAt: string,
 *   content: string,
 *   counts?: { replies?: number, retweets?: number, likes?: number },
 *   isLiked?: boolean,
 *   isRetweeted?: boolean,
 *   isBookmarked?: boolean,
 *   onReply?: () => void,
 *   onRetweet?: () => void,
 *   onLike?: () => void,
 *   onBookmark?: () => void,
 *   onShare?: () => void,
 *   onMoreClick?: () => void,
 *   onClick?: () => void,
 * }} props
 */
function TweetCard({
  author,
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
  onClick,
}) {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={isClickable ? `${styles.card} ${styles.clickable}` : styles.card}
      onClick={onClick}
    >
      <Avatar src={author.avatarUrl} name={author.name} size={50} />
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.byline}>
            <p className={styles.name}>{author.name}</p>
            <p className={styles.meta}>
              @{author.username} · {createdAt}
            </p>
          </div>
          {onMoreClick && (
            <button
              type="button"
              className={styles.moreButton}
              onClick={(event) => {
                event.stopPropagation();
                onMoreClick();
              }}
              aria-label="더보기"
            >
              <Icon name="more" size={18} />
            </button>
          )}
        </div>

        <p className={styles.body}>{content}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.action}
            onClick={(event) => {
              event.stopPropagation();
              onReply?.();
            }}
          >
            <Icon name="reply" size={18} />
            {typeof counts.replies === 'number' && <span>{counts.replies}</span>}
          </button>
          <button
            type="button"
            className={isRetweeted ? `${styles.action} ${styles.retweeted}` : styles.action}
            onClick={(event) => {
              event.stopPropagation();
              onRetweet?.();
            }}
          >
            <Icon name="retweet" size={18} />
            {typeof counts.retweets === 'number' && <span>{counts.retweets}</span>}
          </button>
          <button
            type="button"
            className={isLiked ? `${styles.action} ${styles.liked}` : styles.action}
            onClick={(event) => {
              event.stopPropagation();
              onLike?.();
            }}
          >
            <Icon name="heart" size={18} />
            {typeof counts.likes === 'number' && <span>{counts.likes}</span>}
          </button>
          <button
            type="button"
            className={isBookmarked ? `${styles.action} ${styles.bookmarked}` : styles.action}
            onClick={(event) => {
              event.stopPropagation();
              onBookmark?.();
            }}
            aria-label="북마크"
          >
            <Icon name="bookmark" size={18} />
          </button>
          <button
            type="button"
            className={styles.action}
            onClick={(event) => {
              event.stopPropagation();
              onShare?.();
            }}
            aria-label="공유"
          >
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TweetCard;
