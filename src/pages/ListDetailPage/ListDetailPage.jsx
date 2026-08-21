import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import UserRow from '../../components/UserRow/UserRow';
import SearchBar from '../../components/SearchBar/SearchBar';
import Button from '../../components/Button/Button';
import EditFieldModal from '../../components/EditFieldModal/EditFieldModal';
import * as listsApi from '../../api/lists';
import { searchUsers } from '../../api/users';
import styles from './ListDetailPage.module.css';

const DEBOUNCE_MS = 350;

// 멤버 응답이 유저 객체를 그대로 줄 수도, { user: {...} } 형태로 감싸서 줄 수도 있어
// 두 경우 모두 대응한다.
function toMemberUser(member) {
  return member.user ?? member;
}

/** 리스트 상세 화면: 리스트 이름/설명 확인, 이름 수정/삭제, 멤버 추가/조회/삭제 */
function ListDetailPage() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [list, setList] = useState(location.state?.list ?? null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [addingUsername, setAddingUsername] = useState(null);
  const debounceRef = useRef(null);

  // 목록 화면에서 넘어올 땐 state로 리스트 정보를 받지만, 새로고침 등으로
  // state가 없을 땐 내 리스트 목록에서 같은 id를 찾아 보충한다.
  useEffect(() => {
    if (list) return;
    listsApi
      .getMyLists()
      .then((data) => {
        const found = (data.lists ?? []).find(
          (l) => String(l.listId) === String(listId),
        );
        if (found) setList(found);
      })
      .catch(() => {});
  }, [listId, list]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    listsApi
      .getListMembers(listId)
      .then((data) => {
        if (!cancelled) setMembers(data.members ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '멤버를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [listId]);

  // 멤버 추가용 유저 검색 (SearchPage와 동일한 debounce 패턴)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = keyword.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchError('');
      return undefined;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      setSearchError('');
      searchUsers(trimmed)
        .then((data) => setSearchResults(data.users ?? []))
        .catch((err) => setSearchError(err.message || '검색에 실패했습니다.'))
        .finally(() => setIsSearching(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [keyword]);

  const isMember = (user) =>
    members.some((member) => toMemberUser(member).username === user.username);

  const handleAddMember = async (user) => {
    setAddingUsername(user.username);
    try {
      await listsApi.addListMember(listId, user.username);
      setMembers((prev) => [...prev, user]);
    } catch (err) {
      window.alert(err.message || '멤버 추가에 실패했습니다.');
    } finally {
      setAddingUsername(null);
    }
  };

  const handleRemoveMember = async (member) => {
    const memberUser = toMemberUser(member);
    const memberId = memberUser.userId ?? memberUser.user_id;
    if (!window.confirm(`@${memberUser.username}님을 리스트에서 뺄까요?`)) return;

    try {
      await listsApi.removeListMember(listId, memberId);
      setMembers((prev) =>
        prev.filter((m) => toMemberUser(m).username !== memberUser.username),
      );
    } catch (err) {
      window.alert(err.message || '멤버 삭제에 실패했습니다.');
    }
  };

  const openEditModal = () => {
    if (!list) return;
    setEditValue(list.listName);
    setEditError('');
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    if (isEditing) return;
    setIsEditOpen(false);
  };

  const handleEditConfirm = async () => {
    if (!editValue.trim()) {
      setEditError('리스트 이름을 입력해주세요.');
      return;
    }

    setEditError('');
    setIsEditing(true);
    try {
      const data = await listsApi.updateList(listId, { listName: editValue });
      setList(data.list);
      setIsEditOpen(false);
    } catch (err) {
      setEditError(err.message || '리스트 수정에 실패했습니다.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('이 리스트를 삭제할까요?')) return;

    setIsDeleting(true);
    try {
      await listsApi.deleteList(listId);
      navigate('/lists', { replace: true });
    } catch (err) {
      window.alert(err.message || '리스트 삭제에 실패했습니다.');
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ←
        </button>
        <div className={styles.headerText}>
          <p className={styles.title}>
            {list?.listName ?? '리스트'}
            {list?.isPrivate && <span className={styles.badge}>비공개</span>}
          </p>
          {list?.description && (
            <p className={styles.description}>{list.description}</p>
          )}
        </div>
      </header>

      {list && (
        <div className={styles.listActions}>
          <Button variant="secondary" size="md" onClick={openEditModal}>
            이름 수정
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleDeleteList}
            disabled={isDeleting}
          >
            리스트 삭제
          </Button>
        </div>
      )}

      <section className={styles.addSection}>
        <p className={styles.sectionTitle}>멤버 추가</p>
        <SearchBar
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="추가할 사용자 검색"
        />

        {isSearching && <p className={styles.statusMessage}>검색 중…</p>}
        {!isSearching && searchError && (
          <p className={styles.errorMessage}>{searchError}</p>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((user) => {
              const added = isMember(user);
              return (
                <UserRow
                  key={user.username}
                  avatarUrl={user.profileImageUrl}
                  name={user.name}
                  username={user.username}
                  trailing={
                    <button
                      type="button"
                      className={added ? styles.addedButton : styles.addButton}
                      disabled={added || addingUsername === user.username}
                      onClick={() => handleAddMember(user)}
                    >
                      {added ? '추가됨' : '추가'}
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.membersSection}>
        <p className={styles.sectionTitle}>
          멤버{members.length > 0 ? ` (${members.length})` : ''}
        </p>

        {isLoading && <p className={styles.statusMessage}>불러오는 중…</p>}
        {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}

        {!isLoading && !error && members.length === 0 && (
          <p className={styles.emptyState}>아직 추가한 멤버가 없어요.</p>
        )}

        {!isLoading && !error && members.length > 0 && (
          <div className={styles.list}>
            {members.map((member) => {
              const memberUser = toMemberUser(member);
              return (
                <UserRow
                  key={memberUser.userId ?? memberUser.username}
                  avatarUrl={memberUser.profileImageUrl}
                  name={memberUser.name}
                  username={memberUser.username}
                  onClick={() => navigate(`/${memberUser.username}`)}
                  trailing={
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveMember(member)}
                    >
                      삭제
                    </button>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {isEditOpen && (
        <EditFieldModal
          title="리스트 이름 수정"
          fieldProps={{
            id: 'editListName',
            label: '리스트 이름',
            value: editValue,
            onChange: (event) => setEditValue(event.target.value),
            error: editError,
          }}
          confirmText="저장"
          onCancel={closeEditModal}
          onConfirm={handleEditConfirm}
          isSubmitting={isEditing}
        />
      )}
    </div>
  );
}

export default ListDetailPage;
