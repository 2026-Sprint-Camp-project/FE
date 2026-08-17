import { useCallback, useEffect, useState } from 'react';
import { getFollowers, getFollowing } from '../api/relations';

/**
 * 팔로워/팔로잉 목록을 커서 페이지네이션으로 불러오는 공용 훅.
 * FollowersPage/FollowingPage가 mode만 다르게 넘겨서 재사용한다.
 *
 * @param {string} username
 * @param {'followers' | 'following'} mode
 */
export function useFollowList(username, mode) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPage = mode === 'followers' ? getFollowers : getFollowing;
  const listKey = mode === 'followers' ? 'followers' : 'following';

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setIsLoading(true);
    setError('');

    fetchPage(username)
      .then((data) => {
        if (cancelled) return;
        setItems(data[listKey] ?? []);
        setNextCursor(data.nextCursor ?? null);
        setHasNext(Boolean(data.hasNext));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, mode]);

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoading) return;
    setIsLoading(true);
    try {
      const data = await fetchPage(username, { cursor: nextCursor });
      setItems((prev) => [...prev, ...(data[listKey] ?? [])]);
      setNextCursor(data.nextCursor ?? null);
      setHasNext(Boolean(data.hasNext));
    } catch (err) {
      setError(err.message || '목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, nextCursor, hasNext, isLoading]);

  return { items, hasNext, isLoading, error, loadMore };
}
