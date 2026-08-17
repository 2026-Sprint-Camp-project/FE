import Button from '../../components/Button/Button';
import styles from './ListsPage.module.css';

function ListsPage() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <p className={styles.title}>리스트</p>
      </header>

      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>아직 만든 리스트가 없어요</p>
        <p className={styles.emptyDescription}>
          관심 있는 사람들을 리스트로 모아 보세요.
        </p>
        <Button disabled>새 리스트 만들기</Button>
      </div>
    </div>
  );
}

export default ListsPage;
