import { useEffect } from 'react';
import styles from './Modal.module.css';

/**
 * 공통 모달. Figma `Dim Overlay` + 카드(radius 16, padding 28, shadow) 구조에 대응한다.
 * Settings Edit Modal 3종(아이디/이메일/비밀번호 변경)의 공통 껍데기이자,
 * 다른 확인창에도 재사용할 수 있는 범용 컴포넌트.
 *
 * @param {{
 *   onClose: () => void,
 *   title: string,
 *   children: React.ReactNode,
 *   actions?: React.ReactNode,
 * }} props
 */
function Modal({ onClose, title, children, actions }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={styles.card}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <p className={styles.title}>{title}</p>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );
}

export default Modal;
