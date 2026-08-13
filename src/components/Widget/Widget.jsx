import styles from './Widget.module.css';

/**
 * 공통 사이드바 위젯 컨테이너. Figma "추천 패널"(트렌드) / "팔로우 추천" 패널의
 * 공통 껍데기(bg/secondary, radius 16, padding 16, title 20px bold)에 대응한다.
 * 안에 들어갈 항목(TrendItem, UserRow 등)은 children으로 채운다.
 *
 * @param {{ title: string, children: React.ReactNode, footer?: React.ReactNode }} props
 */
function Widget({ title, children, footer }) {
  return (
    <section className={styles.widget}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
}

export default Widget;
