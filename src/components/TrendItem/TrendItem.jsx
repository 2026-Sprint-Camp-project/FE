import styles from './TrendItem.module.css';

/**
 * 공통 트렌드 항목. Figma `Trend Item`(사이드바 "추천 패널")에 대응한다.
 *
 * @param {{ category: string, hashtag: string, postCount: string, onClick?: () => void }} props
 */
function TrendItem({ category, hashtag, postCount, onClick }) {
  const isClickable = typeof onClick === 'function';
  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag type={isClickable ? 'button' : undefined} className={styles.item} onClick={onClick}>
      <p className={styles.category}>{category}</p>
      <p className={styles.hashtag}>{hashtag}</p>
      <p className={styles.postCount}>{postCount}</p>
    </Tag>
  );
}

export default TrendItem;
