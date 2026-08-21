import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import ToggleSwitch from '../../components/ToggleSwitch/ToggleSwitch';
import Modal from '../../components/Modal/Modal';
import EditFieldModal from '../../components/EditFieldModal/EditFieldModal';
import * as listsApi from '../../api/lists';
import styles from './ListsPage.module.css';

const EMPTY_CREATE_FORM = { listName: '', description: '', isPrivate: false };

function ListsPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editingList, setEditingList] = useState(null); // 이름 수정 중인 리스트
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    listsApi
      .getMyLists()
      .then((data) => {
        if (!cancelled) setLists(data.lists ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || '리스트를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateModal = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateError('');
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (isCreating) return;
    setIsCreateOpen(false);
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!createForm.listName.trim()) {
      setCreateError('리스트 이름을 입력해주세요.');
      return;
    }

    setCreateError('');
    setIsCreating(true);
    try {
      const data = await listsApi.createList({
        listName: createForm.listName,
        description: createForm.description,
        isPrivate: createForm.isPrivate,
      });
      setLists((prev) => [data.list, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err.message || '리스트 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = (list) => {
    setEditingList(list);
    setEditValue(list.listName);
    setEditError('');
  };

  const closeEditModal = () => {
    if (isEditing) return;
    setEditingList(null);
  };

  const handleEditConfirm = async () => {
    if (!editingList) return;
    if (!editValue.trim()) {
      setEditError('리스트 이름을 입력해주세요.');
      return;
    }

    setEditError('');
    setIsEditing(true);
    try {
      const data = await listsApi.updateList(editingList.listId, {
        listName: editValue,
      });
      setLists((prev) =>
        prev.map((l) => (l.listId === editingList.listId ? data.list : l)),
      );
      setEditingList(null);
    } catch (err) {
      setEditError(err.message || '리스트 수정에 실패했습니다.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (list) => {
    if (!window.confirm(`'${list.listName}' 리스트를 삭제할까요?`)) return;

    setDeletingId(list.listId);
    try {
      await listsApi.deleteList(list.listId);
      setLists((prev) => prev.filter((l) => l.listId !== list.listId));
    } catch (err) {
      window.alert(err.message || '리스트 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <p className={styles.title}>리스트</p>
        {lists.length > 0 && (
          <Button size="md" onClick={openCreateModal}>
            새 리스트 만들기
          </Button>
        )}
      </header>

      {isLoading && <p className={styles.statusMessage}>불러오는 중…</p>}

      {!isLoading && error && <p className={styles.errorMessage}>{error}</p>}

      {!isLoading && !error && lists.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>아직 만든 리스트가 없어요</p>
          <p className={styles.emptyDescription}>
            관심 있는 사람들을 리스트로 모아 보세요.
          </p>
          <Button onClick={openCreateModal}>새 리스트 만들기</Button>
        </div>
      )}

      {!isLoading && !error && lists.length > 0 && (
        <div className={styles.list}>
          {lists.map((list) => (
            <div key={list.listId} className={styles.row}>
              <button
                type="button"
                className={styles.rowMain}
                onClick={() => navigate(`/lists/${list.listId}`, { state: { list } })}
              >
                <p className={styles.rowTitle}>
                  {list.listName}
                  {list.isPrivate && <span className={styles.badge}>비공개</span>}
                </p>
                {list.description && (
                  <p className={styles.rowDescription}>{list.description}</p>
                )}
              </button>
              <button
                type="button"
                className={styles.editButton}
                aria-label={`${list.listName} 이름 수정`}
                onClick={() => openEditModal(list)}
              >
                수정
              </button>
              <button
                type="button"
                className={styles.deleteButton}
                aria-label={`${list.listName} 삭제`}
                disabled={deletingId === list.listId}
                onClick={() => handleDelete(list)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <Modal onClose={closeCreateModal} title="새 리스트 만들기">
          <form className={styles.createForm} onSubmit={handleCreateSubmit}>
            <Input
              id="listName"
              name="listName"
              label="리스트 이름"
              value={createForm.listName}
              onChange={handleCreateChange}
              required
            />
            <Input
              id="description"
              name="description"
              label="설명 (선택)"
              value={createForm.description}
              onChange={handleCreateChange}
            />
            <div className={styles.privacyRow}>
              <span className={styles.privacyLabel}>비공개 리스트</span>
              <ToggleSwitch
                checked={createForm.isPrivate}
                onChange={(next) =>
                  setCreateForm((prev) => ({ ...prev, isPrivate: next }))
                }
              />
            </div>

            {createError && <p className={styles.errorMessage}>{createError}</p>}

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={closeCreateModal}
                disabled={isCreating}
              >
                취소
              </Button>
              <Button type="submit" disabled={isCreating}>
                만들기
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {editingList && (
        <EditFieldModal
          title="리스트 이름 수정"
          fieldProps={{
            id: 'editListName',
            label: '리스트 이름',
            value: editValue,
            onChange: (e) => setEditValue(e.target.value),
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

export default ListsPage;
