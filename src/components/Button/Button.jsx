import styles from './Button.module.css';

function Button({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  type = 'button',
  disabled = false,
  className,
  children,
  ...rest
}) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classNames} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

export default Button;
