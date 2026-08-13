import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import Button from '../Button/Button';
import styles from './ComposeBox.module.css';

const TOOLBAR_ICONS = ['image', 'poll', 'emoji', 'schedule'];

/**
 * 공통 트윗 작성창. Figma `Compose Box`(홈피드, 툴바 포함)와
 * `Reply Compose`(트윗 상세, 한 줄짜리 답글창)를 variant로 겸용한다.
 *
 * 이미지/설문/이모지/예약 툴바 아이콘은 1차 범위에서 시각 표시만 하고
 * 클릭 동작은 없다(파일 업로드 등 관련 API가 아직 없음).
 *
 * @param {{
 *   avatarUrl?: string | null,
 *   value: string,
 *   onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
 *   onSubmit: () => void,
 *   placeholder?: string,
 *   submitLabel?: string,
 *   variant?: 'default' | 'compact',
 *   disabled?: boolean,
 * }} props
 */
function ComposeBox({
  avatarUrl,
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  variant = 'default',
  disabled = false,
}) {
  const isCompact = variant === 'compact';
  const canSubmit = !disabled && value.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit();
  };

  if (isCompact) {
    return (
      <form className={styles.compact} onSubmit={handleSubmit}>
        <Avatar src={avatarUrl} size={50} />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '답글 게시하기'}
          className={styles.compactInput}
          disabled={disabled}
        />
        <Button type="submit" size="md" disabled={!canSubmit}>
          {submitLabel ?? '답글'}
        </Button>
      </form>
    );
  }

  return (
    <form className={styles.default} onSubmit={handleSubmit}>
      <Avatar src={avatarUrl} size={50} />
      <div className={styles.body}>
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? '무슨 일이 일어나고 있나요?'}
          className={styles.textarea}
          rows={2}
          disabled={disabled}
        />
        <div className={styles.footer}>
          <div className={styles.toolbar}>
            {TOOLBAR_ICONS.map((name) => (
              <Icon key={name} name={name} size={20} className={styles.toolbarIcon} />
            ))}
          </div>
          <Button type="submit" size="md" disabled={!canSubmit}>
            {submitLabel ?? '게시하기'}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default ComposeBox;
