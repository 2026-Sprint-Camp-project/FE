import Icon from '../Icon/Icon';
import styles from './SearchBar.module.css';

/**
 * 공통 검색창. Figma `Search Bar`(380x48, bg/secondary pill)에 대응한다.
 *
 * @param {{
 *   value: string,
 *   onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
 *   onSubmit?: (value: string) => void,
 *   placeholder?: string,
 *   className?: string,
 * }} props
 */
function SearchBar({ value, onChange, onSubmit, placeholder = '검색어를 입력하세요', className }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(value);
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={className ? `${styles.searchBar} ${className}` : styles.searchBar}
    >
      <Icon name="search" size={18} color="var(--text-secondary)" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
    </form>
  );
}

export default SearchBar;
