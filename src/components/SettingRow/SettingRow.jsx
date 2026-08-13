import styles from './SettingRow.module.css';

/**
 * 공통 설정 행. Figma `Setting Row` / `Setting Row (Toggle)`에 대응한다.
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   trailing?: 'chevron' | React.ReactNode,
 *   onClick?: () => void,
 * }} props
 */
function SettingRow({ title, description, trailing = 'chevron', onClick }) {
  const isClickable = typeof onClick === 'function';
  const Tag = isClickable ? 'button' : 'div';

  return (
    <Tag
      type={isClickable ? 'button' : undefined}
      className={styles.row}
      onClick={onClick}
    >
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {trailing === 'chevron' ? <span className={styles.chevron}>{'>'}</span> : trailing}
    </Tag>
  );
}

export default SettingRow;
