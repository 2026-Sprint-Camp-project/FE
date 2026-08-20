import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar/SearchBar';
import UserRow from '../../components/UserRow/UserRow';
import { searchUsers } from '../../api/users';
import styles from './SearchPage.module.css';

const DEBOUNCE_MS = 350;

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const debounceRef = useRef(null);

  const runSearch = (rawKeyword) => {
    const trimmed = rawKeyword.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    searchUsers(trimmed)
      .then((data) => setResults(data.users ?? []))
      .catch((err) => setError(err.message || '검색에 실패했습니다.'))
      .finally(() => setIsLoading(false));
  };

  // 입력할 때마다 debounce로 자동 검색 + URL의 ?q= 동기화
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setSearchParams(keyword.trim() ? { q: keyword } : {}, { replace: true });
      runSearch(keyword);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleSubmit = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchParams(value.trim() ? { q: value } : {}, { replace: true });
    runSearch(value);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <SearchBar
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSubmit={handleSubmit}
          placeholder="사용자 검색"
        />
      </header>

      <div className={styles.results}>
        {isLoading && <p className={styles.statusMessage}>검색 중…</p>}

        {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <p className={styles.statusMessage}>
            '{keyword.trim()}'에 대한 검색 결과가 없습니다.
          </p>
        )}

        {!isLoading && !hasSearched && (
          <p className={styles.statusMessage}>아이디나 이름으로 사용자를 검색해보세요.</p>
        )}

        {!isLoading &&
          !error &&
          results.map((user) => (
            <UserRow
              key={user.username}
              avatarUrl={user.profileImageUrl}
              name={user.name}
              username={user.username}
              onClick={() => navigate(`/${user.username}`)}
            />
          ))}
      </div>
    </div>
  );
}

export default SearchPage;
