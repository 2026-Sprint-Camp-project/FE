import Icon from '../Icon/Icon';
import styles from './Avatar.module.css';

/**
 * 공통 아바타 컴포넌트. Figma 마스터 컴포넌트 `Avatar`(원형)에 대응한다.
 * mockUsers.profileImageUrl이 항상 null이므로 src가 없을 때의 대체 표시를
 * 기본으로 지원한다(user 아이콘 실루엣).
 *
 * @param {{ src?: string | null, name?: string, size?: number, className?: string }} props
 */
function Avatar({ src, name = '', size = 40, className, ...rest }) {
  return (
    <div
      className={className ? `${styles.avatar} ${className}` : styles.avatar}
      style={{ width: size, height: size }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} className={styles.image} />
      ) : (
        <Icon name="user" size={Math.round(size * 0.6)} className={styles.placeholder} />
      )}
    </div>
  );
}

export default Avatar;
