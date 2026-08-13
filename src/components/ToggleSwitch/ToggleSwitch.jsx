import styles from './ToggleSwitch.module.css';

/**
 * 공통 토글 스위치 컴포넌트. Figma `Toggle Track`(44x24)에 대응한다.
 * 설정 화면의 "비공개 계정" 같은 on/off 항목에 쓴다.
 *
 * @param {{ checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean, label?: string }} props
 */
function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`${styles.track} ${checked ? styles.checked : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}

export default ToggleSwitch;
