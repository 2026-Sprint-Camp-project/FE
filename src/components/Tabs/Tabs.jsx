import styles from './Tabs.module.css';

/**
 * 공통 탭 컴포넌트. Figma `Tabs`(홈피드 추천/팔로우 중, 검색결과 트윗/유저)에 대응한다.
 *
 * @param {{
 *   items: { key: string, label: string }[],
 *   activeKey: string,
 *   onChange: (key: string) => void,
 * }} props
 */
function Tabs({ items, activeKey, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={styles.tab}
            onClick={() => onChange(item.key)}
          >
            <span className={isActive ? styles.labelActive : styles.label}>{item.label}</span>
            {isActive && <span className={styles.indicator} />}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
