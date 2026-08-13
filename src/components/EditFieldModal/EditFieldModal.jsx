import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './EditFieldModal.module.css';

/**
 * 필드 1개를 수정하는 확인 모달. Figma `Settings Edit Modal / Username|Email|Password`
 * 3종을 하나로 일반화한 것(구조가 완전히 동일: 설명문 + Input 1개 + 취소/확인 버튼).
 *
 * @param {{
 *   title: string,
 *   description?: string,
 *   fieldProps: React.ComponentProps<typeof Input>,
 *   onCancel: () => void,
 *   onConfirm: () => void,
 *   confirmText?: string,
 *   cancelText?: string,
 *   isSubmitting?: boolean,
 * }} props
 */
function EditFieldModal({
  title,
  description,
  fieldProps,
  onCancel,
  onConfirm,
  confirmText = '변경하기',
  cancelText = '취소',
  isSubmitting = false,
}) {
  return (
    <Modal
      onClose={onCancel}
      title={title}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isSubmitting}>
            {confirmText}
          </Button>
        </>
      }
    >
      {description && <p className={styles.description}>{description}</p>}
      <Input {...fieldProps} />
    </Modal>
  );
}

export default EditFieldModal;
