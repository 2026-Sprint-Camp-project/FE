import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import styles from './NotificationItem.module.css';

/**
 * 공통 알림 항목. Figma `Notification Item`(아바타 50px + 메시지 + 시간)에 대응한다.
 * iconType은 Figma엔 없는 선택 요소로, 좋아요/리트윗/팔로우 등 알림 종류를
 * 아바타 위에 작은 배지로 표시하고 싶을 때만 쓴다(안 넘기면 아무것도 안 그림).
 *
 * @param {{
 *   avatarUrl?: string | null,
 *   name?: string,
 *   iconType?: 'heart' | 'retweet' | 'reply' | 'user',
 *   message: string,
 *   timestamp: string,
 *   isRead?: boolean,
 *   onClick?: () => void,
 * }} props
 */
function NotificationItem({ avatarUrl, name, iconType, message, timestamp, isRead = true, onClick }) {
  const isClickable = typeof onClick === 'function';
  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={`${styles.item} ${!isRead ? styles.unread : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatarWrap}>
        <Avatar src={avatarUrl} name={name} size={50} />
        {iconType && (
          <span className={styles.badge}>
            <Icon name={iconType} size={14} />
          </span>
        )}
      </div>
      <div className={styles.text}>
        <p className={styles.message}>{message}</p>
        <p className={styles.timestamp}>{timestamp}</p>
      </div>
    </Tag>
  );
}

export default NotificationItem;
