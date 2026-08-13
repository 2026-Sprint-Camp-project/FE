import styles from './Input.module.css';

/**
 * 공통 인풋 컴포넌트. Figma 마스터 컴포넌트 `Input Field`(라벨 + 값 세로 배치)에 대응한다.
 * Login/Signup 페이지의 `.field` 패턴을 그대로 컴포넌트로 추출한 것.
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *   type?: string,
 *   name?: string,
 *   placeholder?: string,
 *   error?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   autoComplete?: string,
 *   className?: string,
 * }} props
 */
function Input({
  id,
  label,
  value,
  onChange,
  type = 'text',
  name,
  placeholder,
  error,
  disabled = false,
  required = false,
  autoComplete,
  className,
  ...rest
}) {
  return (
    <div className={className}>
      <div className={`${styles.field} ${error ? styles.fieldError : ''}`}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <input
          id={id}
          name={name ?? id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={styles.input}
          {...rest}
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}

export default Input;
